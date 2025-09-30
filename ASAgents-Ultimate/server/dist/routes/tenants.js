import { Router } from 'express';
import { tenantService } from '../services/tenantService.js';
// import { auth0Middleware } from '../middleware/auth0.js';
import { logger } from '../utils/logger.js';
const router = Router();
// Create a new tenant
router.post('/', async (req, res) => {
    try {
        const { name, plan, settings } = req.body;
        if (!name || !plan) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Name and plan are required'
            });
        }
        if (!['free', 'growth', 'enterprise'].includes(plan)) {
            return res.status(400).json({
                error: 'Invalid plan',
                message: 'Plan must be one of: free, growth, enterprise'
            });
        }
        const result = await tenantService.createTenant({
            name,
            plan,
            settings: settings || {}
        });
        if (result.success) {
            res.status(201).json({
                success: true,
                tenant: result.tenant,
                message: 'Tenant created successfully'
            });
        }
        else {
            res.status(400).json({
                error: 'Tenant creation failed',
                message: result.error
            });
        }
    }
    catch (error) {
        logger.error({ error }, 'Tenant creation failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create tenant'
        });
    }
});
// Get tenant by ID
router.get('/:id', async (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        if (isNaN(tenantId)) {
            return res.status(400).json({
                error: 'Invalid tenant ID',
                message: 'Tenant ID must be a number'
            });
        }
        const tenant = await tenantService.getTenantById(tenantId);
        if (!tenant) {
            return res.status(404).json({
                error: 'Tenant not found',
                message: 'No tenant found with this ID'
            });
        }
        res.json({
            success: true,
            tenant
        });
    }
    catch (error) {
        logger.error({ error }, 'Get tenant failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get tenant'
        });
    }
});
// Get tenant by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const tenant = await tenantService.getTenantBySlug(slug);
        if (!tenant) {
            return res.status(404).json({
                error: 'Tenant not found',
                message: 'No tenant found with this slug'
            });
        }
        res.json({
            success: true,
            tenant
        });
    }
    catch (error) {
        logger.error({ error }, 'Get tenant by slug failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get tenant'
        });
    }
});
// List tenants with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                error: 'Invalid pagination parameters',
                message: 'Page must be >= 1 and limit must be between 1 and 100'
            });
        }
        const result = await tenantService.listTenants(page, limit);
        res.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        logger.error({ error }, 'List tenants failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to list tenants'
        });
    }
});
// Update tenant
router.put('/:id', async (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        const { name, plan, settings } = req.body;
        if (isNaN(tenantId)) {
            return res.status(400).json({
                error: 'Invalid tenant ID',
                message: 'Tenant ID must be a number'
            });
        }
        if (plan && !['free', 'growth', 'enterprise'].includes(plan)) {
            return res.status(400).json({
                error: 'Invalid plan',
                message: 'Plan must be one of: free, growth, enterprise'
            });
        }
        const updates = {};
        if (name)
            updates.name = name;
        if (plan)
            updates.plan = plan;
        if (settings)
            updates.settings = settings;
        const result = await tenantService.updateTenant(tenantId, updates);
        if (result.success) {
            res.json({
                success: true,
                message: 'Tenant updated successfully'
            });
        }
        else {
            res.status(400).json({
                error: 'Tenant update failed',
                message: result.error
            });
        }
    }
    catch (error) {
        logger.error({ error }, 'Tenant update failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update tenant'
        });
    }
});
// Delete tenant
router.delete('/:id', async (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        if (isNaN(tenantId)) {
            return res.status(400).json({
                error: 'Invalid tenant ID',
                message: 'Tenant ID must be a number'
            });
        }
        const result = await tenantService.deleteTenant(tenantId);
        if (result.success) {
            res.json({
                success: true,
                message: 'Tenant deleted successfully'
            });
        }
        else {
            res.status(400).json({
                error: 'Tenant deletion failed',
                message: result.error
            });
        }
    }
    catch (error) {
        logger.error({ error }, 'Tenant deletion failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete tenant'
        });
    }
});
// Get tenant statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        if (isNaN(tenantId)) {
            return res.status(400).json({
                error: 'Invalid tenant ID',
                message: 'Tenant ID must be a number'
            });
        }
        // This would typically fetch real statistics from the database
        const stats = {
            users: 5,
            projects: 12,
            invoices: 8,
            totalRevenue: 15000,
            activeProjects: 7,
            completedProjects: 5,
            storageUsed: 512, // MB
            lastActivity: new Date().toISOString()
        };
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        logger.error({ error }, 'Get tenant stats failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get tenant statistics'
        });
    }
});
export default router;
