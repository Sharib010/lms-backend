const certService = require('../services/certificate.service')
const { success } = require('../utils/response.util')

const getMyCertificates = async (req, res) => {
  const certs = await certService.getMyCertificates(req.user._id, req.tenant._id)
  success(res, certs)
}

const verifyCertificate = async (req, res) => {
  const cert = await certService.getCertificateByNumber(req.params.certNumber)
  success(res, cert)
}

const esign = async (req, res) => {
  const result = await certService.esignCertificate(
    req.user._id, req.params.certId, req.tenant._id,
    req.body.signatureData, req.ip, req.headers['user-agent']
  )
  success(res, result, 'Certificate signed')
}

const revoke = async (req, res) => {
  const cert = await certService.revokeCertificate(req.params.id, req.tenant._id, req.user._id, req.body.reason)
  success(res, cert, 'Certificate revoked')
}

module.exports = { getMyCertificates, verifyCertificate, esign, revoke }
