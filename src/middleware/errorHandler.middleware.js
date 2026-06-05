const logger = require('../config/logger')

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500
  const message    = err.message || 'Internal Server Error'

  if (statusCode >= 500) logger.error({ err, requestId: req.requestId, url: req.originalUrl })

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = { errorHandler }
