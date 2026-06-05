const slugify = require('slugify')
const Tenant  = require('../models/Tenant.model')
const User    = require('../models/User.model')
const Role    = require('../models/Role.model')
const UserRole = require('../models/UserRole.model')
const { ROLES } = require('../constants/roles.constants')

const getTenants = async ({ page = 1, limit = 20, search, status }) => {
  const query = { isDeleted: false }
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { slug: { $regex: search, $options: 'i' } }]
  if (status) query.status = status
  const total   = await Tenant.countDocuments(query)
  const tenants = await Tenant.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
  return { tenants, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
}

const createTenant = async (data, createdBy) => {
  const slug = slugify(data.name, { lower: true, strict: true })
  const exists = await Tenant.findOne({ slug })
  if (exists) throw Object.assign(new Error('Tenant slug already exists'), { statusCode: 409 })
  return Tenant.create({ ...data, slug, createdBy })
}

const updateTenant = async (tenantId, data) => {
  return Tenant.findByIdAndUpdate(tenantId, { $set: data }, { new: true, runValidators: true })
}

const suspendTenant = async (tenantId) =>
  Tenant.findByIdAndUpdate(tenantId, { status: 'suspended' }, { new: true })

const activateTenant = async (tenantId) =>
  Tenant.findByIdAndUpdate(tenantId, { status: 'active' }, { new: true })

module.exports = { getTenants, createTenant, updateTenant, suspendTenant, activateTenant }
