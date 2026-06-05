const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const User = require('../models/User.model')
const UserRole = require('../models/UserRole.model')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.userId).select('-password')
    if (!user || !user.isActive || user.isDeleted) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found or inactive' })
    }

    // Load roles for this tenant
    const tenantId = req.tenant?._id || decoded.tenantId
    const userRoles = await UserRole.find({ userId: user._id, tenantId }).populate({
      path: 'roleId',
      populate: { path: 'permissions' },
    })

    req.user = user
    req.userRoles = userRoles
    req.roles = userRoles.map(ur => ur.roleId?.slug).filter(Boolean)
    req.permissions = userRoles.flatMap(ur => ur.roleId?.permissions || [])
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token expired' })
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' })
  }
}

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return next()
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')
    if (user?.isActive && !user.isDeleted) req.user = user
  } catch (_) { /* ignore */ }
  next()
}

module.exports = { authenticate, optionalAuth }
