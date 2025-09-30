import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import { logger } from '../utils/logger.js';
import { env } from '../utils/env.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

/**
 * Admin User Service
 * Manages platform administrators with enhanced privileges and multitenant oversight
 */

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'platform_admin' | 'support_admin';
  permissions: string[];
  isActive: boolean;
  lastLoginAt: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminLoginResult {
  success: boolean;
  admin?: AdminUser;
  token?: string;
  message?: string;
  requiresMfa?: boolean;
}

export interface AdminAuditLog {
  id: number;
  adminUserId: number;
  action: string;
  resourceType: string;
  resourceId: string | null;
  tenantId: number | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

interface AdminUserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  permissions: string[] | string | null;
  is_active: boolean;
  last_login_at: Date | null;
  failed_login_attempts: number;
  locked_until: Date | null;
  mfa_enabled: boolean;
  mfa_secret: string | null;
  created_at: Date;
  updated_at: Date;
}

export class AdminUserService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Create the principal admin user
   */
  static async createPrincipalAdmin(): Promise<AdminUser> {
    const email = 'adrian.stanca1@gmail.com';
    const password = 'Cumparavinde1';
    const firstName = 'Adrian';
    const lastName = 'Stanca';

    try {
      // Check if admin already exists
      const [existingRows] = await pool.query<AdminUserRow[]>(
        'SELECT id FROM admin_users WHERE email = ?',
        [email]
      );

      if (existingRows.length > 0) {
        logger.info({ email }, 'Principal admin user already exists');
        return this.getAdminById(existingRows[0].id);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

      // Create admin user
      const permissions = [
        'manage_tenants',
        'manage_users',
        'manage_system',
        'view_analytics',
        'manage_billing',
        'manage_security',
        'manage_support',
        'manage_integrations',
        'manage_notifications',
        'manage_backups'
      ];

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO admin_users (
          email, password_hash, first_name, last_name, role,
          permissions, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          email,
          passwordHash,
          firstName,
          lastName,
          'super_admin',
          JSON.stringify(permissions),
          true
        ]
      );

      const adminId = result.insertId;

      // Log the creation
      await this.logAdminAction(
        adminId,
        'create_principal_admin',
        'admin_user',
        adminId.toString(),
        null,
        { email, role: 'super_admin' },
        null,
        null
      );

      logger.info({ adminId, email }, 'Principal admin user created successfully');

      return this.getAdminById(adminId);
    } catch (error) {
      logger.error({ error, email }, 'Failed to create principal admin user');
      throw error;
    }
  }

  /**
   * Authenticate admin user
   */
  static async authenticateAdmin(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AdminLoginResult> {
    try {
      // Get admin user
      const [rows] = await pool.query<AdminUserRow[]>(
        'SELECT * FROM admin_users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        return { success: false, message: 'Invalid credentials' };
      }

      const admin = rows[0];

      // Check if account is locked
      if (admin.locked_until && new Date() < admin.locked_until) {
        return { 
          success: false, 
          message: 'Account is temporarily locked due to failed login attempts' 
        };
      }

      // Check if account is active
      if (!admin.is_active) {
        return { success: false, message: 'Account is disabled' };
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, admin.password_hash);

      if (!passwordValid) {
        // Increment failed attempts
        await this.incrementFailedAttempts(admin.id);
        
        await this.logAdminAction(
          admin.id,
          'failed_login',
          'admin_user',
          admin.id.toString(),
          null,
          { email, reason: 'invalid_password' },
          ipAddress || null,
          userAgent || null
        );

        return { success: false, message: 'Invalid credentials' };
      }

      // Reset failed attempts on successful login
      await this.resetFailedAttempts(admin.id);

      // Update last login
      await pool.query(
        'UPDATE admin_users SET last_login_at = NOW() WHERE id = ?',
        [admin.id]
      );

      // Check if MFA is required
      if (admin.mfa_enabled) {
        return {
          success: false,
          requiresMfa: true,
          message: 'MFA verification required'
        };
      }

      // Generate JWT token
      const token = this.generateAdminToken(admin);

      // Log successful login
      await this.logAdminAction(
        admin.id,
        'successful_login',
        'admin_user',
        admin.id.toString(),
        null,
        { email },
        ipAddress || null,
        userAgent || null
      );

      const adminUser = this.mapRowToAdmin(admin);

      logger.info({ adminId: admin.id, email }, 'Admin user authenticated successfully');

      return {
        success: true,
        admin: adminUser,
        token
      };
    } catch (error) {
      logger.error({ error, email }, 'Admin authentication failed');
      return { success: false, message: 'Authentication failed' };
    }
  }

  /**
   * Get admin user by ID
   */
  static async getAdminById(id: number): Promise<AdminUser> {
    const [rows] = await pool.query<AdminUserRow[]>(
      'SELECT * FROM admin_users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Admin user not found');
    }

    return this.mapRowToAdmin(rows[0]);
  }

  /**
   * Generate admin JWT token
   */
  private static generateAdminToken(admin: AdminUserRow): string {
    // Handle permissions - MySQL JSON fields are automatically parsed
    let permissions: string[] = [];
    if (admin.permissions) {
      if (typeof admin.permissions === 'string') {
        try {
          permissions = JSON.parse(admin.permissions);
        } catch (error) {
          permissions = [];
        }
      } else if (Array.isArray(admin.permissions)) {
        permissions = admin.permissions;
      }
    }

    const payload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      permissions,
      type: 'admin'
    };

    return jwt.sign(payload, env.jwtAccessSecret, {
      expiresIn: '8h', // Admin sessions expire after 8 hours
      issuer: 'asagents-platform',
      audience: 'admin'
    });
  }

  /**
   * Increment failed login attempts
   */
  private static async incrementFailedAttempts(adminId: number): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE admin_users 
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE 
             WHEN failed_login_attempts + 1 >= ? THEN DATE_ADD(NOW(), INTERVAL ? MICROSECOND)
             ELSE locked_until
           END
       WHERE id = ?`,
      [this.MAX_LOGIN_ATTEMPTS, this.LOCKOUT_DURATION * 1000, adminId]
    );
  }

  /**
   * Reset failed login attempts
   */
  private static async resetFailedAttempts(adminId: number): Promise<void> {
    await pool.query(
      'UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
      [adminId]
    );
  }

  /**
   * Log admin action for audit trail
   */
  static async logAdminAction(
    adminUserId: number,
    action: string,
    resourceType: string,
    resourceId: string | null,
    tenantId: number | null,
    details: any,
    ipAddress: string | null,
    userAgent: string | null
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO admin_audit_log (
          admin_user_id, action, resource_type, resource_id, tenant_id,
          details, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          adminUserId,
          action,
          resourceType,
          resourceId,
          tenantId,
          JSON.stringify(details),
          ipAddress,
          userAgent
        ]
      );
    } catch (error) {
      logger.error({ error, adminUserId, action }, 'Failed to log admin action');
    }
  }

  /**
   * Get admin audit logs
   */
  static async getAdminAuditLogs(
    limit: number = 100,
    offset: number = 0,
    adminId?: number,
    action?: string,
    tenantId?: number
  ): Promise<AdminAuditLog[]> {
    let query = `
      SELECT aal.*, au.email as admin_email, au.first_name, au.last_name
      FROM admin_audit_log aal
      JOIN admin_users au ON aal.admin_user_id = au.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (adminId) {
      query += ' AND aal.admin_user_id = ?';
      params.push(adminId);
    }

    if (action) {
      query += ' AND aal.action = ?';
      params.push(action);
    }

    if (tenantId) {
      query += ' AND aal.tenant_id = ?';
      params.push(tenantId);
    }

    query += ' ORDER BY aal.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return rows.map(row => ({
      id: row.id,
      adminUserId: row.admin_user_id,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      tenantId: row.tenant_id,
      details: row.details ? JSON.parse(row.details) : null,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    }));
  }

  /**
   * Map database row to AdminUser object
   */
  private static mapRowToAdmin(row: AdminUserRow): AdminUser {
    // Handle permissions - MySQL JSON fields are automatically parsed
    let permissions: string[] = [];
    if (row.permissions) {
      if (typeof row.permissions === 'string') {
        try {
          permissions = JSON.parse(row.permissions);
        } catch (error) {
          logger.warn({ permissions: row.permissions }, 'Failed to parse permissions JSON');
          permissions = [];
        }
      } else if (Array.isArray(row.permissions)) {
        permissions = row.permissions;
      }
    }

    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role as 'super_admin' | 'platform_admin' | 'support_admin',
      permissions,
      isActive: row.is_active,
      lastLoginAt: row.last_login_at,
      failedLoginAttempts: row.failed_login_attempts,
      lockedUntil: row.locked_until,
      mfaEnabled: row.mfa_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
