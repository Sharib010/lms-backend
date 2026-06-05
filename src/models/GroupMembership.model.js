const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  groupId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true })
schema.index({ groupId: 1, userId: 1 }, { unique: true })
module.exports = mongoose.model('GroupMembership', schema)
