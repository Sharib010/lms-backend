const tenantService = require('../services/tenant.service')
const { success, paginated } = require('../utils/response.util')

const getTenants   = async (req, res) => { const r = await tenantService.getTenants(req.query); paginated(res, r.tenants, r.pagination) }
const createTenant = async (req, res) => { const t = await tenantService.createTenant(req.body, req.user._id); success(res, t, 'Tenant created', 201) }
const updateTenant = async (req, res) => { const t = await tenantService.updateTenant(req.params.id, req.body); success(res, t) }
const suspend      = async (req, res) => { const t = await tenantService.suspendTenant(req.params.id); success(res, t, 'Tenant suspended') }
const activate     = async (req, res) => { const t = await tenantService.activateTenant(req.params.id); success(res, t, 'Tenant activated') }

module.exports = { getTenants, createTenant, updateTenant, suspend, activate }
