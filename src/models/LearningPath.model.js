const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  tenantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  creatorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, lowercase: true },
  description: { type: String },
  thumbnail:   { type: String },
  isPublished: { type: Boolean, default: false },
  isDeleted:   { type: Boolean, default: false },
}, { timestamps: true })
schema.index({ slug: 1, tenantId: 1 }, { unique: true })
module.exports = mongoose.model('LearningPath', schema)
