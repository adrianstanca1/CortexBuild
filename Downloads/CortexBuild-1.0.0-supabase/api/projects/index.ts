import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Mock projects database with rich data
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
    updated_at: new Date().toISOString(),
    // Computed fields
    variance: -300000,
    variance_percent: -2.4,
    days_remaining: 650,
    completion_date_estimate: '2026-11-15'
  },
  {
    id: 'proj-2',
    company_id: 'company-1',
    name: 'Bayview Innovation Campus',
    description: 'Technology campus with three office buildings and shared facilities',
    project_number: 'PRJ-2025-002',
    status: 'planning',
    priority: 'medium',
    start_date: '2025-03-01',
    end_date: '2027-02-28',
    budget: 8600000,
    actual_cost: 525000,
    progress: 5,
    address: '1200 Innovation Way',
    city: 'San Jose',
    state: 'CA',
    zip_code: '95134',
    client_id: 'client-2',
    project_manager_id: 'user-2',
    is_archived: 0,
    created_at: new Date('2025-02-01').toISOString(),
    updated_at: new Date().toISOString(),
    variance: 75000,
    variance_percent: 0.9,
    days_remaining: 730,
    completion_date_estimate: '2027-02-28'
  }
];

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

    // GET - Fetch all projects with filters
    if (req.method === 'GET') {
      const { status, priority, company_id, search } = req.query;

      let filteredProjects = [...projects];

      // Filter by company (non-super admins only see their company's projects)
      if (user.role !== 'super_admin') {
        filteredProjects = filteredProjects.filter(p => p.company_id === company_id);
      }

      // Apply filters
      if (status) {
        filteredProjects = filteredProjects.filter(p => p.status === status);
      }
      if (priority) {
        filteredProjects = filteredProjects.filter(p => p.priority === priority);
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredProjects = filteredProjects.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.project_number.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }

      // Calculate summary statistics
      const summary = {
        total: filteredProjects.length,
        active: filteredProjects.filter(p => p.status === 'active').length,
        planning: filteredProjects.filter(p => p.status === 'planning').length,
        completed: filteredProjects.filter(p => p.status === 'completed').length,
        total_budget: filteredProjects.reduce((sum, p) => sum + p.budget, 0),
        total_actual: filteredProjects.reduce((sum, p) => sum + p.actual_cost, 0),
        avg_progress: Math.round(
          filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length || 0
        )
      };

      console.log(`📋 Fetched ${filteredProjects.length} projects for user ${user.email}`);

      return res.status(200).json({
        success: true,
        data: filteredProjects,
        summary
      });
    }

    // POST - Create new project
    if (req.method === 'POST') {
      const projectData = req.body;

      // Validate required fields
      if (!projectData.name || !projectData.company_id) {
        return res.status(400).json({
          success: false,
          error: 'Project name and company are required'
        });
      }

      // Generate project number if not provided
      const projectNumber = projectData.project_number ||
        `PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, '0')}`;

      const newProject = {
        id: `proj-${Date.now()}`,
        company_id: projectData.company_id,
        name: projectData.name,
        description: projectData.description || '',
        project_number: projectNumber,
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        start_date: projectData.start_date || new Date().toISOString().split('T')[0],
        end_date: projectData.end_date || '',
        budget: parseFloat(projectData.budget) || 0,
        actual_cost: 0,
        progress: 0,
        address: projectData.address || '',
        city: projectData.city || '',
        state: projectData.state || '',
        zip_code: projectData.zip_code || '',
        client_id: projectData.client_id || null,
        project_manager_id: projectData.project_manager_id || user.userId,
        is_archived: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variance: 0,
        variance_percent: 0,
        days_remaining: 0,
        completion_date_estimate: projectData.end_date || ''
      };

      projects.push(newProject);

      console.log(`✅ Project created: ${newProject.name} by ${user.email}`);

      return res.status(201).json({
        success: true,
        data: newProject,
        message: 'Project created successfully'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('❌ Projects API error:', error);

    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
