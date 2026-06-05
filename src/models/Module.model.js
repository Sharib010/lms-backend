const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  tenantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  order:       { type: Number, required: true, default: 0 },
  isPublished: { type: Boolean, default: false },
  isDeleted:   { type: Boolean, default: false },
}, { timestamps: true })
schema.index({ courseId: 1, order: 1 })
module.exports = mongoose.model('Module', schema)
