const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  type:     { type: String, required: true }, // course_assigned, cert_issued, cert_expiring, etc.
  title:    { type: String, required: true },
  body:     { type: String },
  data:     { type: mongoose.Schema.Types.Mixed }, // link, resourceId, etc.
  isRead:   { type: Boolean, default: false },
  readAt:   { type: Date },
}, { timestamps: true })
schema.index({ userId: 1, isRead: 1, createdAt: -1 })
module.exports = mongoose.model('Notification', schema)
