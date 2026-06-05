const Joi = require('joi')

const passwordRules = Joi.string()
  .min(8)
  .max(72)
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[0-9]/, 'number')
  .pattern(/[^A-Za-z0-9]/, 'special character')
  .messages({
    'string.min':     'Password must be at least 8 characters',
    'string.pattern.name': 'Password must contain at least one {#name}',
    'any.required':   'Password is required',
  })

const phonePattern = /^\+?[1-9]\d{6,14}$/

exports.registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required()
    .messages({ 'string.min': 'First name must be at least 2 characters', 'any.required': 'First name is required' }),

  lastName: Joi.string().trim().min(2).max(50).required()
    .messages({ 'string.min': 'Last name must be at least 2 characters', 'any.required': 'Last name is required' }),

  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required()
    .messages({ 'string.email': 'Please enter a valid email address', 'any.required': 'Email is required' }),

  phone: Joi.string().pattern(phonePattern).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Please enter a valid phone number (e.g. +18681234567)' }),

  password: passwordRules.required(),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Passwords do not match', 'any.required': 'Please confirm your password' }),

  role: Joi.string()
    .valid('learner', 'instructor', 'org_admin')
    .default('learner'),

  category: Joi.string().trim().max(100).allow('', null).optional(),

  agreeToTerms: Joi.boolean().valid(true).required()
    .messages({ 'any.only': 'You must agree to the Terms of Service', 'any.required': 'You must agree to the Terms of Service' }),
})

exports.loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required()
    .messages({ 'string.email': 'Please enter a valid email address', 'any.required': 'Email is required' }),

  password: Joi.string().max(72).required()
    .messages({ 'any.required': 'Password is required', 'string.empty': 'Password is required' }),

  remember: Joi.boolean().default(false),
})

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required()
    .messages({ 'string.email': 'Please enter a valid email address', 'any.required': 'Email is required' }),
})

exports.resetPasswordSchema = Joi.object({
  password: passwordRules.required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Passwords do not match', 'any.required': 'Please confirm your password' }),
})

exports.changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({ 'any.required': 'Current password is required' }),
  newPassword:     passwordRules.required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'Passwords do not match' }),
})
