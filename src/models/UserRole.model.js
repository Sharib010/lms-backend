const mongoose = require('mongoose')
const userRoleSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  tenantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })
userRoleSchema.index({ userId: 1, tenantId: 1 })
userRoleSchema.index({ userId: 1, roleId: 1, tenantId: 1 }, { unique: true })
module.exports = mongoose.model('UserRole', userRoleSchema)
