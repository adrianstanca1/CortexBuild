import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Mock dashboard data
const dashboardStats = {
  projects: {
    total: 12,
    active: 8,
    completed: 3,
    planning: 1,
    total_budget: 45000000,
    total_actual: 18500000,
    avg_progress: 68
  },
  tasks: {
    total: 156,
    completed: 98,
    in_progress: 42,
    pending: 16,
    overdue: 8
  },
  team: {
    total_members: 24,
    active_today: 18,
    on_site: 12,
    remote: 6
  },
  financial: {
    total_revenue: 12500000,
    total_expenses: 8500000,
    profit_margin: 32,
    pending_invoices: 450000
  },
  safety: {
    incidents_this_month: 2,
    days_since_last_incident: 15,
    safety_score: 94,
    inspections_pending: 8
  },
  recent_activity: [
    {
      id: 'activity-1',
      type: 'task_completed',
      user: 'Mike Wilson',
      description: 'Completed foundation inspection for Metropolis Tower',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      project: 'Metropolis Tower'
    },
    {
      id: 'activity-2',
      type: 'project_update',
      user: 'Casey Johnson',
      description: 'Updated project timeline for Bayview Innovation Campus',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      project: 'Bayview Innovation Campus'
    },
    {
      id: 'activity-3',
      type: 'document_uploaded',
      user: 'Adrian Stanca',
      description: 'Uploaded safety inspection report',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      project: 'Metropolis Tower'
    }
  ]
};

// Verify JWT and extract user info
const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as {
    userId: string;
    email: string;
    role: string;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    // GET - Fetch dashboard statistics
    if (req.method === 'GET') {
      console.log(`📊 Dashboard stats fetched for user ${user.email}`);

      return res.status(200).json({
        success: true,
        data: dashboardStats
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('❌ Dashboard API error:', error);

    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
