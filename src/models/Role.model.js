const mongoose = require('mongoose')
const roleSchema = new mongoose.Schema({
  tenantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, lowercase: true, trim: true },
  description: { type: String },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  isSystem:    { type: Boolean, default: false },
  isDeleted:   { type: Boolean, default: false },
}, { timestamps: true })
roleSchema.index({ slug: 1, tenantId: 1 }, { unique: true, sparse: true })
module.exports = mongoose.model('Role', roleSchema)
