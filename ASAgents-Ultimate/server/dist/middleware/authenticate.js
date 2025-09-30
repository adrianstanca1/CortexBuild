import { verifyAccessToken } from '../services/auth.js';
import { pool } from '../services/db.js';
import { logger } from '../utils/logger.js';
export async function authenticateUser(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing token' });
    }
    try {
        const token = header.substring('Bearer '.length);
        const payload = verifyAccessToken(token);
        if (!payload.sub || !payload.tenant_id) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        // Enhanced tenant isolation - verify token tenant matches request context
        const requestTenantId = req.headers['x-tenant-id'];
        if (requestTenantId && parseInt(requestTenantId) !== payload.tenant_id) {
            logger.warn({
                tokenTenant: payload.tenant_id,
                requestTenant: requestTenantId,
                userId: payload.sub
            }, 'Tenant mismatch detected');
            return res.status(403).json({ message: 'Tenant access denied' });
        }
        // Get user from database with enhanced tenant validation
        const [rows] = await pool.query(`SELECT u.*, t.is_active as tenant_active, t.plan as tenant_plan
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = ? AND u.tenant_id = ? AND u.is_active = 1 AND t.is_active = 1`, [payload.sub, payload.tenant_id]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'User not found or tenant inactive' });
        }
        const user = rows[0];
        // Enhanced security: Check for suspicious activity
        if (user.failed_login_attempts >= 5) {
            logger.warn({ userId: user.id, tenantId: user.tenant_id }, 'User account locked due to failed attempts');
            return res.status(423).json({ message: 'Account temporarily locked' });
        }
        req.user = payload;
        req.tenantId = user.tenant_id;
        // Add tenant context to response headers for debugging
        res.setHeader('X-Tenant-Context', user.tenant_id);
        return next();
    }
    catch (error) {
        logger.error({ error }, 'Authentication failed');
        return res.status(401).json({ message: 'Invalid token' });
    }
}
export function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        return next();
    };
}
