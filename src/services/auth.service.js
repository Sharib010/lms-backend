const dayjs  = require('dayjs')
const User   = require('../models/User.model')
const UserRole = require('../models/UserRole.model')
const Role   = require('../models/Role.model')
const RefreshToken = require('../models/RefreshToken.model')
const PasswordResetToken = require('../models/PasswordResetToken.model')
const { generateAccessToken, generateRefreshToken, revokeRefreshToken, revokeAllUserTokens } = require('../utils/jwt.util')
const { generateSecureToken, hashToken } = require('../utils/crypto.util')
const { ROLES } = require('../constants/roles.constants')

const isDev = process.env.NODE_ENV !== 'production'

/* ─── Register ──────────────────────────────────────────────────────────── */
const register = async ({ tenantId, firstName, lastName, email, phone, password, role = ROLES.LEARNER, category }) => {
  // Check duplicate email within tenant
  const query = { email }
  if (tenantId) query.tenantId = tenantId
  const exists = await User.findOne(query)
  if (exists) {
    throw Object.assign(new Error('An account with this email already exists'), { statusCode: 409 })
  }

  // Build verify token (skipped in dev — auto-verify instead)
  const verifyToken  = generateSecureToken()
  const verifyExpiry = dayjs().add(24, 'hour').toDate()

  const user = await User.create({
    tenantId:            tenantId || null,
    firstName:           firstName.trim(),
    lastName:            lastName.trim(),
    email:               email.toLowerCase().trim(),
    phone:               phone || undefined,
    password,
    // Auto-verify in dev; require email verification in production
    isEmailVerified:     isDev ? true : false,
    emailVerifyToken:    isDev ? undefined : hashToken(verifyToken),
    emailVerifyExpires:  isDev ? undefined : verifyExpiry,
    customFields:        category ? new Map([['category', category]]) : undefined,
  })

  // Assign role if tenant exists
  if (tenantId) {
    const validRoles = [ROLES.LEARNER, ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR]
    const assignRole = validRoles.includes(role) ? role : ROLES.LEARNER
    const roleDoc = await Role.findOne({ slug: assignRole, tenantId })
    if (roleDoc) {
      await UserRole.create({ userId: user._id, roleId: roleDoc._id, tenantId })
    }
  }

  return { user, verifyToken: isDev ? null : verifyToken }
}

/* ─── Login ─────────────────────────────────────────────────────────────── */
const login = async ({ email, tenantId, password, ipAddress, deviceInfo }) => {
  const normalizedEmail = email.toLowerCase()

  // Find user: tenant-scoped users OR super admins (who have no tenantId)
  let user = null
  if (tenantId) {
    // Prefer tenant-scoped user; fall back to super admin (platform can send tenant header)
    user = await User.findOne({ email: normalizedEmail, tenantId, isDeleted: false }).select('+password')
    if (!user) {
      user = await User.findOne({ email: normalizedEmail, isSuperAdmin: true, tenantId: null, isDeleted: false }).select('+password')
    }
  } else {
    // No tenant header — only super admins may authenticate this way
    user = await User.findOne({ email: normalizedEmail, isSuperAdmin: true, isDeleted: false }).select('+password')
  }

  // Generic error to prevent user enumeration
  const authError = Object.assign(new Error('Invalid email or password'), { statusCode: 401 })

  if (!user)            throw authError
  if (!user.isActive)   throw Object.assign(new Error('Your account has been suspended. Please contact support.'), { statusCode: 403 })
  if (user.isDeleted)   throw authError

  const valid = await user.comparePassword(password)
  if (!valid) throw authError

  // Email verification check (skip in dev)
  if (!isDev && !user.isEmailVerified && !user.isSuperAdmin) {
    throw Object.assign(new Error('Please verify your email before logging in. Check your inbox for a verification link.'), { statusCode: 403, code: 'EMAIL_NOT_VERIFIED' })
  }

  // Update last login
  user.lastLogin = new Date()
  user.lastIp    = ipAddress || null
  await user.save()

  // Load roles
  const userRoles = tenantId
    ? await UserRole.find({ userId: user._id, tenantId }).populate('roleId', 'name slug')
    : []
  const roles = userRoles.map(ur => ur.roleId?.slug).filter(Boolean)

  const accessToken  = generateAccessToken(user._id, tenantId || null, roles)
  const refreshToken = await generateRefreshToken(user._id, ipAddress, deviceInfo)

  // Clean user object (no password)
  const userObj = user.toObject()
  delete userObj.password
  delete userObj.emailVerifyToken
  delete userObj.emailVerifyExpires

  return { user: userObj, accessToken, refreshToken, roles }
}

