/**
 * User Profile API
 * GET /api/user/profile - Get user profile
 * PUT /api/user/profile - Update user profile
 *
 * Returns user information and allows profile updates
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

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

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract and verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization token',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const userId = decoded.userId;

    if (req.method === 'GET') {
      // Get user profile
      const profile = userProfiles.get(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found',
          code: 'NOT_FOUND'
        });
      }

      return res.status(200).json({
        success: true,
        profile
      });

    } else if (req.method === 'PUT') {
      // Update user profile
      const existingProfile = userProfiles.get(userId);

      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found',
          code: 'NOT_FOUND'
        });
      }

      const updateData: UpdateProfileRequest = req.body;

      // Update profile with new data
      const updatedProfile: UserProfile = {
        ...existingProfile,
        name: updateData.name || existingProfile.name,
        bio: updateData.bio || existingProfile.bio,
        avatar: updateData.avatar || existingProfile.avatar,
        preferences: updateData.preferences
          ? { ...existingProfile.preferences, ...updateData.preferences }
          : existingProfile.preferences
      };

      // Save updated profile
      userProfiles.set(userId, updatedProfile);

      console.log('USER_PROFILE_UPDATED:', {
        userId,
        email: updatedProfile.email,
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        profile: updatedProfile,
        message: 'Profile updated successfully'
      });

    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      });
    }

  } catch (error: any) {
    console.error('User profile error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}
