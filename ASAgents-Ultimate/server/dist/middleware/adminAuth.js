import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { logger } from '../utils/logger.js';
import { AdminUserService } from '../services/adminUserService.js';
/**
 * Authenticate admin user from JWT token
 */
export async function authenticateAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Admin authentication required',
                code: 'ADMIN_AUTH_REQUIRED'
            });
        }
        const token = authHeader.substring(7);
        // Verify JWT token
        const decoded = jwt.verify(token, env.jwtAccessSecret, {
            issuer: 'asagents-platform',
            audience: 'admin'
        });
        // Verify token type
        if (decoded.type !== 'admin') {
            return res.status(401).json({
                message: 'Invalid token type',
                code: 'INVALID_TOKEN_TYPE'
            });
        }
        // Get admin user to verify account is still active
        try {
            const admin = await AdminUserService.getAdminById(decoded.adminId);
            if (!admin.isActive) {
                return res.status(401).json({
                    message: 'Admin account is disabled',
                    code: 'ADMIN_ACCOUNT_DISABLED'
                });
            }
            // Check if account is locked
            if (admin.lockedUntil && new Date() < admin.lockedUntil) {
                return res.status(423).json({
                    message: 'Admin account is temporarily locked',
                    code: 'ADMIN_ACCOUNT_LOCKED'
                });
            }
            // Set admin context
            req.admin = {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                type: 'admin'
            };
            // Add admin context headers for debugging
            res.setHeader('X-Admin-ID', admin.id);
            res.setHeader('X-Admin-Role', admin.role);
            next();
        }
        catch (error) {
            logger.error({ error, adminId: decoded.adminId }, 'Failed to verify admin user');
            return res.status(401).json({
                message: 'Admin user not found',
                code: 'ADMIN_NOT_FOUND'
            });
        }
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: 'Invalid admin token',
                code: 'INVALID_ADMIN_TOKEN'
            });
        }
        logger.error({ error }, 'Admin authentication failed');
        return res.status(500).json({
            message: 'Admin authentication error',
            code: 'ADMIN_AUTH_ERROR'
        });
    }
}
/**
 * Require specific admin role
 */
export function requireAdminRole(roles) {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Admin authentication required',
                code: 'ADMIN_AUTH_REQUIRED'
            });
        }
        if (!roles.includes(req.admin.role)) {
            logger.warn({
                adminId: req.admin.id,
                requiredRoles: roles,
                actualRole: req.admin.role
            }, 'Admin role access denied');
            return res.status(403).json({
                message: 'Insufficient admin privileges',
                code: 'INSUFFICIENT_ADMIN_PRIVILEGES',
                required: roles,
                current: req.admin.role
            });
        }
        next();
    };
}
/**
 * Require specific admin permission
 */
export function requireAdminPermission(permissions) {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Admin authentication required',
                code: 'ADMIN_AUTH_REQUIRED'
            });
        }
        const hasPermission = permissions.some(permission => req.admin.permissions.includes(permission));
        if (!hasPermission) {
            logger.warn({
                adminId: req.admin.id,
                requiredPermissions: permissions,
                actualPermissions: req.admin.permissions
            }, 'Admin permission access denied');
            return res.status(403).json({
                message: 'Insufficient admin permissions',
                code: 'INSUFFICIENT_ADMIN_PERMISSIONS',
                required: permissions,
                current: req.admin.permissions
            });
        }
        next();
    };
}
/**
 * Super admin only access
 */
export const requireSuperAdmin = requireAdminRole(['super_admin']);
/**
 * Platform admin or higher access
 */
export const requirePlatformAdmin = requireAdminRole(['super_admin', 'platform_admin']);
/**
 * Any admin access (including support admin)
 */
export const requireAnyAdmin = requireAdminRole(['super_admin', 'platform_admin', 'support_admin']);
/**
 * Audit logging middleware for admin actions
 */
export function auditAdminAction(action, resourceType) {
    return async (req, res, next) => {
        if (!req.admin) {
            return next();
        }
        // Store audit info for later logging
        req.auditInfo = {
            action,
            resourceType,
            adminId: req.admin.id,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('User-Agent')
        };
        // Override res.json to capture response for audit
        const originalJson = res.json;
        res.json = function (body) {
            // Log the action after response
            setImmediate(async () => {
                try {
                    if (req.auditInfo) {
                        const resourceId = body?.id || req.params?.id || null;
                        const tenantId = body?.tenantId || req.params?.tenantId || null;
                        await AdminUserService.logAdminAction(req.auditInfo.adminId, req.auditInfo.action, req.auditInfo.resourceType, resourceId, tenantId ? parseInt(tenantId) : null, {
                            method: req.method,
                            path: req.path,
                            query: req.query,
                            body: req.body,
                            response: body
                        }, req.auditInfo.ipAddress || null, req.auditInfo.userAgent || null);
                    }
                }
                catch (error) {
                    logger.error({ error }, 'Failed to log admin audit action');
                }
            });
            return originalJson.call(this, body);
        };
        next();
    };
}
