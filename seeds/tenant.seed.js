const Tenant = require('../src/models/Tenant.model')
const logger = require('../src/config/logger')

async function run() {
  const existing = await Tenant.findOne({ slug: 'gortt' })
  if (existing) {
    logger.info('⏩ Default tenant already exists')
    return existing
  }

  const tenant = await Tenant.create({
    name:   'Government of the Republic of Trinidad and Tobago',
    slug:   'gortt',
    domain: 'gortt.gov.tt',
    plan:   'enterprise',
    status: 'active',
    branding: {
      primaryColor:   '#5C41D6',
      secondaryColor: '#1A1040',
    },
    settings: {
      mfaRequired:         false,
      ssoEnabled:          false,
      selfRegistration:    true,
      maxUsers:            10000,
      storageQuotaGB:      500,
      certificatesEnabled: true,
      marketplaceEnabled:  false,
    },
  })
  logger.info(`✅ Default tenant created: ${tenant.name} (slug: ${tenant.slug})`)
  return tenant
}

module.exports = { run }
