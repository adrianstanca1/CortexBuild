/**
 * Company Context Middleware
 * CRITICAL: Ensures multi-tenant isolation for all API requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserCompanyId, verifyCompanyAccess } from '../supabase/client';

export interface CompanyContext {
    userId: string;
    companyId: string;
    userRole: string;
}

/**
 * Extract user ID from JWT token or session
 */
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    
    // TODO: Verify JWT and extract user ID
    // For now, we'll use a simple approach
    // In production, use proper JWT verification
    
    try {
        // Decode JWT (simplified - use proper JWT library in production)
        const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        );
        
        return payload.sub || payload.userId;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
}

/**
 * Company Context Middleware
 * Validates user authentication and sets company context
 */
export async function withCompanyContext(
    req: NextRequest,
    handler: (req: NextRequest, context: CompanyContext) => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        // 1. Extract user ID from request
        const userId = await getUserIdFromRequest(req);
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token' },
                { status: 401 }
            );
        }

        // 2. Get user's company ID
        let companyId: string;
        try {
            companyId = await getUserCompanyId(userId);
        } catch (error) {
            return NextResponse.json(
                { error: 'User company not found' },
                { status: 403 }
            );
        }

        // 3. Verify company access if companyId is in request body/params
        const requestCompanyId = await getCompanyIdFromRequest(req);
        if (requestCompanyId && requestCompanyId !== companyId) {
            // SECURITY: User trying to access another company's data
            console.warn(`Security violation: User ${userId} attempted to access company ${requestCompanyId}`);
            
            return NextResponse.json(
                { error: 'Forbidden - Access denied to this company' },
                { status: 403 }
            );
        }

        // 4. Create company context
        const context: CompanyContext = {
            userId,
            companyId,
            userRole: 'user', // TODO: Get from user record
        };

        // 5. Call handler with context
        return await handler(req, context);
        
    } catch (error) {
        console.error('Company context middleware error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Extract company ID from request (body or query params)
 */
async function getCompanyIdFromRequest(req: NextRequest): Promise<string | null> {
    // Check query params
    const companyId = req.nextUrl.searchParams.get('companyId');
    if (companyId) return companyId;

    // Check request body
    try {
        const body = await req.clone().json();
        return body.companyId || body.company_id || null;
    } catch {
        return null;
    }
}

/**
 * Audit log helper
 * Logs all operations for compliance
 */
export async function auditLog(
    context: CompanyContext,
    action: string,
    entityType: string,
    entityId: string,
    oldValues?: any,
    newValues?: any
) {
    const { createServerClient } = await import('../supabase/client');
    const client = createServerClient();

    await client.from('audit_logs').insert({
        company_id: context.companyId,
        user_id: context.userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: null, // TODO: Get from request
        user_agent: null, // TODO: Get from request
    });
}

/**
 * Role-based access control helper
 */
export function requireRole(context: CompanyContext, allowedRoles: string[]): boolean {
    return allowedRoles.includes(context.userRole);
}

/**
 * Validate company ownership of resource
 * SECURITY: Ensures resource belongs to user's company
 */
export async function validateResourceOwnership(
    companyId: string,
    table: string,
    resourceId: string
): Promise<boolean> {
    const { createServerClient } = await import('../supabase/client');
    const client = createServerClient();

    const { data, error } = await client
        .from(table as any)
        .select('company_id')
        .eq('id', resourceId)
        .single();

    if (error || !data) {
        return false;
    }

    return data.company_id === companyId;
}

/**
 * Helper to create company-scoped query
 * Automatically adds company_id filter
 */
export function createCompanyQuery<T>(
    client: any,
    table: string,
    companyId: string
) {
    return client
        .from(table)
        .select('*')
        .eq('company_id', companyId);
}

