require('dotenv').config()
const app            = require('../src/app')
const { connectDatabase } = require('../src/config/database')
const { connectRedis }    = require('../src/config/redis')
const logger         = require('../src/config/logger')

// Module-level cache — reused across warm Vercel invocations
let _initialized = false

const init = async () => {
  if (_initialized) return
  await connectDatabase()
  await connectRedis()
  _initialized = true
  logger.info('✅ Serverless init complete')
}

// Vercel invokes this handler for every request
module.exports = async (req, res) => {
  await init()
  return app(req, res)
}
