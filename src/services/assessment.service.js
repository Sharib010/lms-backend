const Assessment = require('../models/Assessment.model')
const AssessmentAttempt  = require('../models/AssessmentAttempt.model')
const AssessmentResponse = require('../models/AssessmentResponse.model')
const Question   = require('../models/Question.model')
const { AUTO_GRADED } = require('../constants/questionTypes.constants')

const createAssessment = async (data, tenantId, creatorId) =>
  Assessment.create({ ...data, tenantId, creatorId })

const getAssessmentById = async (id, tenantId) => {
  const a = await Assessment.findOne({ _id: id, tenantId, isDeleted: false })
    .populate('questions')
    .lean()
  if (!a) throw Object.assign(new Error('Assessment not found'), { statusCode: 404 })
  return a
}

const startAttempt = async (userId, assessmentId, tenantId) => {
  const assessment = await Assessment.findOne({ _id: assessmentId, tenantId, isPublished: true })
  if (!assessment) throw Object.assign(new Error('Assessment not found'), { statusCode: 404 })

  // Check max attempts
  const attemptCount = await AssessmentAttempt.countDocuments({ userId, assessmentId, status: { $ne: 'in_progress' } })
  if (assessment.config.maxAttempts && attemptCount >= assessment.config.maxAttempts) {
    throw Object.assign(new Error('Maximum attempts reached'), { statusCode: 403 })
  }

  // Cancel any orphaned in-progress attempts
  await AssessmentAttempt.updateMany(
    { userId, assessmentId, status: 'in_progress' },
    { status: 'expired' }
  )

  // Resolve questions (direct or from banks)
  let questionIds = [...(assessment.questions || [])]
  // TODO: selection rules from banks

  if (assessment.config.randomizeQ) {
    questionIds = questionIds.sort(() => Math.random() - 0.5)
  }

  const attempt = await AssessmentAttempt.create({
    userId, assessmentId,
    courseId: assessment.courseId,
    tenantId,
    attemptNumber: attemptCount + 1,
    questionOrder: questionIds,
    status: 'in_progress',
  })

  const questions = await Question.find({ _id: { $in: questionIds } })
    .select('-options.isCorrect -blanks.answer -pairs') // hide answers
    .lean()

  return { attempt, questions }
}

const submitAttempt = async (attemptId, userId, tenantId, responses) => {
  const attempt = await AssessmentAttempt.findOne({ _id: attemptId, userId, status: 'in_progress' })
  if (!attempt) throw Object.assign(new Error('Attempt not found or already submitted'), { statusCode: 404 })

  const assessment = await Assessment.findById(attempt.assessmentId).populate('questions')
  let totalPoints = 0, earnedPoints = 0

  const responseOps = []
  for (const { questionId, answer } of responses) {
    const question = assessment.questions.find(q => q._id.toString() === questionId)
    if (!question) continue

    totalPoints += question.points || 1
    let isCorrect = false, pointsEarned = 0

    if (AUTO_GRADED.includes(question.type)) {
      isCorrect   = gradeAnswer(question, answer)
      pointsEarned = isCorrect ? (question.points || 1) : 0
      earnedPoints += pointsEarned
    }

    responseOps.push(
      AssessmentResponse.findOneAndUpdate(
        { attemptId, questionId },
        { attemptId, questionId, answer, isCorrect, pointsEarned },
        { upsert: true }
      )
    )
  }
  await Promise.all(responseOps)

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed     = percentage >= (assessment.config.passingScore || 70)

  attempt.status      = 'graded'
  attempt.submittedAt = new Date()
  attempt.gradedAt    = new Date()
  attempt.score       = earnedPoints
  attempt.maxScore    = totalPoints
  attempt.percentage  = percentage
  attempt.passed      = passed
  attempt.timeSpent   = Math.round((Date.now() - attempt.startedAt.getTime()) / 1000)
  await attempt.save()

  return attempt
}

const gradeAnswer = (question, answer) => {
  switch (question.type) {
    case 'mcq': {
      const correct = question.options.filter(o => o.isCorrect).map(o => o.id)
      const given   = Array.isArray(answer) ? answer : [answer]
      return correct.length === given.length && correct.every(id => given.includes(id))
    }
    case 'true_false':
      return question.options.find(o => o.isCorrect)?.id === answer
    case 'fill_blank':
      return question.blanks.every((b, i) =>
        b.answer?.toLowerCase() === answer[i]?.toLowerCase()
      )
    case 'ordering':
      return question.items.every((item, idx) => item.id === answer[idx])
    default:
      return false
  }
}

const getAttemptResult = async (attemptId, userId) => {
  const attempt   = await AssessmentAttempt.findOne({ _id: attemptId, userId }).lean()
  if (!attempt) throw Object.assign(new Error('Attempt not found'), { statusCode: 404 })
  const responses = await AssessmentResponse.find({ attemptId })
    .populate('questionId')
    .lean()
  return { attempt, responses }
}

module.exports = { createAssessment, getAssessmentById, startAttempt, submitAttempt, getAttemptResult }
