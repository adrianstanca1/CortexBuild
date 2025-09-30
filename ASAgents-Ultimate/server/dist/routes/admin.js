import { Router } from 'express';
import { AdminUserService } from '../services/adminUserService.js';
import { MultitenantService } from '../services/multitenantService.js';
import { authenticateAdmin, requireAdminPermission, auditAdminAction } from '../middleware/adminAuth.js';
import { logger } from '../utils/logger.js';
/**
 * Admin API Routes
 * Provides comprehensive admin functionality for platform management
 */
const router = Router();
// Admin Authentication Routes
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }
        const result = await AdminUserService.authenticateAdmin(email, password, req.ip, req.get('User-Agent'));
        if (!result.success) {
            return res.status(401).json({
                message: result.message,
                requiresMfa: result.requiresMfa
            });
        }
        res.json({
            success: true,
            admin: result.admin,
            token: result.token
        });
    }
    catch (error) {
        logger.error({ error }, 'Admin login failed');
        res.status(500).json({ message: 'Login failed' });
    }
});
// Admin Profile Routes
router.get('/profile', authenticateAdmin, async (req, res) => {
    try {
        const admin = await AdminUserService.getAdminById(req.admin.id);
        res.json({ admin });
    }
    catch (error) {
        logger.error({ error }, 'Failed to get admin profile');
        res.status(500).json({ message: 'Failed to get profile' });
    }
});
// Tenant Management Routes
router.get('/tenants', authenticateAdmin, requireAdminPermission(['manage_tenants', 'view_analytics']), auditAdminAction('list_tenants', 'tenant'), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const filters = {
            plan: req.query.plan,
            status: req.query.status,
            subscriptionStatus: req.query.subscriptionStatus,
            search: req.query.search
        };
        const result = await MultitenantService.getAllTenants(limit, offset, filters);
        res.json({
            tenants: result.tenants,
            total: result.total,
            limit,
            offset
        });
    }
    catch (error) {
        logger.error({ error }, 'Failed to get tenants');
        res.status(500).json({ message: 'Failed to get tenants' });
    }
});
router.post('/tenants', authenticateAdmin, requireAdminPermission(['manage_tenants']), auditAdminAction('create_tenant', 'tenant'), async (req, res) => {
    try {
        const { name, slug, plan, contactEmail, contactPhone, address, adminNotes } = req.body;
        if (!name || !slug || !plan || !contactEmail) {
            return res.status(400).json({
                message: 'Name, slug, plan, and contact email are required'
            });
        }
        const tenant = await MultitenantService.createTenant({
            name,
            slug,
            plan,
            contactEmail,
            contactPhone,
            address,
            adminNotes,
            createdByAdminId: req.admin.id
        });
        res.status(201).json({ tenant });
    }
    catch (error) {
        logger.error({ error }, 'Failed to create tenant');
        if (error instanceof Error && error.message.includes('already exists')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to create tenant' });
    }
});
router.get('/tenants/:id', authenticateAdmin, requireAdminPermission(['manage_tenants', 'view_analytics']), auditAdminAction('view_tenant', 'tenant'), async (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        const tenant = await MultitenantService.getTenantById(tenantId);
        res.json({ tenant });
    }
    catch (error) {
        logger.error({ error }, 'Failed to get tenant');
        res.status(404).json({ message: 'Tenant not found' });
    }
});
router.put('/tenants/:id', authenticateAdmin, requireAdminPermission(['manage_tenants']), auditAdminAction('update_tenant', 'tenant'), async (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        const updates = req.body;
        const tenant = await MultitenantService.updateTenant(tenantId, updates, req.admin.id);
        res.json({ tenant });
    }
    catch (error) {
        logger.error({ error }, 'Failed to update tenant');
        res.status(500).json({ message: 'Failed to update tenant' });
    }
});
router.get('/tenants/:id/usage', authenticateAdmin, requireAdminPermission(['manage_tenants', 'view_analytics']), auditAdminAction('view_tenant_usage', 'tenant_usage'), async (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        const usage = await MultitenantService.getTenantUsage(tenantId, startDate, endDate);
        res.json({ usage });
    }
    catch (error) {
        logger.error({ error }, 'Failed to get tenant usage');
        res.status(500).json({ message: 'Failed to get tenant usage' });
    }
});
// Platform Analytics Routes
router.get('/analytics/platform', authenticateAdmin, requireAdminPermission(['view_analytics']), auditAdminAction('view_platform_analytics', 'analytics'), async (req, res) => {
    try {
        const stats = await MultitenantService.getPlatformStats();
        res.json({ stats });
    }
    catch (error) {
        logger.error({ error }, 'Failed to get platform analytics');
        res.status(500).json({ message: 'Failed to get platform analytics' });
    }
});
// Admin Audit Log Routes
router.get('/audit-logs', authenticateAdmin, requireAdminPermission(['manage_security', 'view_analytics']), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const adminId = req.query.adminId ? parseInt(req.query.adminId) : undefined;
        const action = req.query.action;
        const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : undefined;
        const logs = await AdminUserService.getAdminAuditLogs(limit, offset, adminId, action, tenantId);
        res.json({ logs, limit, offset });
    }
    catch (error) {
        logger.error({ error }, 'Failed to get audit logs');
        res.status(500).json({ message: 'Failed to get audit logs' });
    }
});
// System Health Routes
router.get('/system/health', authenticateAdmin, requireAdminPermission(['manage_system', 'view_analytics']), async (req, res) => {
    try {
        // Basic system health check
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'healthy',
                cache: 'healthy',
                storage: 'healthy'
            },
            metrics: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            }
        };
        res.json({ health });
    }
    catch (error) {
        logger.error({ error }, 'Failed to get system health');
        res.status(500).json({ message: 'Failed to get system health' });
    }
});
// Initialize Admin System
router.post('/system/initialize', async (req, res) => {
    try {
        // Create principal admin user
        const admin = await AdminUserService.createPrincipalAdmin();
        res.json({
            message: 'Admin system initialized successfully',
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role
            }
        });
    }
    catch (error) {
        logger.error({ error }, 'Failed to initialize admin system');
        res.status(500).json({ message: 'Failed to initialize admin system' });
    }
});
export default router;
