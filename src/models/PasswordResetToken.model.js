const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token:     { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isUsed:    { type: Boolean, default: false },
}, { timestamps: true })
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
module.exports = mongoose.model('PasswordResetToken', schema)
