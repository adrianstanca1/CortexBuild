/**
 * Supabase Server-side Client
 * For use in API endpoints and server-side operations
 * Uses service role key for admin operations
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from './errorHandler';

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

/**
 * Get or initialize the Supabase admin client
 */
export function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logger.error('Supabase credentials not configured');
    throw new Error('Supabase server configuration missing');
  }

  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    logger.info('Supabase admin client initialized');
    return supabaseAdmin;
  } catch (error) {
    logger.error('Failed to initialize Supabase admin client', error as Error);
    throw error;
  }
}

/**
 * Interface for user profile in database
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  company_id: string | null;
  avatar?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  theme: 'light' | 'dark';
  email_notifications: boolean;
  two_factor_enabled: boolean;
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Row not found - this is expected for new users
        logger.warn('User profile not found', { userId });
        return null;
      }
      logger.error('Failed to fetch user profile', error as Error);
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    logger.error('Error getting user profile', error as Error);
    throw error;
  }
}

/**
 * Create or initialize user profile
 */
export async function createUserProfile(
  userId: string,
  email: string,
  name: string,
  role: string = 'developer'
): Promise<UserProfile> {
  try {
    const supabase = getSupabaseAdmin();

    const profileData = {
      id: userId,
      email,
      name,
      role,
      company_id: null,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio: '',
      theme: 'dark' as const,
      email_notifications: true,
      two_factor_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      // If profile already exists, fetch and return it
      if (error.code === '23505') {
        logger.info('User profile already exists, fetching existing profile', { userId });
        const existing = await getUserProfile(userId);
        if (existing) {
          return existing;
        }
      }
      logger.error('Failed to create user profile', error as Error);
      throw error;
    }

    logger.info('User profile created successfully', { userId, email });
    return data as UserProfile;
  } catch (error) {
    logger.error('Error creating user profile', error as Error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const supabase = getSupabaseAdmin();

    // Remove fields that shouldn't be updated
    const { id, created_at, ...updateData } = updates;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update user profile', error as Error);
      throw error;
    }

    logger.info('User profile updated successfully', { userId });
    return data as UserProfile;
  } catch (error) {
    logger.error('Error updating user profile', error as Error);
    throw error;
  }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (error && error.code !== 'PGRST116') {
      logger.warn('Failed to update last login', { userId, error: error.message });
    }
  } catch (error) {
    logger.warn('Error updating last login', error as Error);
    // Don't throw - this is non-critical
  }
}

/**
 * Delete user profile (cascade deletes from auth.users will handle this)
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      logger.error('Failed to delete user profile', error as Error);
      throw error;
    }

    logger.info('User profile deleted successfully', { userId });
  } catch (error) {
    logger.error('Error deleting user profile', error as Error);
    throw error;
  }
}

/**
 * Get users by company
 */
export async function getCompanyUsers(companyId: string): Promise<UserProfile[]> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch company users', error as Error);
      throw error;
    }

    return (data as UserProfile[]) || [];
  } catch (error) {
    logger.error('Error getting company users', error as Error);
    throw error;
  }
}

/**
 * Search users by name or email
 */
export async function searchUsers(
  query: string,
  limit: number = 10
): Promise<UserProfile[]> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      logger.error('Failed to search users', error as Error);
      throw error;
    }

    return (data as UserProfile[]) || [];
  } catch (error) {
    logger.error('Error searching users', error as Error);
    throw error;
  }
}
