const courseService = require('../services/course.service')
const { success, paginated } = require('../utils/response.util')

const getCourses = async (req, res) => {
  const { page, limit, search, status, category } = req.query
  const result = await courseService.getCourses({ tenantId: req.tenant._id, page: +page||1, limit: +limit||20, search, status, category })
  paginated(res, result.courses, result.pagination)
}

const getCourse = async (req, res) => {
  const course = await courseService.getCourseById(req.params.id, req.tenant._id)
  success(res, course)
}

const createCourse = async (req, res) => {
  const course = await courseService.createCourse(req.body, req.tenant._id, req.user._id)
  success(res, course, 'Course created', 201)
}

const updateCourse = async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.tenant._id, req.body)
  success(res, course)
}

const publishCourse = async (req, res) => {
  const course = await courseService.publishCourse(req.params.id, req.tenant._id)
  success(res, course, 'Course published')
}

const deleteCourse = async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.tenant._id)
  success(res, null, 'Course deleted')
}

// Modules
const createModule = async (req, res) => {
  const mod = await courseService.createModule(req.params.courseId, req.tenant._id, req.body)
  success(res, mod, 'Module created', 201)
}
const updateModule = async (req, res) => {
  const mod = await courseService.updateModule(req.params.id, req.params.courseId, req.tenant._id, req.body)
  success(res, mod)
}
const reorderModules = async (req, res) => {
  await courseService.reorderModules(req.params.courseId, req.tenant._id, req.body.orderedIds)
  success(res, null, 'Modules reordered')
}
const deleteModule = async (req, res) => {
  await courseService.deleteModule(req.params.id, req.params.courseId, req.tenant._id)
  success(res, null, 'Module deleted')
}

// Lessons
const createLesson = async (req, res) => {
  const lesson = await courseService.createLesson(req.params.moduleId, req.params.courseId, req.tenant._id, req.body)
  success(res, lesson, 'Lesson created', 201)
}
const updateLesson = async (req, res) => {
  const lesson = await courseService.updateLesson(req.params.id, req.tenant._id, req.body)
  success(res, lesson)
}
const deleteLesson = async (req, res) => {
  await courseService.deleteLesson(req.params.id, req.tenant._id)
  success(res, null, 'Lesson deleted')
}
const markLessonComplete = async (req, res) => {
  const progress = await courseService.markLessonComplete(req.user._id, req.params.id, req.params.courseId, req.tenant._id, req.body.timeSpent)
  success(res, progress)
}

module.exports = { getCourses, getCourse, createCourse, updateCourse, publishCourse, deleteCourse, createModule, updateModule, reorderModules, deleteModule, createLesson, updateLesson, deleteLesson, markLessonComplete }
