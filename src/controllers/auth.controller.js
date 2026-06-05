const { StatusCodes } = require('http-status-codes')
const authService = require('../services/auth.service')
const { success, error } = require('../utils/response.util')

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
  path:     '/',
}

/* ─── Register ──────────────────────────────────────────────────────────── */
const register = async (req, res) => {
  const tenantId = req.tenant?._id || null

  const { user, verifyToken } = await authService.register({
    ...req.body,
    tenantId,
  })

  // TODO: queue email: if (verifyToken) sendVerificationEmail(user, verifyToken)

  const isDev = process.env.NODE_ENV !== 'production'
  success(
    res,
    {
      userId: user._id,
      email:  user.email,
      isEmailVerified: user.isEmailVerified,
      ...(isDev && verifyToken && { devVerifyToken: verifyToken }),
    },
    isDev
      ? 'Account created! (Dev mode: email auto-verified)'
      : 'Account created! Please check your email to verify your account.',
    StatusCodes.CREATED
  )
}

/* ─── Login ─────────────────────────────────────────────────────────────── */
const login = async (req, res) => {
  const tenantId   = req.tenant?._id || null
  const ipAddress  = req.ip
  const deviceInfo = req.headers['user-agent']

  const result = await authService.login({
    ...req.body,
    tenantId,
    ipAddress,
    deviceInfo,
  })

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS)

  success(res, {
    accessToken: result.accessToken,
    user:        result.user,
    roles:       result.roles,
    tenant:      req.tenant ? { _id: req.tenant._id, name: req.tenant.name, slug: req.tenant.slug } : null,
  }, 'Login successful')
}

/* ─── Refresh ────────────────────────────────────────────────────────────── */
const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken
  if (!token) return error(res, 'No refresh token provided', StatusCodes.UNAUTHORIZED)

  const result = await authService.refreshTokens(token, req.ip)
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS)
  success(res, { accessToken: result.accessToken }, 'Token refreshed')
}

/* ─── Logout ─────────────────────────────────────────────────────────────── */
const logout = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken
  await authService.logout(token)
  res.clearCookie('refreshToken', { path: '/' })
  success(res, null, 'Logged out successfully')
}

/* ─── Verify email ───────────────────────────────────────────────────────── */
const verifyEmail = async (req, res) => {
  const user = await authService.verifyEmail(req.params.token)
  success(res, { email: user.email }, 'Email verified successfully. You can now log in.')
}

/* ─── Resend verification ────────────────────────────────────────────────── */
const resendVerification = async (req, res) => {
  const tenantId = req.tenant?._id || null
  await authService.resendVerification(req.body.email, tenantId)
  // Always 200 — don't reveal if email exists
  success(res, null, 'If that email is registered and unverified, a new verification link has been sent.')
}

/* ─── Forgot password ────────────────────────────────────────────────────── */
const forgotPassword = async (req, res) => {
  const tenantId = req.tenant?._id || null
  const result   = await authService.forgotPassword(req.body.email, tenantId)

  // TODO: queue email: if (result) sendPasswordResetEmail(result.user, result.token)
  const isDev = process.env.NODE_ENV !== 'production'

  success(res, isDev && result ? { devResetToken: result.token } : null,
    'If that email exists, a password reset link has been sent.')
}

/* ─── Reset password ─────────────────────────────────────────────────────── */
const resetPassword = async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password)
  success(res, null, 'Password reset successfully. You can now log in with your new password.')
}

/* ─── Change password ────────────────────────────────────────────────────── */
const changePassword = async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword)
  success(res, null, 'Password changed successfully. Please log in again.')
}

/* ─── Me ─────────────────────────────────────────────────────────────────── */
const me = async (req, res) => {
  success(res, {
    ...req.user.toObject ? req.user.toObject() : req.user,
    roles:       req.roles,
    permissions: req.permissions?.map(p => `${p.action}:${p.resource}`) || [],
    tenant:      req.tenant ? { _id: req.tenant._id, name: req.tenant.name, slug: req.tenant.slug, branding: req.tenant.branding } : null,
  }, 'Profile fetched')
}

module.exports = { register, login, refresh, logout, verifyEmail, resendVerification, forgotPassword, resetPassword, changePassword, me }
