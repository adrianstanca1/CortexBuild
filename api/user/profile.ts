/**
 * User Profile API
 * GET /api/user/profile - Get user profile
 * PUT /api/user/profile - Update user profile
 *
 * Returns user information and allows profile updates
 * Uses centralized error handling for consistency
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCodes,
  getStatusCode,
  logger,
  validateRequiredFields
} from '../../utils/errorHandler';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string | null;
  avatar?: string;
  bio?: string;
  createdAt: string;
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

// Mock database of users with profiles
const userProfiles: Map<string, UserProfile> = new Map([
  ['user-123', {
    id: 'user-123',
    email: 'adrian.stanca1@gmail.com',
    name: 'Adrian Stanca',
    role: 'developer',
    companyId: '00000000-0000-0000-0000-000000000001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adrian',
    bio: 'Full-stack developer passionate about AI and scalable systems',
    createdAt: '2025-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      twoFactorEnabled: false
    }
  }],
  ['user-dev', {
    id: 'user-dev',
    email: 'dev@constructco.com',
    name: 'Dev User',
    role: 'developer',
    companyId: '00000000-0000-0000-0000-000000000001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev',
    bio: 'Software engineer and platform developer',
    createdAt: '2025-01-05T00:00:00Z',
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: 'light',
      emailNotifications: true,
      twoFactorEnabled: false
    }
  }]
]);

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

      const profile = userProfiles.get(userId);

      if (!profile) {
        logger.warn('User profile not found', { userId, ip: clientIP });
        const error = createErrorResponse(
          ErrorCodes.NOT_FOUND,
          'User profile not found'
        );
        return res.status(getStatusCode(ErrorCodes.NOT_FOUND)).json(error);
      }

      return res.status(200).json(
        createSuccessResponse({ profile })
      );

    } else if (req.method === 'PUT') {
      // Update user profile
      logger.info('Update profile request', { userId });

      const existingProfile = userProfiles.get(userId);

      if (!existingProfile) {
        logger.warn('User profile not found for update', { userId, ip: clientIP });
        const error = createErrorResponse(
          ErrorCodes.NOT_FOUND,
          'User profile not found'
        );
        return res.status(getStatusCode(ErrorCodes.NOT_FOUND)).json(error);
      }

      const updateData: UpdateProfileRequest = req.body;

      // Validate input
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

      // Update profile with new data
      const updatedProfile: UserProfile = {
        ...existingProfile,
        name: updateData.name !== undefined ? updateData.name : existingProfile.name,
        bio: updateData.bio !== undefined ? updateData.bio : existingProfile.bio,
        avatar: updateData.avatar !== undefined ? updateData.avatar : existingProfile.avatar,
        preferences: updateData.preferences
          ? { ...existingProfile.preferences, ...updateData.preferences }
          : existingProfile.preferences
      };

      // Save updated profile
      userProfiles.set(userId, updatedProfile);

      logger.info('User profile updated successfully', {
        userId,
        email: updatedProfile.email,
        ip: clientIP
      });

      return res.status(200).json(
        createSuccessResponse({
          profile: updatedProfile,
          message: 'Profile updated successfully'
        })
      );

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
