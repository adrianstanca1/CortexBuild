import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let milestones = [
  {
    id: 'mile-1',
    project_id: 'proj-1',
    name: 'Foundation Complete',
    description: 'All foundation work including piles, grade beams, and mat slab completed',
    due_date: '2025-02-28',
    status: 'completed',
    progress: 100,
    is_critical: 1,
    dependencies: [],
    deliverables: ['Foundation inspection report', 'Concrete test results', 'As-built drawings'],
    budget_allocated: 2500000,
    actual_cost: 2450000,
    variance: -50000,
    completed_at: '2025-02-25T16:00:00Z',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-02-25T16:00:00Z'
  },
  {
    id: 'mile-2',
    project_id: 'proj-1',
    name: 'Structural Steel Erection - Levels 1-10',
    description: 'Complete steel frame installation for first 10 levels',
    due_date: '2025-04-30',
    status: 'in-progress',
    progress: 35,
    is_critical: 1,
    dependencies: ['mile-1'],
    deliverables: ['Steel erection sign-off', 'Welding inspection reports', 'Torque test results'],
    budget_allocated: 3200000,
    actual_cost: 1100000,
    variance: 0,
    completed_at: null,
    created_at: '2025-01-10T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'mile-3',
    project_id: 'proj-1',
    name: 'MEP Rough-In Complete',
    description: 'All mechanical, electrical, and plumbing rough-in work for levels 1-10',
    due_date: '2025-06-15',
    status: 'pending',
    progress: 0,
    is_critical: 0,
    dependencies: ['mile-2'],
    deliverables: ['MEP coordination drawings', 'System startup procedures', 'Equipment manuals'],
    budget_allocated: 1800000,
    actual_cost: 0,
    variance: 0,
    completed_at: null,
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z'
  }
];

const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
};

// Calculate milestone health score
function calculateMilestoneHealth(milestone: any): number {
  let score = 100;

  const today = new Date();
  const dueDate = new Date(milestone.due_date);
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Progress vs time
  if (milestone.status !== 'completed') {
    const timeElapsed = milestone.progress;
    const timeRemaining = 100 - timeElapsed;

    if (daysUntilDue < 0) {
      score -= 50; // Overdue
    } else if (timeRemaining > timeElapsed && daysUntilDue < 30) {
      score -= 30; // Behind schedule
    } else if (timeRemaining > timeElapsed) {
      score -= 15; // Slightly behind
    }
  }

  // Budget variance
  const budgetVariance = (milestone.variance / milestone.budget_allocated) * 100;
  if (budgetVariance > 10) {
    score -= 20;
  } else if (budgetVariance > 5) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    // GET - Fetch milestones with analytics
    if (req.method === 'GET') {
      const { project_id, status, is_critical, upcoming } = req.query;
      let filteredMilestones = [...milestones];

      if (project_id) {
        filteredMilestones = filteredMilestones.filter(m => m.project_id === project_id);
      }

      if (status) {
        filteredMilestones = filteredMilestones.filter(m => m.status === status);
      }

      if (is_critical !== undefined) {
        filteredMilestones = filteredMilestones.filter(m =>
          m.is_critical === parseInt(is_critical as string)
        );
      }

      // Upcoming milestones (due within 30 days)
      if (upcoming === 'true') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        filteredMilestones = filteredMilestones.filter(m =>
          m.status !== 'completed' &&
          new Date(m.due_date) <= thirtyDaysFromNow
        );
      }

      // Enrich with health scores
      const enrichedMilestones = filteredMilestones.map(m => ({
        ...m,
        health_score: calculateMilestoneHealth(m),
        days_until_due: Math.floor(
          (new Date(m.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        is_overdue: m.status !== 'completed' && new Date(m.due_date) < new Date(),
        budget_utilization: Math.round((m.actual_cost / m.budget_allocated) * 100)
      }));

      const today = new Date();

      const summary = {
        total: enrichedMilestones.length,
        completed: enrichedMilestones.filter(m => m.status === 'completed').length,
        in_progress: enrichedMilestones.filter(m => m.status === 'in-progress').length,
        pending: enrichedMilestones.filter(m => m.status === 'pending').length,
        delayed: enrichedMilestones.filter(m => m.status === 'delayed').length,
        critical: enrichedMilestones.filter(m => m.is_critical).length,
        overdue: enrichedMilestones.filter(m =>
          m.status !== 'completed' && new Date(m.due_date) < today
        ).length,
        upcoming: enrichedMilestones.filter(m => {
          const thirtyDays = new Date();
          thirtyDays.setDate(thirtyDays.getDate() + 30);
          return m.status !== 'completed' && new Date(m.due_date) <= thirtyDays;
        }).length,
        completion_rate: Math.round(
          (enrichedMilestones.filter(m => m.status === 'completed').length /
            enrichedMilestones.length) * 100 || 0
        ),
        total_budget: enrichedMilestones.reduce((sum, m) => sum + m.budget_allocated, 0),
        total_spent: enrichedMilestones.reduce((sum, m) => sum + m.actual_cost, 0),
        total_variance: enrichedMilestones.reduce((sum, m) => sum + m.variance, 0),
        avg_health_score: Math.round(
          enrichedMilestones.reduce((sum, m) => sum + m.health_score, 0) /
            enrichedMilestones.length || 0
        ),
        critical_path: enrichedMilestones
          .filter(m => m.is_critical && m.status !== 'completed')
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
          .map(m => ({ id: m.id, name: m.name, due_date: m.due_date, progress: m.progress }))
      };

      console.log(`🎯 Fetched ${enrichedMilestones.length} milestones for ${user.email}`);

      return res.status(200).json({ success: true, data: enrichedMilestones, summary });
    }

    // POST - Create milestone
    if (req.method === 'POST') {
      const mileData = req.body;

      if (!mileData.project_id || !mileData.name || !mileData.due_date) {
        return res.status(400).json({
          success: false,
          error: 'Project, name, and due date are required'
        });
      }

      const newMilestone = {
        id: `mile-${Date.now()}`,
        project_id: mileData.project_id,
        name: mileData.name,
        description: mileData.description || '',
        due_date: mileData.due_date,
        status: 'pending',
        progress: 0,
        is_critical: mileData.is_critical || 0,
        dependencies: mileData.dependencies || [],
        deliverables: mileData.deliverables || [],
        budget_allocated: mileData.budget_allocated || 0,
        actual_cost: 0,
        variance: 0,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      milestones.push(newMilestone);

      console.log(`✅ Milestone created: ${newMilestone.name}`);

      const notification = {
        type: 'milestone_created',
        milestone_id: newMilestone.id,
        message: `New milestone: ${newMilestone.name}`,
        due_date: newMilestone.due_date,
        is_critical: newMilestone.is_critical,
        timestamp: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        data: newMilestone,
        notification,
        message: 'Milestone created successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Milestones API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
