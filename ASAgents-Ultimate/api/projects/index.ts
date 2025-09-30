import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Enhanced Projects API endpoint
 * GET /api/projects - List all projects with advanced filtering and pagination
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
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      sortBy = 'created_at',
      sortOrder = 'desc',
      startDate,
      endDate,
      budget_min,
      budget_max
    } = req.query;

    // Enhanced mock projects with comprehensive data
    const mockProjects = [
      {
        id: 'proj-001',
        name: 'Residential Complex Phase 1',
        description: 'Construction of 50-unit residential complex with modern amenities',
        status: 'IN_PROGRESS',
        progress: 65,
        budget: 2850000,
        spent: 1852500,
        actualCost: 1852500,
        startDate: '2024-03-15',
        endDate: '2024-12-20',
        location: {
          address: '123 Construction Ave, London, UK',
          city: 'London',
          state: 'England',
          zip: 'SW1A 1AA',
          coordinates: { lat: 51.5074, lng: -0.1278 },
          postcode: 'SW1A 1AA'
        },
        client: {
          id: 'client-001',
          name: 'Metropolitan Housing Ltd',
          contact: 'sarah.johnson@methousing.co.uk'
        },
        manager: {
          id: 'user-001',
          name: 'John Smith',
          email: 'john.smith@asagents.com',
          avatar: null
        },
        team: [
          { id: 'user-001', name: 'John Smith', role: 'Project Manager' },
          { id: 'user-002', name: 'Emma Wilson', role: 'Site Engineer' },
          { id: 'user-003', name: 'Michael Brown', role: 'Foreman' }
        ],
        milestones: [
          { id: 'm-001', name: 'Foundation Complete', date: '2024-04-30', completed: true },
          { id: 'm-002', name: 'Frame Complete', date: '2024-07-15', completed: true },
          { id: 'm-003', name: 'Roof Complete', date: '2024-09-30', completed: false },
          { id: 'm-004', name: 'Final Inspection', date: '2024-12-15', completed: false }
        ],
        risks: [
          { id: 'risk-001', description: 'Weather delays', severity: 'medium', probability: 'high' },
          { id: 'risk-002', description: 'Material shortage', severity: 'high', probability: 'low' }
        ],
        documents: [
          { id: 'doc-001', name: 'Building Permit', type: 'permit', status: 'approved' },
          { id: 'doc-002', name: 'Safety Plan', type: 'safety', status: 'active' }
        ],
        companyId: 'company-demo-1',
        projectType: 'Residential',
        workClassification: 'New Construction',
        createdAt: '2024-03-01T10:00:00Z',
        updatedAt: '2024-09-30T14:30:00Z'
      },
      {
        id: 'proj-002',
        name: 'Office Tower Renovation',
        description: 'Complete renovation of 15-story office building with modern facilities',
        status: 'PLANNING',
        progress: 15,
        budget: 4200000,
        spent: 630000,
        actualCost: 630000,
        startDate: '2024-11-01',
        endDate: '2025-08-30',
        location: {
          address: '456 Business District, Manchester, UK',
          city: 'Manchester',
          state: 'England',
          zip: 'M1 2AB',
          coordinates: { lat: 53.4808, lng: -2.2426 },
          postcode: 'M1 2AB'
        },
        client: {
          id: 'client-002',
          name: 'Corporate Spaces Ltd',
          contact: 'david.wilson@corpspaces.co.uk'
        },
        manager: {
          id: 'user-004',
          name: 'Lisa Anderson',
          email: 'lisa.anderson@asagents.com',
          avatar: null
        },
        team: [
          { id: 'user-004', name: 'Lisa Anderson', role: 'Project Manager' },
          { id: 'user-005', name: 'Robert Taylor', role: 'Structural Engineer' },
          { id: 'user-006', name: 'Maria Garcia', role: 'Interior Designer' }
        ],
        milestones: [
          { id: 'm-005', name: 'Design Approval', date: '2024-10-15', completed: false },
          { id: 'm-006', name: 'Permits Obtained', date: '2024-10-30', completed: false },
          { id: 'm-007', name: 'Demolition Start', date: '2024-11-15', completed: false }
        ],
        risks: [
          { id: 'risk-003', description: 'Asbestos discovery', severity: 'high', probability: 'medium' },
          { id: 'risk-004', description: 'Structural complications', severity: 'high', probability: 'low' }
        ],
        documents: [
          { id: 'doc-003', name: 'Architectural Plans', type: 'design', status: 'review' },
          { id: 'doc-004', name: 'Environmental Assessment', type: 'environmental', status: 'pending' }
        ],
        companyId: 'company-demo-1',
        projectType: 'Commercial',
        workClassification: 'Renovation',
        createdAt: '2024-08-15T09:00:00Z',
        updatedAt: '2024-09-28T16:45:00Z'
      },
      {
        id: 'proj-003',
        name: 'Bridge Repair Project',
        description: 'Structural repair and reinforcement of Victorian era bridge',
        status: 'COMPLETED',
        progress: 100,
        budget: 1500000,
        spent: 1425000,
        actualCost: 1425000,
        startDate: '2024-01-08',
        endDate: '2024-08-15',
        location: {
          address: 'River Thames, Greenwich, London, UK',
          city: 'London',
          state: 'England',
          zip: 'SE10 9NF',
          coordinates: { lat: 51.4816, lng: -0.0076 },
          postcode: 'SE10 9NF'
        },
        client: {
          id: 'client-003',
          name: 'London Borough Council',
          contact: 'infrastructure@greenwich.gov.uk'
        },
        manager: {
          id: 'user-007',
          name: 'James Thompson',
          email: 'james.thompson@asagents.com',
          avatar: null
        },
        team: [
          { id: 'user-007', name: 'James Thompson', role: 'Project Manager' },
          { id: 'user-008', name: 'Sarah Lee', role: 'Civil Engineer' },
          { id: 'user-009', name: 'Tom Richards', role: 'Site Supervisor' }
        ],
        milestones: [
          { id: 'm-008', name: 'Structural Assessment', date: '2024-02-15', completed: true },
          { id: 'm-009', name: 'Repair Work Complete', date: '2024-07-30', completed: true },
          { id: 'm-010', name: 'Final Inspection', date: '2024-08-10', completed: true }
        ],
        risks: [
          { id: 'risk-005', description: 'Weather delays', severity: 'medium', probability: 'high' },
          { id: 'risk-006', description: 'Traffic disruption', severity: 'medium', probability: 'high' }
        ],
        documents: [
          { id: 'doc-005', name: 'Structural Report', type: 'engineering', status: 'approved' },
          { id: 'doc-006', name: 'Completion Certificate', type: 'certificate', status: 'issued' }
        ],
        companyId: 'company-demo-1',
        projectType: 'Infrastructure',
        workClassification: 'Repair & Maintenance',
        createdAt: '2023-12-15T08:00:00Z',
        updatedAt: '2024-08-15T17:00:00Z'
      }
    ];

    // Apply filters
    let filteredProjects = mockProjects;

    if (status) {
      filteredProjects = filteredProjects.filter(p => p.status === status);
    }

    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.location.address.toLowerCase().includes(searchTerm)
      );
    }

    if (budget_min) {
      filteredProjects = filteredProjects.filter(p => p.budget >= parseInt(budget_min.toString()));
    }

    if (budget_max) {
      filteredProjects = filteredProjects.filter(p => p.budget <= parseInt(budget_max.toString()));
    }

    // Apply sorting
    filteredProjects.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const pageNum = parseInt(page.toString());
    const pageSize = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    // Calculate summary statistics
    const totalProjects = filteredProjects.length;
    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);
    const avgProgress = totalProjects > 0 ? filteredProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects : 0;

    const statusCounts = filteredProjects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      success: true,
      data: {
        projects: paginatedProjects,
        pagination: {
          current_page: pageNum,
          per_page: pageSize,
          total: totalProjects,
          total_pages: Math.ceil(totalProjects / pageSize),
          has_next: endIndex < totalProjects,
          has_prev: pageNum > 1
        },
        summary: {
          total_projects: totalProjects,
          total_budget: totalBudget,
          total_spent: totalSpent,
          avg_progress: Math.round(avgProgress * 10) / 10,
          status_counts: statusCounts,
          budget_utilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
        },
        filters_applied: {
          status: status || null,
          search: search || null,
          budget_range: budget_min || budget_max ? { min: budget_min, max: budget_max } : null,
          date_range: startDate || endDate ? { start: startDate, end: endDate } : null
        }
      },
      timestamp: new Date().toISOString(),
      api_version: '2.0'
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
