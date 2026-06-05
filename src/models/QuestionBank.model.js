const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true, trim: true },
  description:  { type: String },
  tags:         [{ type: String }],
  isShared:     { type: Boolean, default: false },
  isDeleted:    { type: Boolean, default: false },
}, { timestamps: true })
schema.index({ tenantId: 1 })
module.exports = mongoose.model('QuestionBank', schema)
