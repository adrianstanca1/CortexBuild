import { pool } from './db.js';
import { logger } from '../utils/logger.js';
import { AdminUserService } from './adminUserService.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

/**
 * Multitenant Management Service
 * Provides comprehensive tenant management capabilities for platform administrators
 */

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  plan: 'free' | 'growth' | 'enterprise';
  contactEmail: string;
  contactPhone: string | null;
  address: any;
  billingReference: string | null;
  isActive: boolean;
  subscriptionStatus: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscriptionExpiresAt: Date | null;
  maxUsers: number;
  maxProjects: number;
  maxStorageGb: number;
  currentUsers: number;
  currentProjects: number;
  currentStorageGb: number;
  adminNotes: string | null;
  createdByAdminId: number | null;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantUsage {
  id: number;
  tenantId: number;
  usageDate: Date;
  apiCalls: number;
  storageUsedGb: number;
  activeUsers: number;
  projectsCreated: number;
  tasksCreated: number;
  createdAt: Date;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  totalProjects: number;
  totalStorageGb: number;
  revenueThisMonth: number;
  growthRate: number;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  plan: 'free' | 'growth' | 'enterprise';
  contactEmail: string;
  contactPhone?: string;
  address?: any;
  adminNotes?: string;
  createdByAdminId: number;
}

