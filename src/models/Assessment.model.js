const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  courseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  lessonId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  tenantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  creatorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:      { type: String, required: true },
  description:{ type: String },
  type:       { type: String, enum: ['practice','graded','proctored'], default: 'graded' },
  config: {
    timeLimit:      { type: Number }, // minutes, null = unlimited
    maxAttempts:    { type: Number, default: 3 },
    passingScore:   { type: Number, default: 70 },
    randomizeQ:     { type: Boolean, default: false },
    randomizeOpts:  { type: Boolean, default: false },
    showResults:    { type: String, enum: ['immediately','after_deadline','never'], default: 'immediately' },
    allowReview:    { type: Boolean, default: true },
  },
  // question pool — either direct questions or selection from bank
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  selectionRules: [{
    bankId:     { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' },
    count:      { type: Number },
    difficulty: { type: String },
    tags:       [{ type: String }],
  }],
  totalPoints: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  isDeleted:   { type: Boolean, default: false },
}, { timestamps: true })
module.exports = mongoose.model('Assessment', schema)
