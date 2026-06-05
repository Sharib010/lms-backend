const { Redis } = require('ioredis')
const logger    = require('./logger')

let redisClient = null

const connectRedis = async () => {
  const url = process.env.REDIS_URL || 'redis://localhost:6379'

  redisClient = new Redis(url, {
    lazyConnect:           true,
    maxRetriesPerRequest:  null,
    enableOfflineQueue:    false,
    retryStrategy:         () => null, // disable auto-reconnect on startup failure
  })

  redisClient.on('connect', () => logger.info('✅ Redis connected'))
  redisClient.on('error',   (err) => logger.warn(`Redis warning: ${err.message}`))

  try {
    await redisClient.connect()
  } catch (err) {
    logger.warn(`⚠️  Redis unavailable (${err.message}). Background jobs disabled — core API is unaffected.`)
    redisClient = null
  }

  return redisClient
}

const getRedis = () => redisClient

module.exports = { connectRedis, getRedis }
