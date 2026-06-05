const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  courseId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  attemptNumber:{ type: Number, default: 1 },
  status:       { type: String, enum: ['in_progress','submitted','graded','expired'], default: 'in_progress' },
  startedAt:    { type: Date, default: Date.now },
  submittedAt:  { type: Date },
  gradedAt:     { type: Date },
  // final scores
  score:        { type: Number },
  maxScore:     { type: Number },
  percentage:   { type: Number },
  passed:       { type: Boolean },
  timeSpent:    { type: Number }, // seconds
  // snapshot of questions delivered (for review)
  questionOrder:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
}, { timestamps: true })
schema.index({ userId: 1, assessmentId: 1 })
schema.index({ tenantId: 1, status: 1 })
module.exports = mongoose.model('AssessmentAttempt', schema)
