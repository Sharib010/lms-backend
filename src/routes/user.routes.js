const { Router } = require('express')
const c = require('../controllers/user.controller')
const { authenticate } = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/rbac.middleware')
const { ROLES } = require('../constants/roles.constants')
const router = Router()

router.use(authenticate)
router.get('/',              requireRole(ROLES.ORG_ADMIN, ROLES.HR_MANAGER), c.getUsers)
router.get('/me',            c.updateMe)  // GET own profile
router.patch('/me',          c.updateMe)
router.get('/:id',           requireRole(ROLES.ORG_ADMIN, ROLES.HR_MANAGER), c.getUserById)
router.patch('/:id',         requireRole(ROLES.ORG_ADMIN), c.updateUser)
router.patch('/:id/toggle',  requireRole(ROLES.ORG_ADMIN), c.toggleStatus)
router.delete('/:id',        requireRole(ROLES.ORG_ADMIN), c.deleteUser)
router.post('/:id/roles',    requireRole(ROLES.ORG_ADMIN), c.assignRole)
router.delete('/:id/roles/:roleId', requireRole(ROLES.ORG_ADMIN), c.removeRole)

module.exports = router
