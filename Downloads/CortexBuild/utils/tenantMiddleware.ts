/**
 * Tenant Middleware
 * 
 * Provides middleware functions for validating tenant access,
 * enforcing data isolation, and logging tenant operations.
 */

import { supabase } from '../supabaseClient';
import { User } from '../types';
import { TenantContext, validateTenantAccess } from './tenantContext';
import { hasPermission, Permission } from './permissions';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TenantValidationResult {
    allowed: boolean;
    reason?: string;
    companyId?: string;
}

export interface QueryFilter {
    company_id?: string;
    [key: string]: any;
}

// ============================================================================
// TENANT VALIDATION
// ============================================================================

/**
 * Validate that a user can access a specific company's data
 */
export const validateCompanyAccess = (
    user: User,
    targetCompanyId: string
): TenantValidationResult => {
    // Super admins can access all companies
    if (user.role === 'super_admin') {
        return {
            allowed: true,
            companyId: targetCompanyId,
        };
    }
    
    // Regular users can only access their own company
    if (user.companyId !== targetCompanyId) {
        return {
            allowed: false,
            reason: 'Access denied: You can only access data from your own company',
        };
    }
    
    return {
        allowed: true,
        companyId: targetCompanyId,
    };
};

/**
 * Validate that a resource belongs to the user's company
 */
export const validateResourceAccess = async (
    user: User,
    tableName: string,
    resourceId: string
): Promise<TenantValidationResult> => {
    // Super admins can access everything
    if (user.role === 'super_admin') {
        return { allowed: true };
    }
    
    if (!supabase) {
        return {
            allowed: false,
            reason: 'Database not available',
        };
    }
    
    try {
        // Query the resource to get its company_id
        const { data, error } = await supabase
            .from(tableName)
            .select('company_id')
            .eq('id', resourceId)
            .single();
        
        if (error || !data) {
            return {
                allowed: false,
                reason: 'Resource not found',
            };
        }
        
        // Validate company access
        return validateCompanyAccess(user, data.company_id);
    } catch (error) {
        console.error('❌ Error validating resource access:', error);
        return {
            allowed: false,
            reason: 'Error validating access',
        };
    }
};

/**
 * Require company access or throw error
 */
export const requireCompanyAccess = (
    user: User,
    targetCompanyId: string
): void => {
    const result = validateCompanyAccess(user, targetCompanyId);
    
    if (!result.allowed) {
        throw new Error(result.reason || 'Access denied');
    }
};

/**
 * Require resource access or throw error
 */
export const requireResourceAccess = async (
    user: User,
    tableName: string,
    resourceId: string
): Promise<void> => {
    const result = await validateResourceAccess(user, tableName, resourceId);
    
    if (!result.allowed) {
        throw new Error(result.reason || 'Access denied');
    }
};

// ============================================================================
// QUERY FILTERING
// ============================================================================

/**
 * Add company_id filter to query based on user's tenant
 */
export const addTenantFilter = (
    user: User,
    baseFilter: QueryFilter = {}
): QueryFilter => {
    // Super admins don't need tenant filtering
    if (user.role === 'super_admin') {
        return baseFilter;
    }
    
    // Add company_id filter for regular users
    return {
        ...baseFilter,
        company_id: user.companyId,
    };
};

/**
 * Build Supabase query with tenant filtering
 */
export const buildTenantQuery = (
    user: User,
    tableName: string,
    selectFields: string = '*'
) => {
    if (!supabase) {
        throw new Error('Database not available');
    }
    
    let query = supabase.from(tableName).select(selectFields);
    
    // Add tenant filter for non-super-admins
    if (user.role !== 'super_admin') {
        query = query.eq('company_id', user.companyId);
    }
    
    return query;
};

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Log a tenant action to audit logs
 */
export const logTenantAction = async (
    user: User,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: any
): Promise<void> => {
    if (!supabase) {
        console.warn('⚠️ Audit logging skipped: Database not available');
        return;
    }
    
    try {
        await supabase.from('audit_logs').insert({
            company_id: user.companyId,
            user_id: user.id,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            metadata: metadata || {},
        });
    } catch (error) {
        console.error('❌ Error logging audit action:', error);
        // Don't throw - audit logging failure shouldn't break the operation
    }
};

