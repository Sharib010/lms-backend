const User    = require('../models/User.model')
const UserRole = require('../models/UserRole.model')
const Role    = require('../models/Role.model')

const getUsers = async ({ tenantId, page = 1, limit = 20, search, role, isActive }) => {
  const query = { tenantId, isDeleted: false }
  if (search) query.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName:  { $regex: search, $options: 'i' } },
    { email:     { $regex: search, $options: 'i' } },
  ]
  if (typeof isActive !== 'undefined') query.isActive = isActive

  let userIds = null
  if (role) {
    const roleDoc = await Role.findOne({ slug: role, tenantId })
    if (roleDoc) {
      const urs = await UserRole.find({ roleId: roleDoc._id, tenantId }).select('userId')
      userIds = urs.map(ur => ur.userId)
    }
  }
  if (userIds) query._id = { $in: userIds }

  const total = await User.countDocuments(query)
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  // Attach roles
  const ids = users.map(u => u._id)
  const allRoles = await UserRole.find({ userId: { $in: ids }, tenantId }).populate('roleId', 'name slug')
  const roleMap = {}
  allRoles.forEach(ur => {
    if (!roleMap[ur.userId]) roleMap[ur.userId] = []
    if (ur.roleId) roleMap[ur.userId].push(ur.roleId)
  })
  users.forEach(u => { u.roles = roleMap[u._id] || [] })

  return { users, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
}

const getUserById = async (userId, tenantId) => {
  const user = await User.findOne({ _id: userId, tenantId, isDeleted: false }).lean()
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 })
  const userRoles = await UserRole.find({ userId, tenantId }).populate('roleId', 'name slug')
  user.roles = userRoles.map(ur => ur.roleId).filter(Boolean)
  return user
}

const updateUser = async (userId, tenantId, data) => {
  const allowed = ['firstName', 'lastName', 'phone', 'avatar', 'bio', 'jobTitle', 'timezone', 'language', 'customFields']
  const update  = {}
  allowed.forEach(k => { if (data[k] !== undefined) update[k] = data[k] })

  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId, isDeleted: false },
    { $set: update },
    { new: true, runValidators: true }
  )
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 })
  return user
}

const toggleUserStatus = async (userId, tenantId) => {
  const user = await User.findOne({ _id: userId, tenantId, isDeleted: false })
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 })
  user.isActive = !user.isActive
  await user.save()
  return user
}

const deleteUser = async (userId, tenantId) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId },
    { isDeleted: true, isActive: false },
    { new: true }
  )
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 })
  return user
}

const assignRole = async (userId, roleId, tenantId, assignedBy) => {
  const role = await Role.findOne({ _id: roleId, tenantId })
  if (!role) throw Object.assign(new Error('Role not found'), { statusCode: 404 })
  await UserRole.findOneAndUpdate(
    { userId, roleId, tenantId },
    { userId, roleId, tenantId, assignedBy },
    { upsert: true, new: true }
  )
}

const removeRole = async (userId, roleId, tenantId) => {
  await UserRole.deleteOne({ userId, roleId, tenantId })
}

module.exports = { getUsers, getUserById, updateUser, toggleUserStatus, deleteUser, assignRole, removeRole }
