const slugify  = require('slugify')
const Course   = require('../models/Course.model')
const Module   = require('../models/Module.model')
const Lesson   = require('../models/Lesson.model')
const Enrollment = require('../models/Enrollment.model')
const LessonProgress = require('../models/LessonProgress.model')

/* ── Courses ──────────────────────────────────────────────────────────── */
const getCourses = async ({ tenantId, page = 1, limit = 20, search, status, category, instructorId }) => {
  const query = { tenantId, isDeleted: false }
  if (search)      query.$or = [{ title: { $regex: search, $options: 'i' } }]
  if (status)      query.status = status
  if (category)    query.category = category
  if (instructorId) query.instructorId = instructorId

  const total   = await Course.countDocuments(query)
  const courses = await Course.find(query)
    .populate('instructorId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return { courses, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
}

const getCourseById = async (courseId, tenantId) => {
  const course = await Course.findOne({ _id: courseId, tenantId, isDeleted: false })
    .populate('instructorId', 'firstName lastName avatar')
    .lean()
  if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 })

  const modules = await Module.find({ courseId, isDeleted: false }).sort({ order: 1 }).lean()
  const lessons = await Lesson.find({ courseId, isDeleted: false }).sort({ order: 1 }).lean()

  course.modules = modules.map(m => ({
    ...m,
    lessons: lessons.filter(l => l.moduleId.toString() === m._id.toString()),
  }))
  return course
}

const createCourse = async (data, tenantId, creatorId) => {
  const slug = await uniqueSlug(data.title, tenantId)
  return Course.create({ ...data, tenantId, creatorId, slug })
}

const updateCourse = async (courseId, tenantId, data) => {
  const course = await Course.findOneAndUpdate(
    { _id: courseId, tenantId, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  )
  if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 })
  return course
}

const publishCourse = async (courseId, tenantId) => {
  return Course.findOneAndUpdate(
    { _id: courseId, tenantId },
    { status: 'published', publishedAt: new Date() },
    { new: true }
  )
}

const deleteCourse = async (courseId, tenantId) => {
  await Course.findOneAndUpdate({ _id: courseId, tenantId }, { isDeleted: true })
}

/* ── Modules ──────────────────────────────────────────────────────────── */
const createModule = async (courseId, tenantId, data) => {
  const count = await Module.countDocuments({ courseId, isDeleted: false })
  return Module.create({ ...data, courseId, tenantId, order: count })
}

const updateModule = async (moduleId, courseId, tenantId, data) => {
  return Module.findOneAndUpdate({ _id: moduleId, courseId, tenantId }, { $set: data }, { new: true })
}

const reorderModules = async (courseId, tenantId, orderedIds) => {
  const ops = orderedIds.map((id, i) =>
    Module.findOneAndUpdate({ _id: id, courseId, tenantId }, { order: i })
  )
  await Promise.all(ops)
}

const deleteModule = async (moduleId, courseId, tenantId) => {
  await Module.findOneAndUpdate({ _id: moduleId, courseId, tenantId }, { isDeleted: true })
}

/* ── Lessons ──────────────────────────────────────────────────────────── */
const createLesson = async (moduleId, courseId, tenantId, data) => {
  const count = await Lesson.countDocuments({ moduleId, isDeleted: false })
  return Lesson.create({ ...data, moduleId, courseId, tenantId, order: count })
}

const updateLesson = async (lessonId, tenantId, data) => {
  return Lesson.findOneAndUpdate({ _id: lessonId, tenantId, isDeleted: false }, { $set: data }, { new: true })
}

const deleteLesson = async (lessonId, tenantId) => {
  await Lesson.findOneAndUpdate({ _id: lessonId, tenantId }, { isDeleted: true })
}

/* ── Progress ─────────────────────────────────────────────────────────── */
const markLessonComplete = async (userId, lessonId, courseId, tenantId, timeSpent = 0) => {
  const progress = await LessonProgress.findOneAndUpdate(
    { userId, lessonId },
    { userId, lessonId, courseId, tenantId, status: 'completed', completedAt: new Date(), timeSpent },
    { upsert: true, new: true }
  )
  await recalculateCourseProgress(userId, courseId, tenantId)
  return progress
}

const recalculateCourseProgress = async (userId, courseId, tenantId) => {
  const totalLessons = await Lesson.countDocuments({ courseId, isPublished: true, isDeleted: false })
  if (!totalLessons) return

  const completedLessons = await LessonProgress.countDocuments({ userId, courseId, status: 'completed' })
  const percent = Math.round((completedLessons / totalLessons) * 100)

  const enrollment = await Enrollment.findOneAndUpdate(
    { userId, courseId },
    { progressPercent: percent, lastAccessedAt: new Date(),
      ...(percent === 100 && { status: 'completed', completedAt: new Date() }) },
    { new: true }
  )
  return enrollment
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
const uniqueSlug = async (title, tenantId) => {
  let slug = slugify(title, { lower: true, strict: true })
  let exists = await Course.findOne({ slug, tenantId })
  let i = 1
  while (exists) {
    slug = `${slugify(title, { lower: true, strict: true })}-${i++}`
    exists = await Course.findOne({ slug, tenantId })
  }
  return slug
}

module.exports = {
  getCourses, getCourseById, createCourse, updateCourse, publishCourse, deleteCourse,
  createModule, updateModule, reorderModules, deleteModule,
  createLesson, updateLesson, deleteLesson,
  markLessonComplete, recalculateCourseProgress,
}
