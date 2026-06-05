require('dotenv').config()
const mongoose        = require('mongoose')
const app             = require('../src/app')
const { connectDatabase } = require('../src/config/database')
const { connectRedis }    = require('../src/config/redis')
const logger          = require('../src/config/logger')

// Disable buffering — queries fail immediately if not connected
// instead of silently buffering for 10 s then timing out
mongoose.set('bufferCommands', false)

let _initError = null

const isConnected = () => mongoose.connection.readyState === 1

const init = async () => {
  // Already connected — reuse (happy path for warm invocations)
  if (isConnected()) return

  // A previous cold-start already failed — surface the error immediately
  if (_initError) throw _initError

  try {
    await connectDatabase()
    await connectRedis()
    logger.info('✅ Serverless init complete')
  } catch (err) {
    _initError = err
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
      message: 'Service unavailable — database not connected',
      ...(isDev && {
        error: err.message,
        hint: 'Check MONGODB_URI in Vercel env vars and whitelist 0.0.0.0/0 in MongoDB Atlas Network Access',
      }),
    })
  }
}
