// User Management Service
import databaseService from './database';
import { authService } from './authenticationService';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  companyId?: string;
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  name?: string;
  role?: 'admin' | 'user' | 'guest';
  companyId?: string;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  role?: 'admin' | 'user' | 'guest';
  companyId?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UserQuery {
  companyId?: string;
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class UserManagementService {
  // Get user by ID
  async getUser(userId: string): Promise<User | null> {
    if (databaseService.isUsingSupabase()) {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return this.mapUser(data);
    }

    const result = await databaseService.query(
      'SELECT * FROM users WHERE id = $1',
      { values: [userId] }
    );

    return result.rows[0] ? this.mapUser(result.rows[0]) : null;
  }

  // Get current logged-in user
  async getCurrentUser(): Promise<User | null> {
    const authUser = authService.getUser();
    if (!authUser) return null;

    return this.getUser(authUser.id);
  }

  // Create new user
  async createUser(data: CreateUserData): Promise<User> {
    if (databaseService.isUsingSupabase()) {
      const supabase = databaseService.getSupabase();
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: data.email,
          name: data.name,
          role: data.role || 'user',
          company_id: data.companyId,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity('user.created', 'user', newUser.id);

      return this.mapUser(newUser);
    }

    const result = await databaseService.query(
      `INSERT INTO users (email, name, role, company_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      { values: [data.email, data.name, data.role || 'user', data.companyId] }
    );

    const user = this.mapUser(result.rows[0]);
    await this.logActivity('user.created', 'user', user.id);

    return user;
  }

  // Update user
  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    if (databaseService.isUsingSupabase()) {
      const supabase = databaseService.getSupabase();
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          name: data.name,
          avatar_url: data.avatar,
          role: data.role,
          company_id: data.companyId,
          status: data.status,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('user.updated', 'user', userId);

      return this.mapUser(updatedUser);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.avatar !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(data.avatar);
    }
    if (data.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(data.role);
    }
    if (data.companyId !== undefined) {
      updates.push(`company_id = $${paramIndex++}`);
      values.push(data.companyId);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    values.push(userId);

    const result = await databaseService.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      { values }
    );

    const user = this.mapUser(result.rows[0]);
    await this.logActivity('user.updated', 'user', userId);

    return user;
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    if (databaseService.isUsingSupabase()) {
      const supabase = databaseService.getSupabase();
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await this.logActivity('user.deleted', 'user', userId);
      return;
    }

    await databaseService.query(
      'DELETE FROM users WHERE id = $1',
      { values: [userId] }
    );

    await this.logActivity('user.deleted', 'user', userId);
  }

  // List users with filters
  async listUsers(query: UserQuery = {}): Promise<{ users: User[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    if (databaseService.isUsingSupabase()) {
      const supabase = databaseService.getSupabase();
      let queryBuilder = supabase.from('users').select('*', { count: 'exact' });

      if (query.companyId) {
        queryBuilder = queryBuilder.eq('company_id', query.companyId);
      }
      if (query.role) {
        queryBuilder = queryBuilder.eq('role', query.role);
      }
      if (query.status) {
        queryBuilder = queryBuilder.eq('status', query.status);
      }
      if (query.search) {
        queryBuilder = queryBuilder.or(
          `email.ilike.%${query.search}%,name.ilike.%${query.search}%`
        );
      }

      const { data, error, count } = await queryBuilder
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        users: data ? data.map(u => this.mapUser(u)) : [],
        total: count || 0,
      };
    }

    // PostgreSQL query
    const conditions: string[] = ['1=1'];
    const values: any[] = [];
    let paramIndex = 1;

    if (query.companyId) {
      conditions.push(`company_id = $${paramIndex++}`);
      values.push(query.companyId);
    }
    if (query.role) {
      conditions.push(`role = $${paramIndex++}`);
      values.push(query.role);
    }
    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(query.status);
    }
    if (query.search) {
      conditions.push(`(email ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`);
      values.push(`%${query.search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await databaseService.query(
      `SELECT COUNT(*) FROM users WHERE ${conditions.join(' AND ')}`,
      { values }
    );

    // Get users
    values.push(limit, offset);
    const result = await databaseService.query(
      `SELECT * FROM users 
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      { values }
    );

    return {
      users: result.rows.map(u => this.mapUser(u)),
      total: parseInt(countResult.rows[0].count),
    };
  }

  // Grant permission to user
  async grantPermission(userId: string, permission: string): Promise<void> {
    if (databaseService.isUsingSupabase()) {
      const supabase = databaseService.getSupabase();
      const currentUser = authService.getUser();

      await supabase.from('user_permissions').insert({
        user_id: userId,
        permission,
        granted_by: currentUser?.id,
      });

      return;
    }

    const currentUser = authService.getUser();

    await databaseService.query(
      `INSERT INTO user_permissions (user_id, permission, granted_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, permission) DO NOTHING`,
      { values: [userId, permission, currentUser?.id] }
    );
  }

  // Revoke permission from user
  async revokePermission(userId: string, permission: string): Promise<void> {
    if (databaseService.isUsingSupabase()) {
      const supabase = databaseService.getSupabase();
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('permission', permission);

      return;
    }

    await databaseService.query(
      'DELETE FROM user_permissions WHERE user_id = $1 AND permission = $2',
      { values: [userId, permission] }
    );
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<string[]> {
    if (databaseService.isUsingSupabase()) {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId);

      if (error) throw error;

      return data.map(p => p.permission);
    }

    const result = await databaseService.query(
      'SELECT permission FROM user_permissions WHERE user_id = $1',
      { values: [userId] }
    );

    return result.rows.map(r => r.permission);
  }

  // Log user activity
  private async logActivity(action: string, entityType: string, entityId: string): Promise<void> {
    try {
      const currentUser = authService.getUser();
      
      if (databaseService.isUsingSupabase()) {
        const supabase = databaseService.getSupabase();
        await supabase.from('activity_logs').insert({
          user_id: currentUser?.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
        });
        return;
      }

      await databaseService.query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
         VALUES ($1, $2, $3, $4)`,
        { values: [currentUser?.id, action, entityType, entityId] }
      );
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Map database row to User object
  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatar: row.avatar_url,
      role: row.role,
      companyId: row.company_id,
      status: row.status,
      emailVerified: row.email_verified,
      lastLogin: row.last_login ? new Date(row.last_login) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();
export default userManagementService;
