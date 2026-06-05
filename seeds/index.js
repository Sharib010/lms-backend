require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const logger   = require('../src/config/logger')

async function runSeeds() {
  await mongoose.connect(process.env.MONGODB_URI)
  logger.info('✅ Connected to MongoDB for seeding')

  await require('./tenant.seed').run()
  await require('./roles.seed').run()
  await require('./permissions.seed').run()
  await require('./superAdmin.seed').run()

  logger.info('✅ All seeds completed')
  await mongoose.disconnect()
  process.exit(0)
}

runSeeds().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
