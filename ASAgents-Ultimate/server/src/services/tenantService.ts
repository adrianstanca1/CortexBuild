import { pool } from '../services/db.js';
import { logger } from '../utils/logger.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface TenantData {
  name: string;
  plan: 'free' | 'growth' | 'enterprise';
  contact_email?: string;
  contact_phone?: string;
  settings?: {
    industry?: string;
    companySize?: string;
    country?: string;
    timezone?: string;
    currency?: string;
  };
  ownerId?: string;
}

interface Tenant extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  plan: string;
  is_active: boolean;
  settings: any;
  created_at: Date;
  updated_at: Date;
  owner_id?: string;
}

class TenantService {
  // Create a new tenant
  async createTenant(data: TenantData): Promise<{ success: boolean; tenant?: any; error?: string }> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Generate unique slug from name
      const slug = this.generateSlug(data.name);
      
      // Check if slug already exists
      const [existingTenants] = await connection.query<Tenant[]>(
        'SELECT id FROM tenants WHERE slug = ?',
        [slug]
      );

      if (existingTenants.length > 0) {
        throw new Error('A tenant with this name already exists');
      }

      // Create tenant
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO tenants (name, slug, plan, contact_email, contact_phone, settings, is_active, owner_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
        [
          data.name,
          slug,
          data.plan,
          data.contact_email || 'admin@example.com',
          data.contact_phone || null,
          JSON.stringify(data.settings || {}),
          data.ownerId || null
        ]
      );

      const tenantId = result.insertId;

      // Create default roles for the tenant
      await this.createDefaultRoles(connection, tenantId);

      // Create default settings
      await this.createDefaultSettings(connection, tenantId);

      await connection.commit();

      logger.info({ tenantId, name: data.name, plan: data.plan }, 'Tenant created successfully');

      // Fetch the created tenant
      const [tenants] = await connection.query<Tenant[]>(
        'SELECT * FROM tenants WHERE id = ?',
        [tenantId]
      );

      const tenant = tenants[0];

      return {
        success: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          isActive: tenant.is_active,
          settings: typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings,
          createdAt: tenant.created_at,
          updatedAt: tenant.updated_at
        }
      };

    } catch (error) {
      await connection.rollback();
      logger.error({ error, tenantData: data }, 'Failed to create tenant');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create tenant'
      };
    } finally {
      connection.release();
    }
  }

  // Get tenant by ID
  async getTenantById(id: number): Promise<any | null> {
    try {
      const [tenants] = await pool.query<Tenant[]>(
        'SELECT * FROM tenants WHERE id = ? AND is_active = 1',
        [id]
      );

      if (tenants.length === 0) {
        return null;
      }

      const tenant = tenants[0];
      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        isActive: tenant.is_active,
        settings: typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at
      };

    } catch (error) {
      logger.error({ error, tenantId: id }, 'Failed to get tenant');
      return null;
    }
  }

  // Get tenant by slug
  async getTenantBySlug(slug: string): Promise<any | null> {
    try {
      const [tenants] = await pool.query<Tenant[]>(
        'SELECT * FROM tenants WHERE slug = ? AND is_active = 1',
        [slug]
      );

      if (tenants.length === 0) {
        return null;
      }

      const tenant = tenants[0];
      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        isActive: tenant.is_active,
        settings: typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at
      };

    } catch (error) {
      logger.error({ error, slug }, 'Failed to get tenant by slug');
      return null;
    }
  }

  // Update tenant
  async updateTenant(id: number, updates: Partial<TenantData>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.name) {
        updateFields.push('name = ?');
        updateValues.push(updates.name);
        
        // Update slug if name changes
        updateFields.push('slug = ?');
        updateValues.push(this.generateSlug(updates.name));
      }

      if (updates.plan) {
        updateFields.push('plan = ?');
        updateValues.push(updates.plan);
      }

      if (updates.settings) {
        updateFields.push('settings = ?');
        updateValues.push(JSON.stringify(updates.settings));
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      await pool.query(
        `UPDATE tenants SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      logger.info({ tenantId: id, updates }, 'Tenant updated successfully');

      return { success: true };

    } catch (error) {
      logger.error({ error, tenantId: id, updates }, 'Failed to update tenant');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update tenant'
      };
    }
  }

  // List tenants with pagination
  async listTenants(page: number = 1, limit: number = 10): Promise<{
    tenants: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM tenants WHERE is_active = 1'
      );
      const total = countResult[0].total;

      // Get tenants
      const [tenants] = await pool.query<Tenant[]>(
        'SELECT * FROM tenants WHERE is_active = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const formattedTenants = tenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        isActive: tenant.is_active,
        settings: typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at
      }));

      return {
        tenants: formattedTenants,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };

    } catch (error) {
      logger.error({ error }, 'Failed to list tenants');
      return {
        tenants: [],
        total: 0,
        page,
        totalPages: 0
      };
    }
  }

  // Generate slug from name
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  // Create default roles for tenant
  private async createDefaultRoles(connection: any, tenantId: number): Promise<void> {
    const defaultRoles = [
      { name: 'admin', permissions: ['*'] },
      { name: 'manager', permissions: ['read:projects', 'write:projects', 'read:users', 'read:reports'] },
      { name: 'user', permissions: ['read:projects', 'write:projects'] }
    ];

    for (const role of defaultRoles) {
      await connection.query(
        'INSERT INTO tenant_roles (tenant_id, name, permissions, created_at) VALUES (?, ?, ?, NOW())',
        [tenantId, role.name, JSON.stringify(role.permissions)]
      );
    }
  }

  // Create default settings for tenant
  private async createDefaultSettings(connection: any, tenantId: number): Promise<void> {
    const defaultSettings = {
      features: {
        projects: true,
        invoicing: true,
        timeTracking: true,
        reporting: true
      },
      limits: {
        users: 10,
        projects: 50,
        storage: 1024 // MB
      },
      branding: {
        logo: null,
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b'
      }
    };

    await connection.query(
      'INSERT INTO tenant_settings (tenant_id, settings, created_at) VALUES (?, ?, NOW())',
      [tenantId, JSON.stringify(defaultSettings)]
    );
  }

  // Delete tenant (soft delete)
  async deleteTenant(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await pool.query(
        'UPDATE tenants SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );

      logger.info({ tenantId: id }, 'Tenant deleted successfully');

      return { success: true };

    } catch (error) {
      logger.error({ error, tenantId: id }, 'Failed to delete tenant');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete tenant'
      };
    }
  }
}

export const tenantService = new TenantService();
export default tenantService;
