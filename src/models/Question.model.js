const mongoose = require('mongoose')
const { QUESTION_TYPES } = require('../constants/questionTypes.constants')
const schema = new mongoose.Schema({
  bankId:      { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank', required: true, index: true },
  tenantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  type:        { type: String, enum: Object.values(QUESTION_TYPES), required: true },
  stem:        { type: String, required: true }, // question text
  // MCQ / TrueFalse options
  options: [{
    id:        { type: String },
    text:      { type: String },
    isCorrect: { type: Boolean, default: false },
  }],
  // Fill blank
  blanks: [{ position: Number, answer: String }],
  // Matching
  pairs:  [{ left: String, right: String }],
  // Ordering
  items:  [{ id: String, text: String, correctOrder: Number }],
  // Short answer / Essay
  sampleAnswer:    { type: String },
  rubric:          { type: String },
  explanation:     { type: String },
  points:          { type: Number, default: 1 },
  difficulty:      { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  tags:            [{ type: String }],
  isDeleted:       { type: Boolean, default: false },
}, { timestamps: true })
schema.index({ bankId: 1, type: 1 })
module.exports = mongoose.model('Question', schema)
