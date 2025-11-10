/**
 * User Profile API
 * GET /api/user/profile - Get user profile
 * PUT /api/user/profile - Update user profile
 *
 * Returns user information and allows profile updates
 * Uses Supabase database for persistent storage
 * Uses centralized error handling for consistency
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCodes,
  getStatusCode,
  logger
} from '../../utils/errorHandler';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateLastLogin,
  type UserProfile as DbUserProfile
} from '../../utils/supabaseServer';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string | null;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  preferences?: {
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    twoFactorEnabled: boolean;
  };
}

interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  avatar?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    emailNotifications?: boolean;
    twoFactorEnabled?: boolean;
  };
}

/**
 * Transform database profile to API response format
 */
function formatUserProfile(dbProfile: DbUserProfile): UserProfile {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    name: dbProfile.name,
    role: dbProfile.role,
    companyId: dbProfile.company_id,
    avatar: dbProfile.avatar,
    bio: dbProfile.bio,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
    lastLogin: dbProfile.last_login,
    preferences: {
      theme: dbProfile.theme,
      emailNotifications: dbProfile.email_notifications,
      twoFactorEnabled: dbProfile.two_factor_enabled
    }
  };
}

function verifyToken(token: string): any {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT secret not configured');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'cortexbuild-auth',
      audience: 'cortexbuild-users'
    });
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const clientIP = req.headers['x-forwarded-for'] as string || 'unknown';
    const authHeader = req.headers.authorization;

    // Extract and verify token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Profile request without token', { ip: clientIP });
      const error = createErrorResponse(
        ErrorCodes.MISSING_TOKEN,
        'Missing or invalid authorization token'
      );
      return res.status(getStatusCode(ErrorCodes.MISSING_TOKEN)).json(error);
    }

    const token = authHeader.substring(7);
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (error: any) {
      logger.warn('Profile request with invalid token', {
        error: error.message,
        ip: clientIP
      });
      const apiError = createErrorResponse(
        ErrorCodes.INVALID_TOKEN,
        'Your session has expired. Please log in again.'
      );
      return res.status(getStatusCode(ErrorCodes.INVALID_TOKEN)).json(apiError);
    }

    const userId = decoded.userId;

    if (req.method === 'GET') {
      // Get user profile
      logger.info('Get profile request', { userId });

      try {
        let profile = await getUserProfile(userId);

        // If profile doesn't exist, create it
        if (!profile) {
          logger.info('Creating new user profile', { userId, email: decoded.email });
          profile = await createUserProfile(
            userId,
            decoded.email || `user-${userId}`,
            decoded.name || `User ${userId.substring(0, 8)}`,
            'developer'
          );
        }

        // Update last login
        await updateLastLogin(userId);

        const formattedProfile = formatUserProfile(profile);
        return res.status(200).json(
          createSuccessResponse({ profile: formattedProfile })
        );
      } catch (dbError: any) {
        logger.error('Database error in GET profile', dbError, { userId });
        const error = createErrorResponse(
          ErrorCodes.DATABASE_ERROR,
          'Failed to retrieve user profile. Please try again.'
        );
        return res.status(getStatusCode(ErrorCodes.DATABASE_ERROR)).json(error);
      }

    } else if (req.method === 'PUT') {
      // Update user profile
      logger.info('Update profile request', { userId });

      try {
        // Get current profile
        let currentProfile = await getUserProfile(userId);

        // Create if doesn't exist
        if (!currentProfile) {
          logger.info('Creating new user profile for update', { userId });
          currentProfile = await createUserProfile(
            userId,
            decoded.email || `user-${userId}`,
            decoded.name || `User ${userId.substring(0, 8)}`,
            'developer'
          );
        }

        const updateData: UpdateProfileRequest = req.body;

        // Validate input types
        if (updateData.name !== undefined && typeof updateData.name !== 'string') {
          logger.warn('Invalid name type in profile update', { userId, type: typeof updateData.name });
          const error = createErrorResponse(
            ErrorCodes.INVALID_INPUT,
            'Name must be a string'
          );
          return res.status(getStatusCode(ErrorCodes.INVALID_INPUT)).json(error);
        }

        if (updateData.bio !== undefined && typeof updateData.bio !== 'string') {
          logger.warn('Invalid bio type in profile update', { userId, type: typeof updateData.bio });
          const error = createErrorResponse(
            ErrorCodes.INVALID_INPUT,
            'Bio must be a string'
          );
          return res.status(getStatusCode(ErrorCodes.INVALID_INPUT)).json(error);
        }

        // Build update object
        const dbUpdateData: any = {};

        if (updateData.name !== undefined) {
          dbUpdateData.name = updateData.name;
        }
        if (updateData.bio !== undefined) {
          dbUpdateData.bio = updateData.bio;
        }
        if (updateData.avatar !== undefined) {
          dbUpdateData.avatar = updateData.avatar;
        }
        if (updateData.preferences) {
          if (updateData.preferences.theme !== undefined) {
            dbUpdateData.theme = updateData.preferences.theme;
          }
          if (updateData.preferences.emailNotifications !== undefined) {
            dbUpdateData.email_notifications = updateData.preferences.emailNotifications;
          }
          if (updateData.preferences.twoFactorEnabled !== undefined) {
            dbUpdateData.two_factor_enabled = updateData.preferences.twoFactorEnabled;
          }
        }

        // Update profile in database
        const updatedProfile = await updateUserProfile(userId, dbUpdateData);

        logger.info('User profile updated successfully', {
          userId,
          email: updatedProfile.email,
          ip: clientIP
        });

        const formattedProfile = formatUserProfile(updatedProfile);
        return res.status(200).json(
          createSuccessResponse({
            profile: formattedProfile,
            message: 'Profile updated successfully'
          })
        );

      } catch (dbError: any) {
        logger.error('Database error in PUT profile', dbError, { userId });
        const error = createErrorResponse(
          ErrorCodes.DATABASE_ERROR,
          'Failed to update user profile. Please try again.'
        );
        return res.status(getStatusCode(ErrorCodes.DATABASE_ERROR)).json(error);
      }

    } else {
      const error = createErrorResponse(ErrorCodes.METHOD_NOT_ALLOWED);
      return res.status(getStatusCode(ErrorCodes.METHOD_NOT_ALLOWED)).json(error);
    }

  } catch (error: any) {
    logger.error('User profile error', error, {
      method: req.method,
      url: req.url
    });

    const apiError = createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred while processing your request'
    );
    return res.status(getStatusCode(ErrorCodes.INTERNAL_ERROR)).json(apiError);
  }
}
