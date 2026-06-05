const User   = require('../src/models/User.model')
const logger = require('../src/config/logger')

async function run() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@gortt.gov.tt'
  const exists = await User.findOne({ email, isSuperAdmin: true })
  if (exists) {
    logger.info(`⏩ Super admin already exists: ${email}`)
    return
  }

  const user = await User.create({
    firstName:       'Michael',
    lastName:        'Oderson',
    email,
    password:        process.env.SUPER_ADMIN_PASSWORD || 'Admin@1234!',
    isSuperAdmin:    true,
    isEmailVerified: true,
    isActive:        true,
  })
  logger.info(`✅ Super admin created: ${user.email}`)
  logger.info(`   Password: ${process.env.SUPER_ADMIN_PASSWORD || 'Admin@1234!'}  ← CHANGE IN PRODUCTION`)
}

module.exports = { run }
