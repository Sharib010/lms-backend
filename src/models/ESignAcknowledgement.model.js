const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certificateId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', required: true },
  courseId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tenantId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  signatureData:   { type: String }, // base64 signature image
  signedAt:        { type: Date, default: Date.now },
  ipAddress:       { type: String },
  userAgent:       { type: String },
  acknowledgement: { type: String }, // "I confirm that I have completed..."
}, { timestamps: true })
schema.index({ userId: 1, certificateId: 1 }, { unique: true })
module.exports = mongoose.model('ESignAcknowledgement', schema)
