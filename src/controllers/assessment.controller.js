const assessmentService = require('../services/assessment.service')
const { success } = require('../utils/response.util')

const createAssessment = async (req, res) => {
  const a = await assessmentService.createAssessment(req.body, req.tenant._id, req.user._id)
  success(res, a, 'Assessment created', 201)
}

const getAssessment = async (req, res) => {
  const a = await assessmentService.getAssessmentById(req.params.id, req.tenant._id)
  success(res, a)
}

const startAttempt = async (req, res) => {
  const result = await assessmentService.startAttempt(req.user._id, req.params.assessmentId, req.tenant._id)
  success(res, result, 'Attempt started', 201)
}

const submitAttempt = async (req, res) => {
  const attempt = await assessmentService.submitAttempt(req.params.attemptId, req.user._id, req.tenant._id, req.body.responses)
  success(res, attempt, 'Attempt submitted')
}

const getAttemptResult = async (req, res) => {
  const result = await assessmentService.getAttemptResult(req.params.attemptId, req.user._id)
  success(res, result)
}

module.exports = { createAssessment, getAssessment, startAttempt, submitAttempt, getAttemptResult }
