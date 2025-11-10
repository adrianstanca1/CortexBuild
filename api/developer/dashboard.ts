/**
 * Developer Dashboard Summary API
 * GET /api/developer/dashboard
 *
 * Returns dashboard data for developers including apps, workflows, and usage stats
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

// Mock response for now - in production this would query a real database
const getMockDashboardData = (userId: string) => {
  return {
    success: true,
    tenant: {
      userId,
      companyId: '00000000-0000-0000-0000-000000000001'
    },
    profile: {
      id: `profile-${userId}`,
      userId,
      subscriptionTier: 'developer',
      apiRequestsUsed: 0,
      apiRequestsLimit: 100000,
      geminiApiKey: ''
    },
    stats: {
      totalApps: 0,
      activeApps: 0,
      pendingApps: 0,
      totalWorkflows: 0,
      activeWorkflows: 0,
      totalWebhooks: 0,
      activeWebhooks: 0,
      totalAgents: 0,
      runningAgents: 0,
      totalRequestsThisMonth: 0,
      totalCostThisMonth: 0,
      totalTokensThisMonth: 0
    },
    apps: [],
    workflows: [],
    webhooks: [],
    usageSummary: [],
    agents: [],
    sandboxRuns: [],
    builderModules: [],
    capabilities: {
      canAccessSandbox: true,
      canCreateApps: true,
      canCreateWorkflows: true,
      canCreateWebhooks: true,
      canUseAI: true,
      maxApps: 50,
      maxWorkflows: 100,
      maxWebhooks: 100,
      usage: {
        sandboxRuns: 0,
        sandboxRunsLimit: 100
      }
    }
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization token',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token to extract user info
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT secret not configured');
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }

      const decoded = jwt.verify(token, jwtSecret, {
        issuer: 'cortexbuild-auth',
        audience: 'cortexbuild-users'
      }) as any;

      // Return mock dashboard data for now
      // In production, this would query a real database
      const dashboardData = getMockDashboardData(decoded.userId);

      return res.status(200).json(dashboardData);
    } catch (tokenError: any) {
      console.error('Token verification failed:', tokenError.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error: any) {
    console.error('Dashboard fetch error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}
