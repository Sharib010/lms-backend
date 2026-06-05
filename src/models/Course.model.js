const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  tenantId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  instructorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title:          { type: String, required: true, trim: true },
  slug:           { type: String, required: true, lowercase: true },
  description:    { type: String },
  shortDescription: { type: String },
  thumbnail:      { type: String },
  previewVideo:   { type: String },
  category:       { type: String },
  tags:           [{ type: String }],
  level:          { type: String, enum: ['beginner','intermediate','advanced','all'], default: 'all' },
  language:       { type: String, default: 'en' },
  status:         { type: String, enum: ['draft','published','archived'], default: 'draft' },
  enrollmentType: { type: String, enum: ['open','invite','paid'], default: 'open' },
  price:          { type: Number, default: 0 },
  prerequisites:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  estimatedDuration: { type: Number }, // minutes
  certificateEnabled:  { type: Boolean, default: true },
  certificateTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateTemplate' },
  passingScore:   { type: Number, default: 70 },
  isEsignRequired: { type: Boolean, default: false },
  publishedAt:    { type: Date },
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true })
schema.index({ slug: 1, tenantId: 1 }, { unique: true })
schema.index({ status: 1, tenantId: 1 })
module.exports = mongoose.model('Course', schema)
