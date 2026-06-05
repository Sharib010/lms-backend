const Tenant = require('../models/Tenant.model')

const tenantMiddleware = async (req, res, next) => {
  try {
    // Resolve from header (X-Tenant-Slug) or subdomain
    const slug =
      req.headers['x-tenant-slug'] ||
      req.headers['x-tenant-id'] ||
      req.subdomains?.[0] ||
      null

    if (!slug) return next() // public routes have no tenant

    const tenant = await Tenant.findOne({ slug, status: 'active', isDeleted: false })
    if (tenant) req.tenant = tenant
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { tenantMiddleware }
