import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest } from './authenticate.js';

/**
 * Enhanced Tenant Isolation Middleware
 * Ensures strict data isolation between tenants
 */

export interface TenantIsolatedRequest extends AuthenticatedRequest {
  tenantContext: {
    id: number;
    plan: string;
    limits: TenantLimits;
    features: string[];
  };
}

interface TenantLimits {
  maxUsers: number;
  maxProjects: number;
  maxStorageGB: number;
  maxAPICallsPerHour: number;
  maxFileUploadMB: number;
}

const TENANT_LIMITS: Record<string, TenantLimits> = {
  free: {
    maxUsers: 5,
    maxProjects: 3,
    maxStorageGB: 1,
    maxAPICallsPerHour: 100,
    maxFileUploadMB: 10
  },
  growth: {
    maxUsers: 25,
    maxProjects: 15,
    maxStorageGB: 10,
    maxAPICallsPerHour: 1000,
    maxFileUploadMB: 50
  },
  enterprise: {
    maxUsers: 500,
    maxProjects: 100,
    maxStorageGB: 100,
    maxAPICallsPerHour: 10000,
    maxFileUploadMB: 500
  }
};

const TENANT_FEATURES: Record<string, string[]> = {
  free: ['basic_projects', 'basic_tasks', 'basic_reporting'],
  growth: ['basic_projects', 'basic_tasks', 'basic_reporting', 'advanced_analytics', 'integrations', 'custom_fields'],
  enterprise: ['basic_projects', 'basic_tasks', 'basic_reporting', 'advanced_analytics', 'integrations', 'custom_fields', 'api_access', 'sso', 'audit_logs', 'priority_support']
};

/**
 * Middleware to enforce tenant isolation and context
 */
export function tenantIsolation() {
  return async (req: TenantIsolatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const tenantId = req.tenantId;
      const tenantPlan = req.user.tenantPlan || 'free';

      // Set tenant context
      req.tenantContext = {
        id: tenantId,
        plan: tenantPlan,
        limits: TENANT_LIMITS[tenantPlan] || TENANT_LIMITS.free,
        features: TENANT_FEATURES[tenantPlan] || TENANT_FEATURES.free
      };

      // Add tenant isolation headers
      res.setHeader('X-Tenant-ID', tenantId);
      res.setHeader('X-Tenant-Plan', tenantPlan);

      // Log tenant access for audit
      logger.debug({
        tenantId,
        userId: req.user.userId,
        method: req.method,
        path: req.path,
        plan: tenantPlan
      }, 'Tenant access logged');

      next();
    } catch (error) {
      logger.error({ error }, 'Tenant isolation middleware failed');
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

/**
 * Middleware to check if tenant has access to specific features
 */
export function requireFeature(feature: string) {
  return (req: TenantIsolatedRequest, res: Response, next: NextFunction) => {
    if (!req.tenantContext?.features.includes(feature)) {
      logger.warn({
        tenantId: req.tenantContext?.id,
        feature,
        plan: req.tenantContext?.plan
      }, 'Feature access denied');
      
      return res.status(403).json({ 
        message: 'Feature not available in your plan',
        feature,
        currentPlan: req.tenantContext?.plan,
        upgradeRequired: true
      });
    }
    next();
  };
}

/**
 * Middleware to enforce tenant resource limits
 */
export function enforceLimits(resource: keyof TenantLimits) {
  return async (req: TenantIsolatedRequest, res: Response, next: NextFunction) => {
    try {
      const limit = req.tenantContext?.limits[resource];
      if (!limit) {
        return next();
      }

      // This would typically check current usage against limits
      // For now, we'll just add the limit to the request context
      req.resourceLimit = limit;
      
      logger.debug({
        tenantId: req.tenantContext?.id,
        resource,
        limit
      }, 'Resource limit enforced');

      next();
    } catch (error) {
      logger.error({ error }, 'Resource limit enforcement failed');
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

/**
 * Utility function to validate tenant access to resource
 */
export function validateTenantAccess(resourceTenantId: number, requestTenantId: number): boolean {
  return resourceTenantId === requestTenantId;
}

/**
 * SQL query helper to automatically add tenant filtering
 */
export function addTenantFilter(baseQuery: string, tenantId: number): { query: string; params: any[] } {
  // Simple implementation - in production, this would be more sophisticated
  if (baseQuery.toLowerCase().includes('where')) {
    return {
      query: `${baseQuery} AND tenant_id = ?`,
      params: [tenantId]
    };
  } else {
    return {
      query: `${baseQuery} WHERE tenant_id = ?`,
      params: [tenantId]
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      resourceLimit?: number;
    }
  }
}
