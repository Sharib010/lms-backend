const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  learningPathId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', required: true },
  courseId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  order:          { type: Number, required: true, default: 0 },
  isRequired:     { type: Boolean, default: true },
}, { timestamps: true })
schema.index({ learningPathId: 1, courseId: 1 }, { unique: true })
module.exports = mongoose.model('LearningPathCourse', schema)
