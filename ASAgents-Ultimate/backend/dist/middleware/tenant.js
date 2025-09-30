"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantContext = tenantContext;
exports.requireTenant = requireTenant;
function tenantContext(req, res, next) {
    const headerTenant = req.header('X-Tenant-ID');
    const userCompany = req.user?.company_id;
    req.tenant_id = headerTenant || userCompany || null;
    next();
}
function requireTenant(req, res, next) {
    if (!req.tenant_id) {
        return res.status(400).json({ success: false, message: 'Tenant context required' });
    }
    next();
}
//# sourceMappingURL=tenant.js.map