const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  courseId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  status:       { type: String, enum: ['not_started','in_progress','completed'], default: 'not_started' },
  completedAt:  { type: Date },
  timeSpent:    { type: Number, default: 0 }, // seconds
  lastPosition: { type: Number, default: 0 }, // video seconds
}, { timestamps: true })
schema.index({ userId: 1, courseId: 1 })
schema.index({ userId: 1, lessonId: 1 }, { unique: true })
module.exports = mongoose.model('LessonProgress', schema)
