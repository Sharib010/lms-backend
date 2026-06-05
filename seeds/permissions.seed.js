const Permission = require('../src/models/Permission.model')
const { ACTIONS, RESOURCES } = require('../src/constants/permissions.constants')
const logger = require('../src/config/logger')

const PERMISSIONS = [
  // Super admin — all
  { action: ACTIONS.MANAGE, resource: RESOURCES.ALL },
  // Tenant management
  { action: ACTIONS.CREATE,  resource: RESOURCES.TENANT },
  { action: ACTIONS.READ,    resource: RESOURCES.TENANT },
  { action: ACTIONS.UPDATE,  resource: RESOURCES.TENANT },
  { action: ACTIONS.DELETE,  resource: RESOURCES.TENANT },
  // User management
  { action: ACTIONS.CREATE,  resource: RESOURCES.USER },
  { action: ACTIONS.READ,    resource: RESOURCES.USER },
  { action: ACTIONS.UPDATE,  resource: RESOURCES.USER },
  { action: ACTIONS.DELETE,  resource: RESOURCES.USER },
  { action: ACTIONS.IMPORT,  resource: RESOURCES.USER },
  { action: ACTIONS.ASSIGN,  resource: RESOURCES.ROLE },
  // Course management
  { action: ACTIONS.CREATE,  resource: RESOURCES.COURSE },
  { action: ACTIONS.READ,    resource: RESOURCES.COURSE },
  { action: ACTIONS.UPDATE,  resource: RESOURCES.COURSE },
  { action: ACTIONS.DELETE,  resource: RESOURCES.COURSE },
  { action: ACTIONS.PUBLISH, resource: RESOURCES.COURSE },
  { action: ACTIONS.ENROLL,  resource: RESOURCES.ENROLLMENT },
  // Assessment
  { action: ACTIONS.CREATE,  resource: RESOURCES.ASSESSMENT },
  { action: ACTIONS.ATTEMPT, resource: RESOURCES.ATTEMPT },
  // Certificate
  { action: ACTIONS.READ,    resource: RESOURCES.CERTIFICATE },
  { action: ACTIONS.CREATE,  resource: RESOURCES.CERTIFICATE },
  // Reports & Audit
  { action: ACTIONS.READ,    resource: RESOURCES.REPORT },
  { action: ACTIONS.EXPORT,  resource: RESOURCES.REPORT },
  { action: ACTIONS.READ,    resource: RESOURCES.AUDIT_LOG },
]

async function run() {
  let created = 0
  for (const p of PERMISSIONS) {
    await Permission.findOneAndUpdate(
      { action: p.action, resource: p.resource },
      p,
      { upsert: true, new: true }
    )
    created++
  }
  logger.info(`✅ Permissions seeded: ${created} permissions`)
}

module.exports = { run }
