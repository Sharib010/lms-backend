const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  tenantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:     { type: String, required: true },
  resource:   { type: String, required: true },
  resourceId: { type: String },
  changes:    { old: mongoose.Schema.Types.Mixed, new: mongoose.Schema.Types.Mixed },
  metadata:   { type: mongoose.Schema.Types.Mixed },
  ipAddress:  { type: String },
  userAgent:  { type: String },
  requestId:  { type: String },
}, { timestamps: true })
schema.index({ tenantId: 1, createdAt: -1 })
schema.index({ userId: 1, createdAt: -1 })
schema.index({ resource: 1, resourceId: 1 })
module.exports = mongoose.model('AuditLog', schema)
