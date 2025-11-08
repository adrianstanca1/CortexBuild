/**
 * Authentication Service - Supabase Version
 * 
 * Handles user authentication using Supabase PostgreSQL database
 * with bcrypt password hashing.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';
const TOKEN_EXPIRY = '24h';

interface JWTPayload {
  userId: string;
  email: string;
}

interface AppUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  company_id: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  company_id?: string;
}

/**
 * Map database user row to API response format
 */
const mapUserRow = (row: AppUser | null): UserResponse | null => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name || row.email || 'User',
    role: row.role,
    avatar: row.avatar || '',
    company_id: row.company_id || undefined,
  };
};

/**
 * Get user by email
 */
const getUserByEmail = async (email: string): Promise<AppUser | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data as AppUser;
  } catch (err) {
    console.error('Exception in getUserByEmail:', err);
    return null;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (id: string): Promise<AppUser | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return data as AppUser;
  } catch (err) {
    console.error('Exception in getUserById:', err);
    return null;
  }
};

/**
 * Login user with email and password
 */
export const login = async (
  email: string,
  password: string,
): Promise<{ user: UserResponse; token: string } | null> => {
  try {
    // Get user by email
    const dbUser = await getUserByEmail(email);
    if (!dbUser) {
      console.log('❌ Login failed: User not found');
      return null;
    }

    // Verify password using Supabase's crypt function
    const { data: passwordMatch, error } = await supabase.rpc('verify_password', {
      user_email: email,
      user_password: password,
    });

    if (error) {
      console.error('❌ Password verification error:', error);
      // Fallback: Try direct bcrypt comparison if RPC fails
      const isValid = await bcrypt.compare(password, dbUser.password_hash);
      if (!isValid) {
        console.log('❌ Login failed: Invalid password');
        return null;
      }
    } else if (!passwordMatch) {
      console.log('❌ Login failed: Invalid password');
      return null;
    }

    // Map user data
    const user = mapUserRow(dbUser);
    if (!user) {
      return null;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY },
    );

    console.log(`✅ Login successful: ${user.email} (${user.role})`);

    return { user, token };
  } catch (err) {
    console.error('❌ Login exception:', err);
    return null;
  }
};

/**
 * Register new user
 */
export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: string = 'operative',
  companyId?: string,
): Promise<{ user: UserResponse; token: string } | null> => {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log('❌ Registration failed: Email already exists');
      return null;
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: `${firstName} ${lastName}`.trim(),
        role,
        company_id: companyId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Registration error:', error);
      return null;
    }

    // Map user data
    const user = mapUserRow(newUser as AppUser);
    if (!user) {
      return null;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY },
    );

    console.log(`✅ Registration successful: ${user.email}`);

    return { user, token };
  } catch (err) {
    console.error('❌ Registration exception:', err);
    return null;
  }
};

/**
 * Verify JWT token and get user
 */
export const verifyToken = async (
  token: string,
): Promise<UserResponse | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const dbUser = await getUserById(decoded.userId);
    return mapUserRow(dbUser);
  } catch (err) {
    console.error('❌ Token verification failed:', err);
    return null;
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (
  userId: string,
): Promise<UserResponse | null> => {
  const dbUser = await getUserById(userId);
  return mapUserRow(dbUser);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<{
    name: string;
    avatar: string;
    role: string;
  }>,
): Promise<UserResponse | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Profile update error:', error);
      return null;
    }

    console.log(`✅ Profile updated: ${userId}`);
    return mapUserRow(data as AppUser);
  } catch (err) {
    console.error('❌ Profile update exception:', err);
    return null;
  }
};

/**
 * Change user password
 */
export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<boolean> => {
  try {
    // Get user
    const dbUser = await getUserById(userId);
    if (!dbUser) {
      return false;
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, dbUser.password_hash);
    if (!isValid) {
      console.log('❌ Password change failed: Invalid old password');
      return false;
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Password update error:', error);
      return false;
    }

    console.log(`✅ Password changed: ${userId}`);
    return true;
  } catch (err) {
    console.error('❌ Password change exception:', err);
    return false;
  }
};

/**
 * Express middleware to authenticate JWT token
 */
export const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const user = await verifyToken(token);
    if (!user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Authentication error:', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Refresh token (for compatibility)
 */
export const refreshToken = async (token: string) => {
  const user = await verifyToken(token);
  if (!user) {
    throw new Error('Invalid token');
  }

  // Generate new token
  const newToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    } as JWTPayload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );

  return { user, token: newToken };
};

/**
 * Get current user by token (alias for verifyToken with full user object)
 */
export const getCurrentUserByToken = async (token: string): Promise<UserResponse | null> => {
  try {
    const user = await verifyToken(token);
    if (!user) {
      return null;
    }

    // Get full user details from database
    const dbUser = await getUserById(user.id);
    return mapUserRow(dbUser);
  } catch (err) {
    console.error('❌ getCurrentUserByToken error:', err);
    return null;
  }
};

/**
 * Logout (for compatibility - no-op in JWT model)
 */
export const logout = async (token: string): Promise<void> => {
  // In JWT model, logout is handled client-side by removing the token
  // No server-side session to invalidate
  console.log('✅ Logout successful (JWT token removed client-side)');
};

/**
 * Cleanup expired sessions (for compatibility - no-op in JWT model)
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  // In JWT model, tokens expire automatically, no cleanup needed
  console.log('✅ Session cleanup completed (JWT model - no action needed)');
};

console.log('✅ Auth service (Supabase) initialized');

