import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let milestones = [
  {
    id: 'mile-1',
    project_id: 'proj-1',
    name: 'Foundation Complete',
    description: 'All foundation work completed and inspected',
    target_date: '2025-02-28',
    actual_date: '2025-02-25',
    status: 'completed',
    progress: 100,
    dependencies: [],
    budget_allocation: 8500000,
    actual_cost: 8200000,
    health_score: 96,
    is_critical_path: 1,
    created_at: '2025-01-01T00:00:00Z',
    completed_at: '2025-02-25T16:00:00Z'
  },
  {
    id: 'mile-2',
    project_id: 'proj-1',
    name: 'Structural Steel Erection',
    description: 'Complete steel framework for levels 1-10',
    target_date: '2025-04-15',
    actual_date: null,
    status: 'in-progress',
    progress: 35,
    dependencies: ['mile-1'],
    budget_allocation: 12000000,
    actual_cost: 4200000,
    health_score: 87,
    is_critical_path: 1,
    created_at: '2025-01-01T00:00:00Z',
    completed_at: null
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

function calculateMilestoneHealth(milestone: any): number {
  let score = 100;

  // Budget variance
  const budgetVariance = ((milestone.actual_cost - milestone.budget_allocation) / milestone.budget_allocation) * 100;
  if (budgetVariance > 10) score -= 20;
  else if (budgetVariance > 5) score -= 10;

  // Schedule variance
  if (milestone.status !== 'completed') {
    const today = new Date().toISOString().split('T')[0];
    const daysRemaining = Math.floor((new Date(milestone.target_date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = Math.min(100, ((100 - milestone.progress) / (daysRemaining + 1)) * 100);

    if (milestone.progress < expectedProgress - 20) score -= 25;
    else if (milestone.progress < expectedProgress - 10) score -= 15;
  }

  // Late completion
  if (milestone.status === 'completed' && milestone.actual_date > milestone.target_date) {
    score -= 15;
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
    const { id } = req.query;

    // GET - Fetch single milestone
    if (req.method === 'GET') {
      const milestone = milestones.find(m => m.id === id);

      if (!milestone) {
        return res.status(404).json({ success: false, error: 'Milestone not found' });
      }

      // Calculate current health score
      const health_score = calculateMilestoneHealth(milestone);

      // Check for blocked dependencies
      const blockedDependencies = milestone.dependencies.filter((depId: string) => {
        const dep = milestones.find(m => m.id === depId);
        return dep && dep.status !== 'completed';
      });

      console.log(`✅ Fetched milestone ${milestone.name}`);

      return res.status(200).json({
        success: true,
        data: {
          ...milestone,
          health_score,
          blocked_dependencies: blockedDependencies.length,
          is_blocked: blockedDependencies.length > 0
        }
      });
    }

    // PUT/PATCH - Update milestone
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const milestoneIndex = milestones.findIndex(m => m.id === id);

      if (milestoneIndex === -1) {
        return res.status(404).json({ success: false, error: 'Milestone not found' });
      }

      const milestone = milestones[milestoneIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin' && user.role !== 'supervisor') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      const updates = req.body;

      // Handle completion
      const isCompleting = updates.status === 'completed' && milestone.status !== 'completed';
      if (isCompleting) {
        updates.progress = 100;
        updates.actual_date = new Date().toISOString().split('T')[0];
        updates.completed_at = new Date().toISOString();
      }

      // Validate dependencies
      if (updates.dependencies) {
        const invalidDeps = updates.dependencies.filter((depId: string) => !milestones.find(m => m.id === depId));
        if (invalidDeps.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Invalid dependencies',
            details: `Milestones not found: ${invalidDeps.join(', ')}`
          });
        }

        // Check for circular dependencies
        const hasCycle = (current: string, visited = new Set<string>()): boolean => {
          if (visited.has(current)) return true;
          visited.add(current);

          const deps = current === id ? updates.dependencies : milestones.find(m => m.id === current)?.dependencies || [];
          return deps.some((dep: string) => hasCycle(dep, new Set(visited)));
        };

        if (hasCycle(id as string)) {
          return res.status(400).json({
            success: false,
            error: 'Circular dependency detected',
            details: 'Milestone dependencies cannot form a cycle'
          });
        }
      }

      // Update milestone
      milestones[milestoneIndex] = {
        ...milestone,
        ...updates,
        id: milestone.id,
        project_id: milestone.project_id,
        created_at: milestone.created_at,
        updated_at: new Date().toISOString()
      };

      // Recalculate health score
      milestones[milestoneIndex].health_score = calculateMilestoneHealth(milestones[milestoneIndex]);

      console.log(`✅ Updated milestone ${milestones[milestoneIndex].name}`);

      // Create activity log
      const activity = {
        type: isCompleting ? 'milestone_completed' : 'milestone_updated',
        milestone_id: milestone.id,
        milestone_name: milestone.name,
        user_id: user.userId,
        changes: updates,
        timestamp: new Date().toISOString()
      };

      // Create notification for completion
      const notification = isCompleting ? {
        type: 'milestone_completed',
        milestone_id: milestone.id,
        milestone_name: milestone.name,
        project_id: milestone.project_id,
        message: `Milestone "${milestone.name}" has been completed`,
        on_schedule: updates.actual_date <= milestone.target_date,
        timestamp: new Date().toISOString()
      } : null;

      return res.status(200).json({
        success: true,
        data: milestones[milestoneIndex],
        activity,
        notification,
        message: 'Milestone updated successfully'
      });
    }

    // DELETE - Delete milestone
    if (req.method === 'DELETE') {
      const milestoneIndex = milestones.findIndex(m => m.id === id);

      if (milestoneIndex === -1) {
        return res.status(404).json({ success: false, error: 'Milestone not found' });
      }

      const milestone = milestones[milestoneIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Can't delete completed milestones
      if (milestone.status === 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete completed milestones',
          details: 'Completed milestones are part of the project history'
        });
      }

      // Check if other milestones depend on this one
      const dependentMilestones = milestones.filter(m => m.dependencies.includes(milestone.id));
      if (dependentMilestones.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete milestone with dependencies',
          details: `${dependentMilestones.length} milestone(s) depend on this one`,
          dependent_milestones: dependentMilestones.map(m => ({ id: m.id, name: m.name }))
        });
      }

      milestones.splice(milestoneIndex, 1);

      console.log(`✅ Deleted milestone ${milestone.name}`);

      // Create activity log
      const activity = {
        type: 'milestone_deleted',
        milestone_id: milestone.id,
        milestone_name: milestone.name,
        user_id: user.userId,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        activity,
        message: 'Milestone deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Milestone API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
