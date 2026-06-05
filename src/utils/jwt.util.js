const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const RefreshToken = require('../models/RefreshToken.model')

const generateAccessToken = (userId, tenantId, roles = []) =>
  jwt.sign({ userId, tenantId, roles }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  })

const generateRefreshToken = async (userId, ipAddress, deviceInfo) => {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  await RefreshToken.create({ userId, token, expiresAt, ipAddress, deviceInfo })
  return token
}

const revokeRefreshToken = (token) =>
  RefreshToken.updateOne({ token }, { isRevoked: true })

const revokeAllUserTokens = (userId) =>
  RefreshToken.updateMany({ userId }, { isRevoked: true })

module.exports = { generateAccessToken, generateRefreshToken, revokeRefreshToken, revokeAllUserTokens }
