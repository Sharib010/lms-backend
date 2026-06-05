const enrollmentService = require('../services/enrollment.service')
const { success, paginated } = require('../utils/response.util')

const enroll = async (req, res) => {
  const enrollment = await enrollmentService.enroll(req.user._id, req.body.courseId, req.tenant._id)
  success(res, enrollment, 'Enrolled successfully', 201)
}

const getMyEnrollments = async (req, res) => {
  const { status, page, limit } = req.query
  const result = await enrollmentService.getMyEnrollments(req.user._id, req.tenant._id, { status, page: +page||1, limit: +limit||20 })
  paginated(res, result.enrollments, result.pagination)
}

const dropCourse = async (req, res) => {
  await enrollmentService.dropCourse(req.user._id, req.params.courseId, req.tenant._id)
  success(res, null, 'Dropped from course')
}

module.exports = { enroll, getMyEnrollments, dropCourse }
