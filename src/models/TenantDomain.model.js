const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  tenantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  domain:     { type: String, required: true, unique: true, lowercase: true },
  isPrimary:  { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true })
module.exports = mongoose.model('TenantDomain', schema)
