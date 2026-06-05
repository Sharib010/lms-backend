const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tenantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  templateId:  { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateTemplate' },
  certNumber:  { type: String, required: true, unique: true },
  pdfUrl:      { type: String },
  pdfKey:      { type: String },
  issuedAt:    { type: Date, default: Date.now },
  expiresAt:   { type: Date },
  status:      { type: String, enum: ['active','expired','revoked'], default: 'active' },
  isEsignRequired: { type: Boolean, default: false },
  esignedAt:       { type: Date },
  revokedAt:       { type: Date },
  revokedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revokeReason:    { type: String },
}, { timestamps: true })
schema.index({ userId: 1, courseId: 1 })
schema.index({ tenantId: 1, status: 1 })
module.exports = mongoose.model('Certificate', schema)
