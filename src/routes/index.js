const { Router } = require('express')
const router = Router()

router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

router.use('/auth',         require('./auth.routes'))
router.use('/users',        require('./user.routes'))
router.use('/tenants',      require('./tenant.routes'))
router.use('/courses',      require('./course.routes'))
router.use('/enrollments',  require('./enrollment.routes'))
router.use('/assessments',  require('./assessment.routes'))
router.use('/certificates', require('./certificate.routes'))

module.exports = router
