const ROLES = {
  SUPER_ADMIN:     'super_admin',
  ORG_ADMIN:       'org_admin',
  INSTRUCTOR:      'instructor',
  CONTENT_CREATOR: 'content_creator',
  LEARNER:         'learner',
  HR_MANAGER:      'hr_manager',
  AUDITOR:         'auditor',
}

const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ORG_ADMIN,
  ROLES.INSTRUCTOR,
  ROLES.CONTENT_CREATOR,
  ROLES.HR_MANAGER,
  ROLES.AUDITOR,
  ROLES.LEARNER,
]

module.exports = { ROLES, ROLE_HIERARCHY }
