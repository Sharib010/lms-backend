const mongoose = require('mongoose')
const { LESSON_TYPES } = require('../constants/lessonTypes.constants')
const schema = new mongoose.Schema({
  moduleId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
  courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tenantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title:       { type: String, required: true, trim: true },
  type:        { type: String, enum: Object.values(LESSON_TYPES), required: true },
  order:       { type: Number, required: true, default: 0 },
  duration:    { type: Number }, // seconds
  isPreview:   { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  isDeleted:   { type: Boolean, default: false },
  // type-specific content
  content: {
    // video
    videoUrl:    { type: String },
    videoKey:    { type: String },  // S3 key
    captionsUrl: { type: String },
    // document
    documentUrl: { type: String },
    documentKey: { type: String },
    // text
    html:        { type: String },
    // embed
    embedUrl:    { type: String },
    // quiz/assessment reference
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  },
}, { timestamps: true })
schema.index({ moduleId: 1, order: 1 })
module.exports = mongoose.model('Lesson', schema)