/**
 * Wrapper for operations that need audit logging
 */
export const withAuditLog = async <T>(
    user: User,
    action: string,
    resourceType: string,
    operation: () => Promise<T>,
    resourceId?: string
): Promise<T> => {
    try {
        const result = await operation();
        
        // Log successful operation
        await logTenantAction(user, action, resourceType, resourceId, {
            success: true,
        });
        
        return result;
    } catch (error: any) {
        // Log failed operation
        await logTenantAction(user, action, resourceType, resourceId, {
            success: false,
            error: error.message,
        });
        
        throw error;
    }
};

// ============================================================================
// PERMISSION VALIDATION
// ============================================================================

/**
 * Validate that user has required permission
 */
export const validatePermission = (
    user: User,
    permission: Permission
): TenantValidationResult => {
    if (hasPermission(user, permission)) {
        return { allowed: true };
    }
    
    return {
        allowed: false,
        reason: `Permission denied: ${permission} required`,
    };
};

/**
 * Require permission or throw error
 */
export const requirePermission = (
    user: User,
    permission: Permission
): void => {
    const result = validatePermission(user, permission);
    
    if (!result.allowed) {
        throw new Error(result.reason || 'Permission denied');
    }
};

/**
 * Validate permission and company access together
 */
export const validatePermissionAndAccess = (
    user: User,
    permission: Permission,
    targetCompanyId: string
): TenantValidationResult => {
    // Check permission first
    const permissionResult = validatePermission(user, permission);
    if (!permissionResult.allowed) {
        return permissionResult;
    }
    
    // Then check company access
    return validateCompanyAccess(user, targetCompanyId);
};

// ============================================================================
// DATA SANITIZATION
// ============================================================================

/**
 * Ensure data has correct company_id before insert/update
 */
export const sanitizeDataForTenant = (
    user: User,
    data: any
): any => {
    // Super admins can set any company_id
    if (user.role === 'super_admin') {
        return data;
    }
    
    // Regular users must use their own company_id
    return {
        ...data,
        company_id: user.companyId,
    };
};

/**
 * Remove sensitive fields based on user role
 */
export const sanitizeDataForRole = (
    user: User,
    data: any,
    sensitiveFields: string[] = []
): any => {
    // Super admins and company admins see everything
    if (user.role === 'super_admin' || user.role === 'company_admin') {
        return data;
    }
    
    // Remove sensitive fields for other roles
    const sanitized = { ...data };
    sensitiveFields.forEach(field => {
        delete sanitized[field];
    });
    
    return sanitized;
};

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Validate access to multiple resources
 */
export const validateBatchAccess = async (
    user: User,
    tableName: string,
    resourceIds: string[]
): Promise<{
    allowed: string[];
    denied: string[];
}> => {
    // Super admins can access everything
    if (user.role === 'super_admin') {
        return {
            allowed: resourceIds,
            denied: [],
        };
    }
    
    if (!supabase) {
        return {
            allowed: [],
            denied: resourceIds,
        };
    }
    
    try {
        // Query all resources
        const { data, error } = await supabase
            .from(tableName)
            .select('id, company_id')
            .in('id', resourceIds);
        
        if (error || !data) {
            return {
                allowed: [],
                denied: resourceIds,
            };
        }
        
        // Separate allowed and denied
        const allowed: string[] = [];
        const denied: string[] = [];
        
        data.forEach((resource: any) => {
            if (resource.company_id === user.companyId) {
                allowed.push(resource.id);
            } else {
                denied.push(resource.id);
            }
        });
        
        // Add resources that weren't found to denied
        const foundIds = data.map((r: any) => r.id);
        resourceIds.forEach(id => {
            if (!foundIds.includes(id)) {
                denied.push(id);
            }
        });
        
        return { allowed, denied };
    } catch (error) {
        console.error('❌ Error validating batch access:', error);
        return {
            allowed: [],
            denied: resourceIds,
        };
    }
};

