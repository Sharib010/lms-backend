const { Router } = require('express')
const c = require('../controllers/certificate.controller')
const { authenticate } = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/rbac.middleware')
const { ROLES } = require('../constants/roles.constants')
const router = Router()
router.get('/verify/:certNumber', c.verifyCertificate) // public
router.use(authenticate)
router.get('/me',            c.getMyCertificates)
router.post('/:certId/esign', c.esign)
router.patch('/:id/revoke',  requireRole(ROLES.ORG_ADMIN), c.revoke)
module.exports = router
