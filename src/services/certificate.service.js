const { nanoid } = require('nanoid')
const Certificate = require('../models/Certificate.model')
const ESignAcknowledgement = require('../models/ESignAcknowledgement.model')
const Course = require('../models/Course.model')

const issueCertificate = async (userId, courseId, tenantId) => {
  const existing = await Certificate.findOne({ userId, courseId, status: 'active' })
  if (existing) return existing

  const course = await Course.findById(courseId)
  const certNumber = `CERT-${nanoid(10).toUpperCase()}`

  const cert = await Certificate.create({
    userId, courseId, tenantId,
    certNumber,
    templateId: course?.certificateTemplateId,
    isEsignRequired: course?.isEsignRequired || false,
    // expiresAt can be set from course config
  })

  return cert
}

const getMyCertificates = async (userId, tenantId) => {
  return Certificate.find({ userId, tenantId, status: { $ne: 'revoked' } })
    .populate('courseId', 'title category thumbnail')
    .sort({ issuedAt: -1 })
    .lean()
}

const getCertificateByNumber = async (certNumber) => {
  return Certificate.findOne({ certNumber })
    .populate('userId', 'firstName lastName email')
    .populate('courseId', 'title category')
    .lean()
}

const esignCertificate = async (userId, certificateId, tenantId, signatureData, ipAddress, userAgent) => {
  const cert = await Certificate.findOne({ _id: certificateId, userId, tenantId })
  if (!cert) throw Object.assign(new Error('Certificate not found'), { statusCode: 404 })

  const esign = await ESignAcknowledgement.findOneAndUpdate(
    { userId, certificateId },
    {
      userId, certificateId,
      courseId: cert.courseId,
      tenantId, signatureData,
      ipAddress, userAgent,
      signedAt: new Date(),
      acknowledgement: 'I acknowledge that I have completed this course and the information is accurate.',
    },
    { upsert: true, new: true }
  )

  cert.esignedAt = new Date()
  await cert.save()

  return { cert, esign }
}

const revokeCertificate = async (certId, tenantId, revokedBy, reason) => {
  return Certificate.findOneAndUpdate(
    { _id: certId, tenantId },
    { status: 'revoked', revokedAt: new Date(), revokedBy, revokeReason: reason },
    { new: true }
  )
}

module.exports = { issueCertificate, getMyCertificates, getCertificateByNumber, esignCertificate, revokeCertificate }
