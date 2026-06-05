const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  name:         { type: String, required: true, trim: true },
  description:  { type: String },
  type:         { type: String, enum: ['static','dynamic'], default: 'static' },
  rules:        { type: mongoose.Schema.Types.Mixed },
  managerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted:    { type: Boolean, default: false },
}, { timestamps: true })
schema.index({ tenantId: 1 })
module.exports = mongoose.model('Group', schema)
