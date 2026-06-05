require('dotenv').config()
const app             = require('../src/app')
const { connectDatabase } = require('../src/config/database')
const { connectRedis }    = require('../src/config/redis')
const logger          = require('../src/config/logger')

let _initialized  = false
let _initError    = null

const init = async () => {
  if (_initialized) return
  if (_initError)   throw _initError   // surface cached error immediately

  try {
    await connectDatabase()
    await connectRedis()
    _initialized = true
    logger.info('✅ Serverless init complete')
  } catch (err) {
    _initError = err                   // cache so next invocation sees it too
    logger.error('❌ Serverless init failed:', err.message)
    throw err
  }
}

module.exports = async (req, res) => {
  try {
    await init()
    return app(req, res)
  } catch (err) {
    const isDev = process.env.NODE_ENV !== 'production'
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable — startup failed',
      ...(isDev && { error: err.message, hint: 'Check MONGODB_URI and other required env vars in Vercel dashboard' }),
    })
  }
}
