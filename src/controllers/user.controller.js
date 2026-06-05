const { StatusCodes } = require('http-status-codes')
const userService = require('../services/user.service')
const { success, paginated, error } = require('../utils/response.util')

const getUsers = async (req, res) => {
  const { page, limit, search, role, isActive } = req.query
  const result = await userService.getUsers({ tenantId: req.tenant._id, page: +page||1, limit: +limit||20, search, role, isActive: isActive !== undefined ? isActive === 'true' : undefined })
  paginated(res, result.users, result.pagination)
}

const getUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id, req.tenant._id)
  success(res, user)
}

const updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.tenant._id, req.body)
  success(res, user)
}

const updateMe = async (req, res) => {
  const user = await userService.updateUser(req.user._id, req.tenant?._id || req.user.tenantId, req.body)
  success(res, user)
}

const toggleStatus = async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id, req.tenant._id)
  success(res, user)
}

const deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id, req.tenant._id)
  success(res, null, 'User deleted')
}

const assignRole = async (req, res) => {
  await userService.assignRole(req.params.id, req.body.roleId, req.tenant._id, req.user._id)
  success(res, null, 'Role assigned')
}

const removeRole = async (req, res) => {
  await userService.removeRole(req.params.id, req.params.roleId, req.tenant._id)
  success(res, null, 'Role removed')
}

module.exports = { getUsers, getUserById, updateUser, updateMe, toggleStatus, deleteUser, assignRole, removeRole }
