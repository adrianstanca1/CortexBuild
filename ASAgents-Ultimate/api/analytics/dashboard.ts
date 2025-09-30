import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Mock dashboard analytics endpoint
 * GET /api/analytics/dashboard
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock analytics data
    const mockAnalytics = {
      overview: {
        activeProjects: 12,
        totalBudget: 45000000,
        totalSpent: 28500000,
        averageProgress: 58,
        onTimeProjects: 8,
        delayedProjects: 3,
        completedThisMonth: 2,
      },
      financials: {
        revenue: 32000000,
        expenses: 28500000,
        profit: 3500000,
        profitMargin: 10.9,
        pendingInvoices: 1500000,
        overdueInvoices: 250000,
      },
      projectsByStatus: [
        { status: 'planning', count: 3, percentage: 25 },
        { status: 'in_progress', count: 7, percentage: 58 },
        { status: 'on_hold', count: 1, percentage: 8 },
        { status: 'completed', count: 1, percentage: 8 },
      ],
      monthlyProgress: [
        { month: 'Jan', budget: 3800000, spent: 3200000, projects: 10 },
        { month: 'Feb', budget: 4100000, spent: 3500000, projects: 11 },
        { month: 'Mar', budget: 4200000, spent: 3800000, projects: 11 },
        { month: 'Apr', budget: 4000000, spent: 3600000, projects: 12 },
        { month: 'May', budget: 4500000, spent: 4100000, projects: 12 },
        { month: 'Jun', budget: 4300000, spent: 3900000, projects: 11 },
      ],
      teamPerformance: {
        totalMembers: 45,
        activeMembers: 42,
        avgUtilization: 87,
        topPerformers: [
          { id: 'user-1', name: 'John Smith', projectsCompleted: 5, rating: 4.8 },
          { id: 'user-4', name: 'Emily Chen', projectsCompleted: 4, rating: 4.7 },
          { id: 'user-6', name: 'Robert Martinez', projectsCompleted: 6, rating: 4.9 },
        ],
      },
      recentActivity: [
        {
          id: 'act-1',
          type: 'milestone_completed',
          project: 'Downtown Office Complex',
          description: 'Framing Complete milestone achieved',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'John Smith',
        },
        {
          id: 'act-2',
          type: 'budget_alert',
          project: 'Highway Bridge Renovation',
          description: 'Project approaching 80% budget utilization',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          user: 'System',
        },
        {
          id: 'act-3',
          type: 'new_project',
          project: 'Residential Development',
          description: 'New project added to portfolio',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          user: 'Emily Chen',
        },
      ],
      alerts: [
        {
          id: 'alert-1',
          severity: 'warning',
          project: 'Highway Bridge Renovation',
          message: 'Project timeline may be delayed by 2 weeks',
          category: 'schedule',
        },
        {
          id: 'alert-2',
          severity: 'info',
          project: 'Downtown Office Complex',
          message: 'Material delivery scheduled for next week',
          category: 'logistics',
        },
      ],
    };

    return res.status(200).json({
      success: true,
      data: mockAnalytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
