const { Router } = require('express')
const router = Router()

router.get('/health', (req, res) => {
  const mongoose = require('mongoose')
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting']

  const missing = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV']
    .filter(k => !process.env[k])

  res.json({
    status:    missing.length === 0 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'unknown',
    db:        dbStates[mongoose.connection.readyState] || 'unknown',
    redis:     process.env.REDIS_URL ? 'configured' : 'not configured (optional)',
    missing_env: missing.length > 0 ? missing : undefined,
  })
})

router.use('/auth',         require('./auth.routes'))
router.use('/users',        require('./user.routes'))
router.use('/tenants',      require('./tenant.routes'))
router.use('/courses',      require('./course.routes'))
router.use('/enrollments',  require('./enrollment.routes'))
router.use('/assessments',  require('./assessment.routes'))
router.use('/certificates', require('./certificate.routes'))

module.exports = router
