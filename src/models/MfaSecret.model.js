const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  secret:      { type: String, required: true, select: false },
  isEnabled:   { type: Boolean, default: false },
  backupCodes: [{ code: String, isUsed: { type: Boolean, default: false } }],
}, { timestamps: true })
module.exports = mongoose.model('MfaSecret', schema)
