import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Enhanced Team Management API endpoint
 * GET /api/team - List team members with filtering
 * POST /api/team - Add new team member
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

  try {
    if (req.method === 'GET') {
      return await handleGetTeamMembers(req, res);
    } else if (req.method === 'POST') {
      return await handleCreateTeamMember(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Team API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

async function handleGetTeamMembers(req: VercelRequest, res: VercelResponse) {
  const { 
    page = 1, 
    limit = 20, 
    role, 
    status = 'active',
    project_id,
    search,
    skills,
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  // Enhanced mock team members data
  const mockTeamMembers = [
    {
      id: 'user-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@asagents.com',
      phone: '+44 7700 900123',
      role: 'PROJECT_MANAGER',
      department: 'Construction Management',
      status: 'active',
      avatar: null,
      joinDate: '2022-03-15',
      location: 'London, UK',
      skills: ['Project Management', 'Construction Planning', 'Risk Assessment', 'Team Leadership'],
      certifications: ['PMP', 'PRINCE2', 'CITB SMSTS'],
      currentProjects: [
        { id: 'proj-001', name: 'Residential Complex Phase 1', role: 'Project Manager' }
      ],
      performance: {
        projectsCompleted: 15,
        onTimeDelivery: 93,
        budgetAccuracy: 97,
        clientSatisfaction: 4.8,
        teamRating: 4.7
      },
      workload: {
        currentUtilization: 85,
        hoursThisWeek: 42,
        upcomingDeadlines: 3
      },
      contact: {
        emergencyContact: 'Jane Smith - 07700 900124',
        address: '123 Residential St, London, SW1A 1AA'
      },
      createdAt: '2022-03-15T09:00:00Z',
      updatedAt: '2024-09-30T14:30:00Z'
    },
    {
      id: 'user-002',
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@asagents.com',
      phone: '+44 7700 900234',
      role: 'SITE_ENGINEER',
      department: 'Engineering',
      status: 'active',
      avatar: null,
      joinDate: '2023-01-20',
      location: 'Manchester, UK',
      skills: ['Structural Engineering', 'Site Supervision', 'Quality Control', 'Safety Management'],
      certifications: ['CEng', 'ICE Member', 'CITB SSSTS'],
      currentProjects: [
        { id: 'proj-001', name: 'Residential Complex Phase 1', role: 'Site Engineer' },
        { id: 'proj-002', name: 'Office Tower Renovation', role: 'Consulting Engineer' }
      ],
      performance: {
        projectsCompleted: 8,
        onTimeDelivery: 88,
        budgetAccuracy: 94,
        clientSatisfaction: 4.6,
        teamRating: 4.5
      },
      workload: {
        currentUtilization: 92,
        hoursThisWeek: 45,
        upcomingDeadlines: 2
      },
      contact: {
        emergencyContact: 'Tom Wilson - 07700 900235',
        address: '456 Engineering Ave, Manchester, M1 2AB'
      },
      createdAt: '2023-01-20T10:30:00Z',
      updatedAt: '2024-09-29T16:15:00Z'
    },
    {
      id: 'user-003',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@asagents.com',
      phone: '+44 7700 900345',
      role: 'FOREMAN',
      department: 'Site Operations',
      status: 'active',
      avatar: null,
      joinDate: '2021-07-10',
      location: 'Birmingham, UK',
      skills: ['Site Management', 'Team Coordination', 'Safety Protocols', 'Quality Assurance'],
      certifications: ['CITB SMSTS', 'First Aid', 'CSCS Gold Card'],
      currentProjects: [
        { id: 'proj-001', name: 'Residential Complex Phase 1', role: 'Site Foreman' }
      ],
      performance: {
        projectsCompleted: 22,
        onTimeDelivery: 96,
        budgetAccuracy: 91,
        clientSatisfaction: 4.9,
        teamRating: 4.8
      },
      workload: {
        currentUtilization: 78,
        hoursThisWeek: 38,
        upcomingDeadlines: 1
      },
      contact: {
        emergencyContact: 'Sarah Brown - 07700 900346',
        address: '789 Site Workers Rd, Birmingham, B1 1AA'
      },
      createdAt: '2021-07-10T08:00:00Z',
      updatedAt: '2024-09-28T12:45:00Z'
    },
    {
      id: 'user-004',
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@asagents.com',
      phone: '+44 7700 900456',
      role: 'PROJECT_MANAGER',
      department: 'Commercial Projects',
      status: 'active',
      avatar: null,
      joinDate: '2022-09-05',
      location: 'Leeds, UK',
      skills: ['Commercial Development', 'Stakeholder Management', 'Financial Planning', 'Contract Negotiation'],
      certifications: ['PMP', 'RICS', 'APM'],
      currentProjects: [
        { id: 'proj-002', name: 'Office Tower Renovation', role: 'Project Manager' }
      ],
      performance: {
        projectsCompleted: 12,
        onTimeDelivery: 91,
        budgetAccuracy: 95,
        clientSatisfaction: 4.7,
        teamRating: 4.6
      },
      workload: {
        currentUtilization: 88,
        hoursThisWeek: 44,
        upcomingDeadlines: 4
      },
      contact: {
        emergencyContact: 'Mark Anderson - 07700 900457',
        address: '321 Commercial St, Leeds, LS1 1AB'
      },
      createdAt: '2022-09-05T11:15:00Z',
      updatedAt: '2024-09-30T09:20:00Z'
    },
    {
      id: 'user-005',
      firstName: 'Robert',
      lastName: 'Taylor',
      email: 'robert.taylor@asagents.com',
      phone: '+44 7700 900567',
      role: 'STRUCTURAL_ENGINEER',
      department: 'Engineering',
      status: 'active',
      avatar: null,
      joinDate: '2023-04-12',
      location: 'Bristol, UK',
      skills: ['Structural Analysis', 'CAD Design', 'Building Regulations', 'Material Science'],
      certifications: ['CEng', 'IStructE Member', 'Tekla Structures'],
      currentProjects: [
        { id: 'proj-002', name: 'Office Tower Renovation', role: 'Structural Engineer' }
      ],
      performance: {
        projectsCompleted: 6,
        onTimeDelivery: 85,
        budgetAccuracy: 98,
        clientSatisfaction: 4.5,
        teamRating: 4.4
      },
      workload: {
        currentUtilization: 95,
        hoursThisWeek: 47,
        upcomingDeadlines: 3
      },
      contact: {
        emergencyContact: 'Helen Taylor - 07700 900568',
        address: '654 Engineering Pk, Bristol, BS1 1CD'
      },
      createdAt: '2023-04-12T14:00:00Z',
      updatedAt: '2024-09-27T15:30:00Z'
    },
    {
      id: 'user-006',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@asagents.com',
      phone: '+44 7700 900678',
      role: 'INTERIOR_DESIGNER',
      department: 'Design',
      status: 'active',
      avatar: null,
      joinDate: '2022-11-18',
      location: 'Edinburgh, UK',
      skills: ['Interior Design', 'Space Planning', '3D Visualization', 'Sustainability'],
      certifications: ['BIID', 'LEED AP', 'AutoCAD'],
      currentProjects: [
        { id: 'proj-002', name: 'Office Tower Renovation', role: 'Interior Designer' }
      ],
      performance: {
        projectsCompleted: 9,
        onTimeDelivery: 89,
        budgetAccuracy: 92,
        clientSatisfaction: 4.8,
        teamRating: 4.7
      },
      workload: {
        currentUtilization: 82,
        hoursThisWeek: 40,
        upcomingDeadlines: 2
      },
      contact: {
        emergencyContact: 'Carlos Garcia - 07700 900679',
        address: '987 Design Quarter, Edinburgh, EH1 1EF'
      },
      createdAt: '2022-11-18T13:45:00Z',
      updatedAt: '2024-09-26T11:10:00Z'
    }
  ];

  // Apply filters
  let filteredMembers = mockTeamMembers;

  if (role) {
    filteredMembers = filteredMembers.filter(member => member.role === role);
  }

  if (status) {
    filteredMembers = filteredMembers.filter(member => member.status === status);
  }

  if (project_id) {
    filteredMembers = filteredMembers.filter(member => 
      member.currentProjects.some(proj => proj.id === project_id)
    );
  }

  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredMembers = filteredMembers.filter(member =>
      member.firstName.toLowerCase().includes(searchTerm) ||
      member.lastName.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm) ||
      member.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  }

  if (skills) {
    const requiredSkills = skills.toString().split(',').map(s => s.trim().toLowerCase());
    filteredMembers = filteredMembers.filter(member =>
      requiredSkills.some(skill => 
        member.skills.some(memberSkill => memberSkill.toLowerCase().includes(skill))
      )
    );
  }

  // Apply sorting
  filteredMembers.sort((a, b) => {
    let aValue = a[sortBy as keyof typeof a];
    let bValue = b[sortBy as keyof typeof b];
    
    if (sortBy === 'name') {
      aValue = `${a.firstName} ${a.lastName}`;
      bValue = `${b.firstName} ${b.lastName}`;
    }
    
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
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  // Calculate summary statistics
  const totalMembers = filteredMembers.length;
  const activeMembers = filteredMembers.filter(m => m.status === 'active').length;
  const avgUtilization = totalMembers > 0 ? 
    filteredMembers.reduce((sum, m) => sum + m.workload.currentUtilization, 0) / totalMembers : 0;

  const roleCounts = filteredMembers.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentCounts = filteredMembers.reduce((acc, member) => {
    acc[member.department] = (acc[member.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const response = {
    success: true,
    data: {
      members: paginatedMembers,
      pagination: {
        current_page: pageNum,
        per_page: pageSize,
        total: totalMembers,
        total_pages: Math.ceil(totalMembers / pageSize),
        has_next: endIndex < totalMembers,
        has_prev: pageNum > 1
      },
      summary: {
        total_members: totalMembers,
        active_members: activeMembers,
        avg_utilization: Math.round(avgUtilization),
        role_distribution: roleCounts,
        department_distribution: departmentCounts,
        high_performers: filteredMembers
          .filter(m => m.performance.teamRating >= 4.7)
          .length,
        overloaded_members: filteredMembers
          .filter(m => m.workload.currentUtilization > 90)
          .length
      }
    },
    timestamp: new Date().toISOString(),
    api_version: '2.0'
  };

  return res.status(200).json(response);
}

async function handleCreateTeamMember(req: VercelRequest, res: VercelResponse) {
  const {
    firstName,
    lastName,
    email,
    phone,
    role,
    department,
    location,
    skills = [],
    certifications = []
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !role || !department) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'firstName, lastName, email, role, and department are required'
    });
  }

  const newMember = {
    id: `user-${Date.now()}`,
    firstName,
    lastName,
    email,
    phone: phone || '',
    role,
    department,
    status: 'active',
    avatar: null,
    joinDate: new Date().toISOString().split('T')[0],
    location: location || '',
    skills: Array.isArray(skills) ? skills : [],
    certifications: Array.isArray(certifications) ? certifications : [],
    currentProjects: [],
    performance: {
      projectsCompleted: 0,
      onTimeDelivery: 0,
      budgetAccuracy: 0,
      clientSatisfaction: 0,
      teamRating: 0
    },
    workload: {
      currentUtilization: 0,
      hoursThisWeek: 0,
      upcomingDeadlines: 0
    },
    contact: {
      emergencyContact: '',
      address: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return res.status(201).json({
    success: true,
    data: newMember,
    message: 'Team member created successfully',
    timestamp: new Date().toISOString()
  });
}