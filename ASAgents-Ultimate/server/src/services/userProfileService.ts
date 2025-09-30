import { pool } from '../services/db.js';
import { logger } from '../utils/logger.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UserProfileData {
  auth0_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
  role: string;
  tenant_id?: number;
  preferences?: {
    marketing_consent?: boolean;
    email_notifications?: boolean;
    push_notifications?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
  };
}

interface UserProfile extends RowDataPacket {
  id: number;
  auth0_id: string;
  tenant_id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string;
  role: string;
  is_active: boolean;
  preferences: any;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date;
}

class UserProfileService {
  // Create user profile
  async createUserProfile(data: UserProfileData): Promise<{ success: boolean; profile?: any; error?: string }> {
    try {
      // Check if user already exists
      const [existingUsers] = await pool.query<UserProfile[]>(
        'SELECT id FROM user_profiles WHERE auth0_id = ? OR email = ?',
        [data.auth0_id, data.email]
      );

      if (existingUsers.length > 0) {
        return {
          success: false,
          error: 'User profile already exists'
        };
      }

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO user_profiles 
         (auth0_id, tenant_id, email, first_name, last_name, company, phone, role, preferences, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          data.auth0_id,
          data.tenant_id || null,
          data.email,
          data.first_name,
          data.last_name,
          data.company || null,
          data.phone || null,
          data.role,
          JSON.stringify(data.preferences || {})
        ]
      );

      const profileId = result.insertId;

      logger.info({ profileId, auth0Id: data.auth0_id, email: data.email }, 'User profile created');

      // Fetch the created profile
      const profile = await this.getUserProfileById(profileId);

      return {
        success: true,
        profile
      };

    } catch (error) {
      logger.error({ error, userData: data }, 'Failed to create user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user profile'
      };
    }
  }

  // Get user profile by ID
  async getUserProfileById(id: number): Promise<any | null> {
    try {
      const [profiles] = await pool.query<UserProfile[]>(
        'SELECT * FROM user_profiles WHERE id = ? AND is_active = 1',
        [id]
      );

      if (profiles.length === 0) {
        return null;
      }

      return this.formatUserProfile(profiles[0]);

    } catch (error) {
      logger.error({ error, profileId: id }, 'Failed to get user profile');
      return null;
    }
  }

  // Get user profile by Auth0 ID
  async getUserProfileByAuth0Id(auth0Id: string): Promise<any | null> {
    try {
      const [profiles] = await pool.query<UserProfile[]>(
        'SELECT * FROM user_profiles WHERE auth0_id = ? AND is_active = 1',
        [auth0Id]
      );

      if (profiles.length === 0) {
        return null;
      }

      return this.formatUserProfile(profiles[0]);

    } catch (error) {
      logger.error({ error, auth0Id }, 'Failed to get user profile by Auth0 ID');
      return null;
    }
  }

  // Get user profile by email
  async getUserProfileByEmail(email: string): Promise<any | null> {
    try {
      const [profiles] = await pool.query<UserProfile[]>(
        'SELECT * FROM user_profiles WHERE email = ? AND is_active = 1',
        [email]
      );

      if (profiles.length === 0) {
        return null;
      }

      return this.formatUserProfile(profiles[0]);

    } catch (error) {
      logger.error({ error, email }, 'Failed to get user profile by email');
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(id: number, updates: Partial<UserProfileData>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      // Build dynamic update query
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'auth0_id') { // Don't allow auth0_id updates
          if (key === 'preferences') {
            updateFields.push('preferences = ?');
            updateValues.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = ?`);
            updateValues.push(value);
          }
        }
      });

      if (updateFields.length === 0) {
        return { success: true }; // Nothing to update
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      await pool.query(
        `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      logger.info({ profileId: id, updates }, 'User profile updated');

      return { success: true };

    } catch (error) {
      logger.error({ error, profileId: id, updates }, 'Failed to update user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user profile'
      };
    }
  }

  // Update last login time
  async updateLastLogin(auth0Id: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE user_profiles SET last_login_at = NOW() WHERE auth0_id = ?',
        [auth0Id]
      );

      logger.info({ auth0Id }, 'Last login updated');

    } catch (error) {
      logger.error({ error, auth0Id }, 'Failed to update last login');
    }
  }

  // List user profiles with pagination
  async listUserProfiles(
    page: number = 1,
    limit: number = 10,
    tenantId?: number
  ): Promise<{
    profiles: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE is_active = 1';
      const queryParams: any[] = [];

      if (tenantId) {
        whereClause += ' AND tenant_id = ?';
        queryParams.push(tenantId);
      }

      // Get total count
      const [countResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM user_profiles ${whereClause}`,
        queryParams
      );
      const total = countResult[0].total;

      // Get profiles
      const [profiles] = await pool.query<UserProfile[]>(
        `SELECT * FROM user_profiles ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      const formattedProfiles = profiles.map(profile => this.formatUserProfile(profile));

      return {
        profiles: formattedProfiles,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };

    } catch (error) {
      logger.error({ error }, 'Failed to list user profiles');
      return {
        profiles: [],
        total: 0,
        page,
        totalPages: 0
      };
    }
  }

  // Delete user profile (soft delete)
  async deleteUserProfile(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await pool.query(
        'UPDATE user_profiles SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );

      logger.info({ profileId: id }, 'User profile deleted');

      return { success: true };

    } catch (error) {
      logger.error({ error, profileId: id }, 'Failed to delete user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user profile'
      };
    }
  }

  // Format user profile for API response
  private formatUserProfile(profile: UserProfile): any {
    return {
      id: profile.id,
      auth0Id: profile.auth0_id,
      tenantId: profile.tenant_id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      fullName: `${profile.first_name} ${profile.last_name}`,
      company: profile.company,
      phone: profile.phone,
      role: profile.role,
      isActive: profile.is_active,
      preferences: typeof profile.preferences === 'string' 
        ? JSON.parse(profile.preferences) 
        : profile.preferences,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      lastLoginAt: profile.last_login_at
    };
  }

  // Search user profiles
  async searchUserProfiles(
    query: string,
    tenantId?: number,
    limit: number = 10
  ): Promise<any[]> {
    try {
      let whereClause = 'WHERE is_active = 1 AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const queryParams = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

      if (tenantId) {
        whereClause += ' AND tenant_id = ?';
        queryParams.push(tenantId.toString());
      }

      const [profiles] = await pool.query<UserProfile[]>(
        `SELECT * FROM user_profiles ${whereClause} ORDER BY first_name, last_name LIMIT ?`,
        [...queryParams, limit]
      );

      return profiles.map(profile => this.formatUserProfile(profile));

    } catch (error) {
      logger.error({ error, query }, 'Failed to search user profiles');
      return [];
    }
  }
}

export const userProfileService = new UserProfileService();
export default userProfileService;
