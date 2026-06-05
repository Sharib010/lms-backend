const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  tenantId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  parentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  name:           { type: String, required: true, trim: true },
  managerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true })
schema.index({ tenantId: 1, organizationId: 1 })
module.exports = mongoose.model('Department', schema)
