const { StatusCodes } = require('http-status-codes')

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (req.user?.isSuperAdmin) return next()
  const userRoleSlugs = req.roles || []
  const hasRole = allowedRoles.some(r => userRoleSlugs.includes(r))
  if (!hasRole) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Insufficient role' })
  }
  next()
}

const requireSuperAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Super admin access required' })
  }
  next()
}

module.exports = { requireRole, requireSuperAdmin }
