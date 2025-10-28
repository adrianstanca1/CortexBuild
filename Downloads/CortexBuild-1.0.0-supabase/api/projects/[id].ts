import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Shared projects data
let projects = [
  {
    id: 'proj-1',
    company_id: 'company-1',
    name: 'Metropolis Tower',
    description: '32-story mixed-use development with retail podium and rooftop amenities',
    project_number: 'PRJ-2025-001',
    status: 'active',
    priority: 'high',
    start_date: '2025-01-15',
    end_date: '2026-11-30',
    budget: 12500000,
    actual_cost: 4100000,
    progress: 32,
    address: '500 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94102',
    client_id: 'client-1',
    project_manager_id: 'user-2',
    is_archived: 0,
    created_at: new Date('2025-01-15').toISOString(),
    updated_at: new Date().toISOString()
  }
];

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
    const { id } = req.query;

    // GET - Fetch single project with full details
    if (req.method === 'GET') {
      const project = projects.find(p => p.id === id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Add computed analytics
      const enrichedProject = {
        ...project,
        budget_remaining: project.budget - project.actual_cost,
        budget_used_percent: Math.round((project.actual_cost / project.budget) * 100),
        is_over_budget: project.actual_cost > project.budget,
        health_score: calculateProjectHealth(project)
      };

      console.log(`📊 Fetched project details: ${project.name}`);

      return res.status(200).json({
        success: true,
        data: enrichedProject
      });
    }

    // PUT - Update project
    if (req.method === 'PUT') {
      const projectIndex = projects.findIndex(p => p.id === id);

      if (projectIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const updates = req.body;
      projects[projectIndex] = {
        ...projects[projectIndex],
        ...updates,
        id: projects[projectIndex].id,
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Project updated: ${projects[projectIndex].name}`);

      return res.status(200).json({
        success: true,
        data: projects[projectIndex],
        message: 'Project updated successfully'
      });
    }

    // DELETE - Delete project
    if (req.method === 'DELETE') {
      const projectIndex = projects.findIndex(p => p.id === id);

      if (projectIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const deletedProject = projects[projectIndex];
      projects.splice(projectIndex, 1);

      console.log(`🗑️ Project deleted: ${deletedProject.name}`);

      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('❌ Project API error:', error);

    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Calculate project health score (0-100)
function calculateProjectHealth(project: any): number {
  let score = 100;

  // Budget health (30 points)
  const budgetUsed = (project.actual_cost / project.budget) * 100;
  if (budgetUsed > 100) score -= 30;
  else if (budgetUsed > 90) score -= 20;
  else if (budgetUsed > 80) score -= 10;

  // Schedule health (30 points)
  const progressVsBudget = project.progress - budgetUsed;
  if (progressVsBudget < -20) score -= 30;
  else if (progressVsBudget < -10) score -= 20;
  else if (progressVsBudget < 0) score -= 10;

  // Priority factor (20 points)
  if (project.priority === 'critical' && project.progress < 50) score -= 20;
  else if (project.priority === 'high' && project.progress < 30) score -= 10;

  // Status factor (20 points)
  if (project.status === 'on-hold') score -= 20;
  else if (project.status === 'planning' && project.progress > 0) score += 10;

  return Math.max(0, Math.min(100, score));
}