/* ─── Refresh tokens ────────────────────────────────────────────────────── */
const refreshTokens = async (token, ipAddress) => {
  const stored = await RefreshToken.findOne({ token, isRevoked: false })
  if (!stored || stored.expiresAt < new Date()) {
    throw Object.assign(new Error('Session expired. Please login again.'), { statusCode: 401 })
  }

  const user = await User.findById(stored.userId)
  if (!user || !user.isActive || user.isDeleted) {
    throw Object.assign(new Error('Account not found or deactivated'), { statusCode: 401 })
  }

  await revokeRefreshToken(token)

  const tenantId  = user.tenantId
  const userRoles = tenantId
    ? await UserRole.find({ userId: user._id, tenantId }).populate('roleId', 'name slug')
    : []
  const roles = userRoles.map(ur => ur.roleId?.slug).filter(Boolean)

  const accessToken     = generateAccessToken(user._id, tenantId || null, roles)
  const newRefreshToken = await generateRefreshToken(user._id, ipAddress, stored.deviceInfo)
  return { accessToken, refreshToken: newRefreshToken }
}

/* ─── Logout ─────────────────────────────────────────────────────────────── */
const logout = async (refreshToken) => {
  if (refreshToken) await revokeRefreshToken(refreshToken)
}

/* ─── Verify email ──────────────────────────────────────────────────────── */
const verifyEmail = async (token) => {
  const hashed = hashToken(token)
  const user = await User.findOne({
    emailVerifyToken:   hashed,
    emailVerifyExpires: { $gt: new Date() },
  })
  if (!user) {
    throw Object.assign(new Error('Verification link is invalid or has expired. Please request a new one.'), { statusCode: 400 })
  }
  user.isEmailVerified    = true
  user.emailVerifyToken   = undefined
  user.emailVerifyExpires = undefined
  await user.save()
  return user
}

/* ─── Resend verification ───────────────────────────────────────────────── */
const resendVerification = async (email, tenantId) => {
  const query = { email: email.toLowerCase(), isDeleted: false }
  if (tenantId) query.tenantId = tenantId

  const user = await User.findOne(query)
  if (!user || user.isEmailVerified) return null // silent

  const verifyToken  = generateSecureToken()
  const verifyExpiry = dayjs().add(24, 'hour').toDate()
  user.emailVerifyToken   = hashToken(verifyToken)
  user.emailVerifyExpires = verifyExpiry
  await user.save()

  return { user, verifyToken }
}

/* ─── Forgot password ───────────────────────────────────────────────────── */
const forgotPassword = async (email, tenantId) => {
  const query = { email: email.toLowerCase(), isDeleted: false }
  if (tenantId) query.tenantId = tenantId

  const user = await User.findOne(query)
  if (!user) return null  // silent — never reveal if email exists

  const token    = generateSecureToken()
  const expiresAt = dayjs().add(1, 'hour').toDate()

  await PasswordResetToken.deleteMany({ userId: user._id })
  await PasswordResetToken.create({ userId: user._id, token: hashToken(token), expiresAt })

  return { user, token }
}

/* ─── Reset password ────────────────────────────────────────────────────── */
const resetPassword = async (token, newPassword) => {
  const hashed = hashToken(token)
  const record = await PasswordResetToken.findOne({
    token:     hashed,
    isUsed:    false,
    expiresAt: { $gt: new Date() },
  })
  if (!record) {
    throw Object.assign(new Error('Reset link is invalid or has expired. Please request a new password reset.'), { statusCode: 400 })
  }

  const user = await User.findById(record.userId).select('+password')
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 })

  user.password = newPassword
  await user.save()

  record.isUsed = true
  await record.save()

  await revokeAllUserTokens(user._id)
  return user
}

/* ─── Change password ───────────────────────────────────────────────────── */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password')
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 })

  const valid = await user.comparePassword(currentPassword)
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 401 })

  user.password = newPassword
  await user.save()
  await revokeAllUserTokens(userId)
  return user
}

module.exports = {
  register, login, refreshTokens, logout,
  verifyEmail, resendVerification,
  forgotPassword, resetPassword, changePassword,
}
