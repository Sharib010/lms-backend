const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  attemptId:    { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentAttempt', required: true, index: true },
  questionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer:       { type: mongoose.Schema.Types.Mixed }, // flexible per question type
  isCorrect:    { type: Boolean },
  pointsEarned: { type: Number, default: 0 },
  gradedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for manual grading
  feedback:     { type: String },
}, { timestamps: true })
schema.index({ attemptId: 1, questionId: 1 }, { unique: true })
module.exports = mongoose.model('AssessmentResponse', schema)