interface TenantRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  plan: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  billing_reference: string | null;
  is_active: boolean;
  subscription_status: string;
  subscription_expires_at: Date | null;
  max_users: number;
  max_projects: number;
  max_storage_gb: number;
  current_users: number;
  current_projects: number;
  current_storage_gb: number;
  admin_notes: string | null;
  created_by_admin_id: number | null;
  last_activity_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class MultitenantService {
  
  /**
   * Get all tenants with filtering and pagination
   */
  static async getAllTenants(
    limit: number = 50,
    offset: number = 0,
    filters: {
      plan?: string;
      status?: string;
      subscriptionStatus?: string;
      search?: string;
    } = {}
  ): Promise<{ tenants: Tenant[]; total: number }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (filters.plan) {
        whereClause += ' AND plan = ?';
        params.push(filters.plan);
      }

      if (filters.status) {
        whereClause += ' AND is_active = ?';
        params.push(filters.status === 'active');
      }

      if (filters.subscriptionStatus) {
        whereClause += ' AND subscription_status = ?';
        params.push(filters.subscriptionStatus);
      }

      if (filters.search) {
        whereClause += ' AND (name LIKE ? OR contact_email LIKE ? OR slug LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Get total count
      const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tenants ${whereClause}`,
        params
      );
      const total = countRows[0].total;

      // Get tenants
      const [rows] = await pool.query<TenantRow[]>(
        `SELECT * FROM tenants ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      const tenants = rows.map(this.mapRowToTenant);

      return { tenants, total };
    } catch (error) {
      logger.error({ error, filters }, 'Failed to get all tenants');
      throw error;
    }
  }

  /**
   * Create a new tenant
   */
  static async createTenant(request: CreateTenantRequest): Promise<Tenant> {
    try {
      // Check if slug is unique
      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM tenants WHERE slug = ?',
        [request.slug]
      );

      if (existingRows.length > 0) {
        throw new Error('Tenant slug already exists');
      }

      // Set plan limits
      const planLimits = this.getPlanLimits(request.plan);

      // Create tenant
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO tenants (
          name, slug, plan, contact_email, contact_phone, address,
          max_users, max_projects, max_storage_gb, admin_notes,
          created_by_admin_id, is_active, subscription_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          request.name,
          request.slug,
          request.plan,
          request.contactEmail,
          request.contactPhone || null,
          request.address ? JSON.stringify(request.address) : null,
          planLimits.maxUsers,
          planLimits.maxProjects,
          planLimits.maxStorageGb,
          request.adminNotes || null,
          request.createdByAdminId,
          true,
          'trial'
        ]
      );

      const tenantId = result.insertId;

      // Log admin action
      await AdminUserService.logAdminAction(
        request.createdByAdminId,
        'create_tenant',
        'tenant',
        tenantId.toString(),
        tenantId,
        { name: request.name, plan: request.plan },
        null,
        null
      );

      logger.info({ tenantId, name: request.name }, 'Tenant created successfully');

      return this.getTenantById(tenantId);
    } catch (error) {
      logger.error({ error, request }, 'Failed to create tenant');
      throw error;
    }
  }

  /**
   * Update tenant
   */
  static async updateTenant(
    tenantId: number,
    updates: Partial<Tenant>,
    adminId: number
  ): Promise<Tenant> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      // Build dynamic update query
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbField = this.camelToSnake(key);
          updateFields.push(`${dbField} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updated_at = NOW()');
      params.push(tenantId);

      await pool.query(
        `UPDATE tenants SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      // Log admin action
      await AdminUserService.logAdminAction(
        adminId,
        'update_tenant',
        'tenant',
        tenantId.toString(),
        tenantId,
        updates,
        null,
        null
      );

      logger.info({ tenantId, updates }, 'Tenant updated successfully');

      return this.getTenantById(tenantId);
    } catch (error) {
      logger.error({ error, tenantId, updates }, 'Failed to update tenant');
      throw error;
    }
  }

  /**
   * Get tenant by ID
   */
  static async getTenantById(id: number): Promise<Tenant> {
    const [rows] = await pool.query<TenantRow[]>(
      'SELECT * FROM tenants WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Tenant not found');
    }

    return this.mapRowToTenant(rows[0]);
  }

  /**
   * Get tenant usage statistics
   */
  static async getTenantUsage(
    tenantId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<TenantUsage[]> {
    let query = 'SELECT * FROM tenant_usage WHERE tenant_id = ?';
    const params: any[] = [tenantId];

    if (startDate) {
      query += ' AND usage_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND usage_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY usage_date DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return rows.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      usageDate: row.usage_date,
      apiCalls: row.api_calls,
      storageUsedGb: row.storage_used_gb,
      activeUsers: row.active_users,
      projectsCreated: row.projects_created,
      tasksCreated: row.tasks_created,
      createdAt: row.created_at
    }));
  }

  /**
   * Get platform statistics
   */
  static async getPlatformStats(): Promise<TenantStats> {
    try {
      const [tenantStats] = await pool.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total_tenants,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_tenants,
          SUM(CASE WHEN subscription_status = 'trial' THEN 1 ELSE 0 END) as trial_tenants,
          SUM(CASE WHEN subscription_status = 'suspended' THEN 1 ELSE 0 END) as suspended_tenants,
          SUM(current_users) as total_users,
          SUM(current_projects) as total_projects,
          SUM(current_storage_gb) as total_storage_gb
        FROM tenants
      `);

      const stats = tenantStats[0];

      // Calculate growth rate (simplified - would need historical data)
      const growthRate = 5.2; // Placeholder

      return {
        totalTenants: stats.total_tenants || 0,
        activeTenants: stats.active_tenants || 0,
        trialTenants: stats.trial_tenants || 0,
        suspendedTenants: stats.suspended_tenants || 0,
        totalUsers: stats.total_users || 0,
        totalProjects: stats.total_projects || 0,
        totalStorageGb: stats.total_storage_gb || 0,
        revenueThisMonth: 0, // Would be calculated from billing data
        growthRate
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get platform stats');
      throw error;
    }
  }

  /**
   * Update tenant usage metrics
   */
  static async updateTenantUsage(tenantId: number): Promise<void> {
    try {
      // Get current usage from related tables
      const [userCount] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM users WHERE tenant_id = ? AND is_active = 1',
        [tenantId]
      );

      const [projectCount] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM projects WHERE tenant_id = ?',
        [tenantId]
      );

      // Update tenant current usage
      await pool.query(
        `UPDATE tenants SET 
         current_users = ?, 
         current_projects = ?,
         last_activity_at = NOW(),
         updated_at = NOW()
         WHERE id = ?`,
        [userCount[0].count, projectCount[0].count, tenantId]
      );

      // Insert daily usage record
      await pool.query(
        `INSERT INTO tenant_usage (
          tenant_id, usage_date, active_users, projects_created
        ) VALUES (?, CURDATE(), ?, ?)
        ON DUPLICATE KEY UPDATE 
          active_users = VALUES(active_users),
          projects_created = VALUES(projects_created)`,
        [tenantId, userCount[0].count, projectCount[0].count]
      );

    } catch (error) {
      logger.error({ error, tenantId }, 'Failed to update tenant usage');
    }
  }

  /**
   * Get plan limits based on plan type
   */
  private static getPlanLimits(plan: string) {
    const limits = {
      free: { maxUsers: 5, maxProjects: 3, maxStorageGb: 1 },
      growth: { maxUsers: 25, maxProjects: 15, maxStorageGb: 10 },
      enterprise: { maxUsers: 500, maxProjects: 100, maxStorageGb: 100 }
    };

    return limits[plan as keyof typeof limits] || limits.free;
  }

  /**
   * Convert camelCase to snake_case
   */
  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Map database row to Tenant object
   */
  private static mapRowToTenant(row: TenantRow): Tenant {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan as 'free' | 'growth' | 'enterprise',
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      address: row.address ? JSON.parse(row.address) : null,
      billingReference: row.billing_reference,
      isActive: row.is_active,
      subscriptionStatus: row.subscription_status as 'trial' | 'active' | 'suspended' | 'cancelled',
      subscriptionExpiresAt: row.subscription_expires_at,
      maxUsers: row.max_users,
      maxProjects: row.max_projects,
      maxStorageGb: row.max_storage_gb,
      currentUsers: row.current_users,
      currentProjects: row.current_projects,
      currentStorageGb: row.current_storage_gb,
      adminNotes: row.admin_notes,
      createdByAdminId: row.created_by_admin_id,
      lastActivityAt: row.last_activity_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
