const Enrollment = require('../models/Enrollment.model')
const Course     = require('../models/Course.model')

const enroll = async (userId, courseId, tenantId, enrolledBy = null) => {
  const course = await Course.findOne({ _id: courseId, tenantId, status: 'published', isDeleted: false })
  if (!course) throw Object.assign(new Error('Course not found or not published'), { statusCode: 404 })

  const existing = await Enrollment.findOne({ userId, courseId })
  if (existing) {
    if (existing.status === 'active') throw Object.assign(new Error('Already enrolled'), { statusCode: 409 })
    existing.status = 'active'
    existing.enrolledAt = new Date()
    await existing.save()
    return existing
  }

  return Enrollment.create({ userId, courseId, tenantId, enrolledBy, status: 'active' })
}

const getMyEnrollments = async (userId, tenantId, { status, page = 1, limit = 20 }) => {
  const query = { userId, tenantId }
  if (status) query.status = status

  const total = await Enrollment.countDocuments(query)
  const enrollments = await Enrollment.find(query)
    .populate({ path: 'courseId', select: 'title thumbnail category level estimatedDuration instructorId', populate: { path: 'instructorId', select: 'firstName lastName' } })
    .sort({ lastAccessedAt: -1, enrolledAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return { enrollments, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
}

const getEnrollmentByCourse = async (userId, courseId) =>
  Enrollment.findOne({ userId, courseId })

const dropCourse = async (userId, courseId, tenantId) => {
  const enrollment = await Enrollment.findOneAndUpdate(
    { userId, courseId, tenantId },
    { status: 'dropped' },
    { new: true }
  )
  if (!enrollment) throw Object.assign(new Error('Enrollment not found'), { statusCode: 404 })
  return enrollment
}

module.exports = { enroll, getMyEnrollments, getEnrollmentByCourse, dropCourse }
