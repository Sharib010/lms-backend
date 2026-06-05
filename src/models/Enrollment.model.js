const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tenantId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  status:          { type: String, enum: ['pending','active','completed','expired','dropped'], default: 'active' },
  enrolledAt:      { type: Date, default: Date.now },
  completedAt:     { type: Date },
  deadlineAt:      { type: Date },
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  lastAccessedAt:  { type: Date },
  enrolledBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // if assigned by admin
}, { timestamps: true })
schema.index({ userId: 1, courseId: 1 }, { unique: true })
schema.index({ tenantId: 1, status: 1 })
module.exports = mongoose.model('Enrollment', schema)
