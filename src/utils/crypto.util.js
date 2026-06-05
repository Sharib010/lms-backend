const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')

const generateSecureToken = () => crypto.randomBytes(32).toString('hex')
const generateShortId = () => uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

module.exports = { generateSecureToken, generateShortId, hashToken }
