const { Router } = require('express')
const c = require('../controllers/enrollment.controller')
const { authenticate } = require('../middleware/auth.middleware')
const router = Router()
router.use(authenticate)
router.post('/',              c.enroll)
router.get('/me',             c.getMyEnrollments)
router.delete('/:courseId',   c.dropCourse)
module.exports = router
