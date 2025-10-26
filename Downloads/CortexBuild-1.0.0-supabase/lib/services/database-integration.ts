/**
 * Database Integration Service
 * Connects all admin components to the real database (Supabase + SQLite)
 */

import { supabase } from '../../supabaseClient';

// ============================================
// USER MANAGEMENT
// ============================================

export interface DBUser {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    company_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DBUserPermission {
    user_id: string;
    permission: string;
    granted_at: string;
}

export interface DBTeam {
    id: string;
    name: string;
    description: string;
    company_id: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface DBTeamMember {
    team_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
}

// ============================================
// APP MANAGEMENT
// ============================================

export interface DBApp {
    id: string;
    name: string;
    description: string;
    category: string;
    version: string;
    author_id: string;
    company_id: string;
    visibility: 'public' | 'private' | 'team';
    downloads: number;
    rating: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DBAppReview {
    id: string;
    app_id: string;
    user_id: string;
    rating: number;
    comment: string;
    helpful_count: number;
    created_at: string;
}

// ============================================
// SYSTEM METRICS
// ============================================

export interface DBSystemMetrics {
    total_users: number;
    active_users: number;
    total_apps: number;
    total_downloads: number;
    total_revenue: number;
}

// ============================================
// USER OPERATIONS
// ============================================

export async function getAllUsers(companyId?: string): Promise<DBUser[]> {
    try {
        let query = supabase
            .from('users')
            .select('*')
            .eq('is_active', true);

        if (companyId) {
            query = query.eq('company_id', companyId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching users:', error);
        return [];
    }
}

export async function updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('users')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            console.error('Error updating user role:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Exception updating user role:', error);
        return false;
    }
}

export async function updateUserPermissions(userId: string, permissions: string[]): Promise<boolean> {
    try {
        // Delete existing permissions
        await supabase
            .from('user_permissions')
            .delete()
            .eq('user_id', userId);

        // Insert new permissions
        const permissionRecords = permissions.map(permission => ({
            user_id: userId,
            permission,
            granted_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('user_permissions')
            .insert(permissionRecords);

        if (error) {
            console.error('Error updating permissions:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Exception updating permissions:', error);
        return false;
    }
}

// ============================================
// TEAM OPERATIONS
// ============================================

export async function getAllTeams(companyId: string): Promise<DBTeam[]> {
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .eq('company_id', companyId);

        if (error) {
            console.error('Error fetching teams:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching teams:', error);
        return [];
    }
}

export async function createTeam(team: Omit<DBTeam, 'id' | 'created_at' | 'updated_at'>): Promise<DBTeam | null> {
    try {
        const { data, error } = await supabase
            .from('teams')
            .insert({
                ...team,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating team:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Exception creating team:', error);
        return null;
    }
}

export async function addTeamMember(teamId: string, userId: string, role: 'owner' | 'admin' | 'member'): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('team_members')
            .insert({
                team_id: teamId,
                user_id: userId,
                role,
                joined_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error adding team member:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Exception adding team member:', error);
        return false;
    }
}

// ============================================
// APP OPERATIONS
// ============================================

export async function getAllApps(companyId?: string): Promise<DBApp[]> {
    try {
        let query = supabase
            .from('apps')
            .select('*')
            .eq('is_active', true);

        if (companyId) {
            query = query.or(`visibility.eq.public,company_id.eq.${companyId}`);
        } else {
            query = query.eq('visibility', 'public');
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching apps:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching apps:', error);
        return [];
    }
}

export async function createApp(app: Omit<DBApp, 'id' | 'downloads' | 'rating' | 'created_at' | 'updated_at'>): Promise<DBApp | null> {
    try {
        const { data, error } = await supabase
            .from('apps')
            .insert({
                ...app,
                downloads: 0,
                rating: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating app:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Exception creating app:', error);
        return null;
    }
}

export async function updateAppVisibility(appId: string, visibility: 'public' | 'private' | 'team'): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('apps')
            .update({ visibility, updated_at: new Date().toISOString() })
            .eq('id', appId);

        if (error) {
            console.error('Error updating app visibility:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Exception updating app visibility:', error);
        return false;
    }
}

// ============================================
// METRICS OPERATIONS
// ============================================

export async function getSystemMetrics(companyId?: string): Promise<DBSystemMetrics> {
    try {
        // Get user count
        let userQuery = supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true);

        if (companyId) {
            userQuery = userQuery.eq('company_id', companyId);
        }

        const { count: totalUsers } = await userQuery;

        // Get active users (logged in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let activeUserQuery = supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
            .gte('updated_at', sevenDaysAgo.toISOString());

        if (companyId) {
            activeUserQuery = activeUserQuery.eq('company_id', companyId);
        }

        const { count: activeUsers } = await activeUserQuery;

        // Get app count
        let appQuery = supabase
            .from('apps')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true);

        if (companyId) {
            appQuery = appQuery.eq('company_id', companyId);
        }

        const { count: totalApps } = await appQuery;

        return {
            total_users: totalUsers || 0,
            active_users: activeUsers || 0,
            total_apps: totalApps || 0,
            total_downloads: 0, // TODO: Implement download tracking
            total_revenue: 0 // TODO: Implement revenue tracking
        };
    } catch (error) {
        console.error('Exception fetching system metrics:', error);
        return {
            total_users: 0,
            active_users: 0,
            total_apps: 0,
            total_downloads: 0,
            total_revenue: 0
        };
    }
}

