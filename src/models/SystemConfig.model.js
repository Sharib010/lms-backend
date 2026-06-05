const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  tenantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  key:       { type: String, required: true },
  value:     { type: mongoose.Schema.Types.Mixed },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })
schema.index({ key: 1, tenantId: 1 }, { unique: true, sparse: true })
module.exports = mongoose.model('SystemConfig', schema)
