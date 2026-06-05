const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  tenantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, lowercase: true, trim: true },
  phone:     { type: String, trim: true },
  password:  { type: String, select: false },
  avatar:    { type: String },
  isSuperAdmin:       { type: Boolean, default: false },
  isEmailVerified:    { type: Boolean, default: false },
  emailVerifyToken:   { type: String, select: false },
  emailVerifyExpires: { type: Date,   select: false },
  isActive:   { type: Boolean, default: true },
  isDeleted:  { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  ssoProvider: { type: String },
  ssoId:       { type: String },
  bio:       { type: String },
  jobTitle:  { type: String },
  timezone:  { type: String, default: 'America/Port_of_Spain' },
  language:  { type: String, default: 'en' },
  lastLogin: { type: Date },
  lastIp:    { type: String },
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

userSchema.index({ email: 1, tenantId: 1 }, { unique: true, sparse: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('User', userSchema)
