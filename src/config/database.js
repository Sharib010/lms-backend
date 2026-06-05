const mongoose = require('mongoose')
const logger   = require('./logger')

// Reuse the connection across warm serverless invocations
const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined in environment')

  // Already connected — skip (critical for serverless warm starts)
  if (mongoose.connection.readyState === 1) {
    logger.info('✅ MongoDB already connected (reusing)')
    return
  }

  const maxRetries = process.env.VERCEL ? 1 : 5   // fast-fail in serverless
  const delayMs    = 3000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri, {
        maxPoolSize:              process.env.VERCEL ? 5 : 10,
        serverSelectionTimeoutMS: 8000,   // fail fast on Vercel cold start
        socketTimeoutMS:          30000,
        bufferCommands:           false,  // don't buffer queries before connected
      })
      logger.info('✅ MongoDB connected')
      return
    } catch (err) {
      if (attempt === maxRetries) {
        logger.error(`❌ MongoDB connection failed: ${err.message}`)
        throw err
      }
      logger.warn(`⚠️  MongoDB attempt ${attempt}/${maxRetries} failed — retrying in ${delayMs / 1000}s…`)
      await new Promise(r => setTimeout(r, delayMs))
    }
  }
}

module.exports = { connectDatabase }
