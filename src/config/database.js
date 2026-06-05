const mongoose = require('mongoose')
const logger   = require('./logger')

const connectDatabase = async (retries = 5, delayMs = 3000) => {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined in environment')

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
      logger.info('✅ MongoDB connected')
      return
    } catch (err) {
      if (attempt === retries) {
        logger.error(`❌ MongoDB connection failed after ${retries} attempts: ${err.message}`)
        throw err
      }
      logger.warn(`⚠️  MongoDB attempt ${attempt}/${retries} failed — retrying in ${delayMs / 1000}s… (${err.message})`)
      await new Promise(r => setTimeout(r, delayMs))
    }
  }
}

module.exports = { connectDatabase }
