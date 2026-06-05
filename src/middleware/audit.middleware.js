const AuditLog = require('../models/AuditLog.model')

const audit = (action, resource) => async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        await AuditLog.create({
          tenantId:  req.tenant?._id,
          userId:    req.user?._id,
          action,
          resource,
          resourceId: req.params?.id || res.locals?.resourceId,
          metadata:  { method: req.method, url: req.originalUrl },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          requestId: req.requestId,
        })
      } catch (_) { /* non-critical */ }
    }
  })
  next()
}

module.exports = { audit }
