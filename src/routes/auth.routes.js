const { Router } = require('express')
const c  = require('../controllers/auth.controller')
const { authenticate } = require('../middleware/auth.middleware')
const { validate }     = require('../middleware/validate.middleware')
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator')
const rateLimit = require('express-rate-limit')

// Strict rate limits on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  message: { success: false, message: 'Too many reset attempts. Please try again in 1 hour.' },
})

const router = Router()

// Public — no auth required
router.post('/register',                  authLimiter, validate(registerSchema),      c.register)
router.post('/login',                     authLimiter, validate(loginSchema),         c.login)
router.post('/logout',                                                                 c.logout)
router.post('/refresh',                                                                c.refresh)
router.get( '/verify-email/:token',                                                    c.verifyEmail)
router.post('/resend-verification',       authLimiter,                                 c.resendVerification)
router.post('/forgot-password',           resetLimiter, validate(forgotPasswordSchema), c.forgotPassword)
router.post('/reset-password/:token',     resetLimiter, validate(resetPasswordSchema),  c.resetPassword)

// Protected
router.get('/me',                         authenticate, c.me)
router.post('/change-password',           authenticate, validate(require('../validators/auth.validator').changePasswordSchema), c.changePassword)

module.exports = router
