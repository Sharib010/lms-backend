const mongoose = require('mongoose')

const tenantSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  slug:   { type: String, required: true, unique: true, lowercase: true, trim: true },
  domain: { type: String, lowercase: true, trim: true },
  plan:   { type: String, enum: ['free','starter','professional','enterprise'], default: 'starter' },
  status: { type: String, enum: ['active','suspended','inactive'], default: 'active' },
  branding: {
    primaryColor:   { type: String, default: '#5C41D6' },
    secondaryColor: { type: String, default: '#1A1040' },
    logoUrl:        { type: String },
  },
  settings: {
    mfaRequired:         { type: Boolean, default: false },
    ssoEnabled:          { type: Boolean, default: false },
    selfRegistration:    { type: Boolean, default: true },
    maxUsers:            { type: Number,  default: 1000 },
    storageQuotaGB:      { type: Number,  default: 50 },
    certificatesEnabled: { type: Boolean, default: true },
    marketplaceEnabled:  { type: Boolean, default: false },
  },
  scimConfig: {
    enabled:     { type: Boolean, default: false },
    token:       { type: String, select: false },
    providerUrl: { type: String },
  },
  ssoConfig: {
    provider:     { type: String, enum: ['saml','oidc','google', null], default: null },
    entryPoint:   { type: String },
    issuer:       { type: String },
    cert:         { type: String, select: false },
    clientId:     { type: String },
    clientSecret: { type: String, select: false },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

tenantSchema.index({ domain: 1 })

module.exports = mongoose.model('Tenant', tenantSchema)
