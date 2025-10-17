/**
 * Admin API Service
 * Centralized API layer for all admin operations
 */

import {
    getAllUsers,
    updateUserRole,
    updateUserPermissions,
    getAllTeams,
    createTeam,
    addTeamMember,
    getAllApps,
    createApp,
    updateAppVisibility,
    getSystemMetrics,
    DBUser,
    DBTeam,
    DBApp,
    DBSystemMetrics
} from './database-integration';

// ============================================
// USER OPERATIONS
// ============================================

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'developer' | 'user' | 'super_admin' | 'company_admin';
    permissions: string[];
    avatar?: string;
    status: 'active' | 'inactive';
    company_id: string;
    created_at: string;
}

export async function fetchAllUsers(companyId?: string): Promise<AdminUser[]> {
    try {
        const dbUsers = await getAllUsers(companyId);
        return dbUsers.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as any,
            permissions: [], // TODO: Load from user_permissions
            avatar: user.avatar,
            status: user.is_active ? 'active' : 'inactive',
            company_id: user.company_id,
            created_at: user.created_at
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function changeUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
        return await updateUserRole(userId, newRole);
    } catch (error) {
        console.error('Error changing user role:', error);
        return false;
    }
}

export async function setUserPermissions(userId: string, permissions: string[]): Promise<boolean> {
    try {
        return await updateUserPermissions(userId, permissions);
    } catch (error) {
        console.error('Error setting user permissions:', error);
        return false;
    }
}

// ============================================
// TEAM OPERATIONS
// ============================================

export interface AdminTeam {
    id: string;
    name: string;
    description: string;
    members: number;
    projects: number;
    created_at: string;
}

export async function fetchAllTeams(companyId: string): Promise<AdminTeam[]> {
    try {
        const dbTeams = await getAllTeams(companyId);
        return dbTeams.map(team => ({
            id: team.id,
            name: team.name,
            description: team.description,
            members: 0, // TODO: Count from team_members
            projects: 0, // TODO: Count from projects
            created_at: team.created_at
        }));
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
}

export async function createNewTeam(
    name: string,
    description: string,
    companyId: string,
    createdBy: string
): Promise<DBTeam | null> {
    try {
        return await createTeam({
            name,
            description,
            company_id: companyId,
            created_by: createdBy
        });
    } catch (error) {
        console.error('Error creating team:', error);
        return null;
    }
}

export async function inviteTeamMember(
    teamId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member'
): Promise<boolean> {
    try {
        return await addTeamMember(teamId, userId, role);
    } catch (error) {
        console.error('Error inviting team member:', error);
        return false;
    }
}

// ============================================
// APP OPERATIONS
// ============================================

export interface AdminApp {
    id: string;
    name: string;
    description: string;
    category: string;
    version: string;
    visibility: 'public' | 'private' | 'team';
    downloads: number;
    rating: number;
    created_at: string;
}

export async function fetchAllApps(companyId?: string): Promise<AdminApp[]> {
    try {
        const dbApps = await getAllApps(companyId);
        return dbApps.map(app => ({
            id: app.id,
            name: app.name,
            description: app.description,
            category: app.category,
            version: app.version,
            visibility: app.visibility,
            downloads: app.downloads,
            rating: app.rating,
            created_at: app.created_at
        }));
    } catch (error) {
        console.error('Error fetching apps:', error);
        return [];
    }
}

export async function publishNewApp(
    name: string,
    description: string,
    category: string,
    authorId: string,
    companyId: string,
    visibility: 'public' | 'private' | 'team' = 'private'
): Promise<DBApp | null> {
    try {
        return await createApp({
            name,
            description,
            category,
            version: '1.0.0',
            author_id: authorId,
            company_id: companyId,
            visibility,
            is_active: true
        });
    } catch (error) {
        console.error('Error publishing app:', error);
        return null;
    }
}

export async function changeAppVisibility(
    appId: string,
    visibility: 'public' | 'private' | 'team'
): Promise<boolean> {
    try {
        return await updateAppVisibility(appId, visibility);
    } catch (error) {
        console.error('Error changing app visibility:', error);
        return false;
    }
}

// ============================================
// METRICS OPERATIONS
// ============================================

export interface AdminMetrics {
    totalUsers: number;
    activeUsers: number;
    totalApps: number;
    totalDownloads: number;
    totalRevenue: number;
}

export async function fetchSystemMetrics(companyId?: string): Promise<AdminMetrics> {
    try {
        const dbMetrics = await getSystemMetrics(companyId);
        return {
            totalUsers: dbMetrics.total_users,
            activeUsers: dbMetrics.active_users,
            totalApps: dbMetrics.total_apps,
            totalDownloads: dbMetrics.total_downloads,
            totalRevenue: dbMetrics.total_revenue
        };
    } catch (error) {
        console.error('Error fetching metrics:', error);
        return {
            totalUsers: 0,
            activeUsers: 0,
            totalApps: 0,
            totalDownloads: 0,
            totalRevenue: 0
        };
    }
}

// ============================================
// ACTIVITY LOG
// ============================================

export interface ActivityLogEntry {
    id: string;
    type: 'user' | 'app' | 'system' | 'payment';
    action: string;
    user: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error';
}

export async function fetchRecentActivity(companyId?: string, limit: number = 10): Promise<ActivityLogEntry[]> {
    // TODO: Implement with activity_log table
    return [
        {
            id: '1',
            type: 'user',
            action: 'New user registration',
            user: 'john@example.com',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            status: 'success'
        },
        {
            id: '2',
            type: 'app',
            action: 'App published to marketplace',
            user: 'jane@example.com',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            status: 'success'
        }
    ];
}

// ============================================
// SUBSCRIPTION OPERATIONS
// ============================================

export interface Subscription {
    id: string;
    plan: string;
    status: 'active' | 'cancelled' | 'expired';
    price: number;
    interval: 'month' | 'year';
    currentPeriodEnd: Date;
}

export async function fetchCompanySubscription(companyId: string): Promise<Subscription | null> {
    // TODO: Implement with subscriptions table
    return {
        id: '1',
        plan: 'Professional',
        status: 'active',
        price: 29,
        interval: 'month',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
}

