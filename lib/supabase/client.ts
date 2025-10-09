/**
 * Supabase Client Configuration
 * Multi-tenant aware client with company isolation
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

// Server-side Supabase client (for API routes)
export const createServerClient = () => {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
};

/**
 * Set company context for RLS
 * CRITICAL: Must be called before any query to ensure multi-tenant isolation
 */
export async function setCompanyContext(companyId: string) {
    const client = createServerClient();
    
    // Set PostgreSQL session variable for RLS
    const { error } = await client.rpc('set_company_context', {
        company_id: companyId,
    });

    if (error) {
        console.error('Failed to set company context:', error);
        throw new Error('Failed to set company context');
    }

    return client;
}

/**
 * Get user's company ID from session
 * CRITICAL: This is the source of truth for multi-tenant isolation
 */
export async function getUserCompanyId(userId: string): Promise<string> {
    const client = createServerClient();
    
    const { data, error } = await client
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

    if (error || !data?.company_id) {
        throw new Error('User company not found');
    }

    return data.company_id;
}

/**
 * Create a company-aware client
 * Automatically sets company context for all queries
 */
export async function createCompanyClient(userId: string) {
    const companyId = await getUserCompanyId(userId);
    const client = await setCompanyContext(companyId);
    
    return {
        client,
        companyId,
    };
}

/**
 * Verify user has access to company
 * SECURITY: Prevents cross-tenant data access
 */
export async function verifyCompanyAccess(
    userId: string,
    companyId: string
): Promise<boolean> {
    const userCompanyId = await getUserCompanyId(userId);
    return userCompanyId === companyId;
}

/**
 * Get active AI agent subscriptions for company
 * Used for marketplace feature
 */
export async function getCompanySubscriptions(companyId: string) {
    const client = createServerClient();
    
    const { data, error } = await client
        .from('company_subscriptions')
        .select(`
            *,
            agent:agents(*)
        `)
        .eq('company_id', companyId)
        .eq('status', 'active');

    if (error) {
        console.error('Failed to get company subscriptions:', error);
        return [];
    }

    return data || [];
}

export type { Database };

