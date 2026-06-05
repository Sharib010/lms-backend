const Tenant     = require('../src/models/Tenant.model')
const Role       = require('../src/models/Role.model')
const Permission = require('../src/models/Permission.model')
const { ROLES }  = require('../src/constants/roles.constants')
const { ACTIONS, RESOURCES } = require('../src/constants/permissions.constants')
const logger = require('../src/config/logger')

const ROLE_DEFINITIONS = [
  {
    slug: ROLES.ORG_ADMIN,
    name: 'Organisation Admin',
    description: 'Manages the organisation, users, courses and compliance',
    permissionFilters: [
      { action: ACTIONS.MANAGE,  resource: RESOURCES.USER },
      { action: ACTIONS.CREATE,  resource: RESOURCES.USER },
      { action: ACTIONS.READ,    resource: RESOURCES.USER },
      { action: ACTIONS.UPDATE,  resource: RESOURCES.USER },
      { action: ACTIONS.DELETE,  resource: RESOURCES.USER },
      { action: ACTIONS.IMPORT,  resource: RESOURCES.USER },
      { action: ACTIONS.ASSIGN,  resource: RESOURCES.ROLE },
      { action: ACTIONS.CREATE,  resource: RESOURCES.COURSE },
      { action: ACTIONS.READ,    resource: RESOURCES.COURSE },
      { action: ACTIONS.UPDATE,  resource: RESOURCES.COURSE },
      { action: ACTIONS.DELETE,  resource: RESOURCES.COURSE },
      { action: ACTIONS.PUBLISH, resource: RESOURCES.COURSE },
      { action: ACTIONS.ENROLL,  resource: RESOURCES.ENROLLMENT },
      { action: ACTIONS.READ,    resource: RESOURCES.CERTIFICATE },
      { action: ACTIONS.CREATE,  resource: RESOURCES.CERTIFICATE },
      { action: ACTIONS.READ,    resource: RESOURCES.REPORT },
      { action: ACTIONS.EXPORT,  resource: RESOURCES.REPORT },
    ],
  },
  {
    slug: ROLES.INSTRUCTOR,
    name: 'Instructor',
    description: 'Creates and manages courses and assessments',
    permissionFilters: [
      { action: ACTIONS.CREATE,  resource: RESOURCES.COURSE },
      { action: ACTIONS.READ,    resource: RESOURCES.COURSE },
      { action: ACTIONS.UPDATE,  resource: RESOURCES.COURSE },
      { action: ACTIONS.PUBLISH, resource: RESOURCES.COURSE },
      { action: ACTIONS.CREATE,  resource: RESOURCES.ASSESSMENT },
      { action: ACTIONS.READ,    resource: RESOURCES.ASSESSMENT },
    ],
  },
  {
    slug: ROLES.CONTENT_CREATOR,
    name: 'Content Creator',
    description: 'Creates course content and learning paths',
    permissionFilters: [
      { action: ACTIONS.CREATE, resource: RESOURCES.COURSE },
      { action: ACTIONS.READ,   resource: RESOURCES.COURSE },
      { action: ACTIONS.UPDATE, resource: RESOURCES.COURSE },
    ],
  },
  {
    slug: ROLES.LEARNER,
    name: 'Learner',
    description: 'Enrolls in and completes courses',
    permissionFilters: [
      { action: ACTIONS.READ,    resource: RESOURCES.COURSE },
      { action: ACTIONS.ENROLL,  resource: RESOURCES.ENROLLMENT },
      { action: ACTIONS.ATTEMPT, resource: RESOURCES.ATTEMPT },
      { action: ACTIONS.READ,    resource: RESOURCES.CERTIFICATE },
    ],
  },
  {
    slug: ROLES.HR_MANAGER,
    name: 'HR / L&D Manager',
    description: 'Oversees compliance and skill development',
    permissionFilters: [
      { action: ACTIONS.READ,   resource: RESOURCES.USER },
      { action: ACTIONS.ASSIGN, resource: RESOURCES.ROLE },
      { action: ACTIONS.READ,   resource: RESOURCES.REPORT },
      { action: ACTIONS.EXPORT, resource: RESOURCES.REPORT },
    ],
  },
  {
    slug: ROLES.AUDITOR,
    name: 'Compliance Auditor',
    description: 'Read-only access to certificates and audit logs',
    permissionFilters: [
      { action: ACTIONS.READ, resource: RESOURCES.CERTIFICATE },
      { action: ACTIONS.READ, resource: RESOURCES.AUDIT_LOG },
      { action: ACTIONS.READ, resource: RESOURCES.REPORT },
    ],
  },
]

async function run() {
  const tenant = await Tenant.findOne({ slug: 'gortt' })
  if (!tenant) {
    logger.warn('⚠️  Default tenant not found — run tenant seed first')
    return
  }

  for (const def of ROLE_DEFINITIONS) {
    // Resolve permissions
    const permIds = []
    for (const filter of def.permissionFilters) {
      const perm = await Permission.findOne(filter)
      if (perm) permIds.push(perm._id)
    }

    await Role.findOneAndUpdate(
      { slug: def.slug, tenantId: tenant._id },
      {
        slug:        def.slug,
        name:        def.name,
        description: def.description,
        tenantId:    tenant._id,
        permissions: permIds,
        isSystem:    true,
      },
      { upsert: true, new: true }
    )
    logger.info(`  ✓ Role: ${def.name} (${def.slug})`)
  }
  logger.info(`✅ Roles seeded for tenant: ${tenant.name}`)
}

module.exports = { run }
