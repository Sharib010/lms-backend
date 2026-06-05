const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  tenantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, lowercase: true },
  description: { type: String },
  logoUrl:     { type: String },
  website:     { type: String },
  settings:    { type: mongoose.Schema.Types.Mixed },
  isDeleted:   { type: Boolean, default: false },
}, { timestamps: true })
schema.index({ slug: 1, tenantId: 1 }, { unique: true })
module.exports = mongoose.model('Organization', schema)
