/**
 * Simple Server - Alternative to complex server
 * Provides basic API endpoints without complex manager system
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/system/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        api: true,
        database: true
      }
    }
  });
});

// System status
app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const totalRevenue = mockData.invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpenses = mockData.projects.reduce((sum, proj) => sum + (proj.spent || 0), 0);
  const completedTasks = mockData.tasks.filter(t => t.status === 'completed').length;
  const activeTasks = mockData.tasks.filter(t => t.status !== 'completed').length;
  
  res.json({
    success: true,
    data: {
      totalProjects: mockData.projects.length,
      activeProjects: mockData.projects.filter(p => p.status === 'active').length,
      completedProjects: mockData.projects.filter(p => p.status === 'completed').length,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      activeTasks,
      completedTasks,
      totalTasks: mockData.tasks.length,
      teamMembers: mockData.team.length,
      pendingInvoices: mockData.invoices.filter(i => i.status === 'pending').length,
      overdueInvoices: mockData.invoices.filter(i => i.status === 'overdue').length
    }
  });
});

// Dashboard overview
app.get('/api/dashboard/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      serverStats: {
        uptime: process.uptime(),
        status: 'healthy'
      },
      projects: []
    }
  });
});

// Dashboard recent
app.get('/api/dashboard/recent', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Tasks endpoints
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    data: mockData.tasks
  });
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: 'TASK-' + String(mockData.tasks.length + 1).padStart(3, '0'),
    ...req.body,
    status: req.body.status || 'pending',
    createdAt: new Date().toISOString()
  };
  mockData.tasks.push(newTask);
  res.json({
    success: true,
    data: newTask
  });
});

app.get('/api/tasks/:id', (req, res) => {
  const task = mockData.tasks.find(t => t.id === req.params.id);
  if (task) {
    res.json({
      success: true,
      data: task
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  const index = mockData.tasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    mockData.tasks[index] = {
      ...mockData.tasks[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json({
      success: true,
      data: mockData.tasks[index]
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const index = mockData.tasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    mockData.tasks.splice(index, 1);
    res.json({
      success: true,
      message: 'Task deleted'
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
});

app.post('/api/tasks/:id/complete', (req, res) => {
  const index = mockData.tasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    mockData.tasks[index] = {
      ...mockData.tasks[index],
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    res.json({
      success: true,
      data: mockData.tasks[index]
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
});

// Notifications endpoints
app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/notifications/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      title: 'Sample Notification',
      read: false
    }
  });
});

app.post('/api/notifications/:id/read', (req, res) => {
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

app.post('/api/notifications/mark-all-read', (req, res) => {
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Analytics endpoints
app.get('/api/analytics/overview', (req, res) => {
  const totalRevenue = mockData.invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpenses = mockData.projects.reduce((sum, proj) => sum + (proj.spent || 0), 0);
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  
  res.json({
    success: true,
    data: {
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin: profitMargin.toFixed(2),
      projectsCompleted: mockData.projects.filter(p => p.status === 'completed').length,
      projectsActive: mockData.projects.filter(p => p.status === 'active').length,
      averageProjectBudget: mockData.projects.reduce((sum, p) => sum + (p.budget || 0), 0) / mockData.projects.length
    }
  });
});

app.get('/api/analytics/projects', (req, res) => {
  const projectAnalytics = mockData.projects.map(project => ({
    id: project.id,
    name: project.name,
    budget: project.budget || 0,
    spent: project.spent || 0,
    remaining: (project.budget || 0) - (project.spent || 0),
    progress: project.progress || 0,
    status: project.status,
    efficiency: project.budget ? ((project.progress / 100) / ((project.spent || 0) / project.budget)) * 100 : 0
  }));
  
  res.json({
    success: true,
    data: projectAnalytics
  });
});

app.get('/api/analytics/revenue', (req, res) => {
  // Group invoices by month
  const monthlyRevenue = {};
  mockData.invoices.forEach(invoice => {
    const month = new Date(invoice.createdAt).toISOString().slice(0, 7);
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + invoice.amount;
  });
  
  const monthly = Object.entries(monthlyRevenue).map(([month, amount]) => ({
    month,
    amount,
    year: month.split('-')[0]
  }));
  
  res.json({
    success: true,
    data: {
      monthly,
      total: mockData.invoices.reduce((sum, inv) => sum + inv.amount, 0),
      average: monthly.length > 0 ? mockData.invoices.reduce((sum, inv) => sum + inv.amount, 0) / monthly.length : 0
    }
  });
});

app.get('/api/analytics/performance', (req, res) => {
  const completedTasks = mockData.tasks.filter(t => t.status === 'completed');
  const totalTasks = mockData.tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  
  const activeProjects = mockData.projects.filter(p => p.status === 'active');
  const avgProgress = activeProjects.length > 0
    ? activeProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / activeProjects.length
    : 0;
  
  res.json({
    success: true,
    data: {
      taskCompletionRate: completionRate.toFixed(2),
      averageProjectProgress: avgProgress.toFixed(2),
      onTimeDelivery: 95.5, // Mock data
      clientSatisfaction: 4.8, // Mock data
      teamProductivity: 87.3, // Mock data
      avgResponseTime: 50,
      uptime: 99.9
    }
  });
});

// Mock data store
const mockData = {
  projects: [
    {
      id: '1',
      name: 'Office Building Construction',
      description: 'Modern office building with 10 floors',
      status: 'active',
      progress: 65,
      budget: 2500000,
      spent: 1625000,
      startDate: '2025-01-15',
      dueDate: '2025-12-31',
      client: 'ABC Corporation',
      manager: 'John Smith',
      team: ['John Smith', 'Jane Doe', 'Bob Wilson'],
      createdAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Residential Complex',
      description: '50-unit residential complex',
      status: 'active',
      progress: 45,
      budget: 3500000,
      spent: 1575000,
      startDate: '2025-02-01',
      dueDate: '2026-03-31',
      client: 'XYZ Developers',
      manager: 'Jane Doe',
      team: ['Jane Doe', 'Mike Johnson'],
      createdAt: '2025-02-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Shopping Mall Renovation',
      description: 'Complete renovation of downtown mall',
      status: 'planning',
      progress: 15,
      budget: 1800000,
      spent: 270000,
      startDate: '2025-03-10',
      dueDate: '2025-11-30',
      client: 'Mall Properties LLC',
      manager: 'Bob Wilson',
      team: ['Bob Wilson', 'Sarah Brown'],
      createdAt: '2025-03-10T00:00:00Z'
    }
  ],
  invoices: [
    {
      id: 'INV-001',
      projectId: '1',
      projectName: 'Office Building Construction',
      amount: 450000,
      status: 'paid',
      dueDate: '2025-09-15',
      paidDate: '2025-09-10',
      client: 'ABC Corporation',
      items: [
        { description: 'Foundation work', amount: 250000 },
        { description: 'Structural steel', amount: 200000 }
      ],
      createdAt: '2025-08-15T00:00:00Z'
    },
    {
      id: 'INV-002',
      projectId: '2',
      projectName: 'Residential Complex',
      amount: 325000,
      status: 'pending',
      dueDate: '2025-10-30',
      client: 'XYZ Developers',
      items: [
        { description: 'Excavation and grading', amount: 150000 },
        { description: 'Foundation', amount: 175000 }
      ],
      createdAt: '2025-09-15T00:00:00Z'
    },
    {
      id: 'INV-003',
      projectId: '1',
      projectName: 'Office Building Construction',
      amount: 550000,
      status: 'overdue',
      dueDate: '2025-09-01',
      client: 'ABC Corporation',
      items: [
        { description: 'Floor framing', amount: 300000 },
        { description: 'Roofing', amount: 250000 }
      ],
      createdAt: '2025-07-25T00:00:00Z'
    }
  ],
  tasks: [
    {
      id: 'TASK-001',
      projectId: '1',
      title: 'Complete electrical wiring',
      description: 'Wire all floors for electrical systems',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Smith',
      dueDate: '2025-10-15',
      createdAt: '2025-09-20T00:00:00Z'
    },
    {
      id: 'TASK-002',
      projectId: '1',
      title: 'Install HVAC systems',
      description: 'Install heating and cooling systems',
      status: 'pending',
      priority: 'medium',
      assignee: 'Jane Doe',
      dueDate: '2025-10-30',
      createdAt: '2025-09-22T00:00:00Z'
    },
    {
      id: 'TASK-003',
      projectId: '2',
      title: 'Foundation inspection',
      description: 'Schedule and complete foundation inspection',
      status: 'completed',
      priority: 'high',
      assignee: 'Bob Wilson',
      dueDate: '2025-09-25',
      completedDate: '2025-09-24',
      createdAt: '2025-09-15T00:00:00Z'
    }
  ],
  team: [
    {
      id: 'USER-001',
      name: 'John Smith',
      email: 'john.smith@asagents.com',
      role: 'Project Manager',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=0D8ABC&color=fff',
      phone: '+1 (555) 123-4567',
      activeProjects: ['1'],
      skills: ['Construction Management', 'Budget Planning', 'Team Leadership'],
      joinedDate: '2023-05-15'
    },
    {
      id: 'USER-002',
      name: 'Jane Doe',
      email: 'jane.doe@asagents.com',
      role: 'Site Supervisor',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Doe&background=F97316&color=fff',
      phone: '+1 (555) 234-5678',
      activeProjects: ['1', '2'],
      skills: ['Site Management', 'Safety Compliance', 'Quality Control'],
      joinedDate: '2023-07-20'
    },
    {
      id: 'USER-003',
      name: 'Bob Wilson',
      email: 'bob.wilson@asagents.com',
      role: 'Engineer',
      avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=10B981&color=fff',
      phone: '+1 (555) 345-6789',
      activeProjects: ['3'],
      skills: ['Structural Engineering', 'CAD', 'Technical Analysis'],
      joinedDate: '2023-09-10'
    }
  ]
};

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email && password) {
    const userId = Date.now().toString();
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token-' + userId,
        refreshToken: 'mock-refresh-token-' + userId,
        user: {
          id: userId,
          email,
          firstName: email.split('@')[0],
          lastName: 'User',
          name: email.split('@')[0] + ' User',
          role: 'admin',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`,
          createdAt: new Date().toISOString()
        }
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Email and password required'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (name && email && password) {
    res.json({
      success: true,
      data: {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date().toISOString()
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Name, email and password required'
    });
  }
});

app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token && token.startsWith('mock-jwt-token')) {
    res.json({
      success: true,
      data: {
        valid: true,
        user: {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'user'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Users endpoints
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: mockData.team
  });
});

app.get('/api/team', (req, res) => {
  res.json({
    success: true,
    data: mockData.team
  });
});

app.get('/api/users/:id', (req, res) => {
  const user = mockData.team.find(u => u.id === req.params.id);
  if (user) {
    res.json({
      success: true,
      data: user
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
});

app.put('/api/users/:id', (req, res) => {
  const index = mockData.team.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    mockData.team[index] = {
      ...mockData.team[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json({
      success: true,
      data: mockData.team[index]
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const index = mockData.team.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    mockData.team.splice(index, 1);
    res.json({
      success: true,
      message: 'User deleted'
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
});

// Projects endpoints
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: mockData.projects
  });
});

app.post('/api/projects', (req, res) => {
  const newProject = {
    id: Date.now().toString(),
    ...req.body,
    status: req.body.status || 'planning',
    progress: req.body.progress || 0,
    createdAt: new Date().toISOString()
  };
  mockData.projects.push(newProject);
  res.json({
    success: true,
    data: newProject
  });
});

app.get('/api/projects/:id', (req, res) => {
  const project = mockData.projects.find(p => p.id === req.params.id);
  if (project) {
    res.json({
      success: true,
      data: project
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
});

app.put('/api/projects/:id', (req, res) => {
  const index = mockData.projects.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    mockData.projects[index] = {
      ...mockData.projects[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json({
      success: true,
      data: mockData.projects[index]
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  const index = mockData.projects.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    mockData.projects.splice(index, 1);
    res.json({
      success: true,
      message: 'Project deleted'
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
});

// Clients endpoints
app.get('/api/clients', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.post('/api/clients', (req, res) => {
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

// Financial endpoints
app.get('/api/financials/invoices', (req, res) => {
  res.json({
    success: true,
    data: mockData.invoices
  });
});

app.get('/api/invoices', (req, res) => {
  res.json({
    success: true,
    data: mockData.invoices
  });
});

app.post('/api/financials/invoices', (req, res) => {
  const newInvoice = {
    id: 'INV-' + String(mockData.invoices.length + 1).padStart(3, '0'),
    ...req.body,
    status: req.body.status || 'pending',
    createdAt: new Date().toISOString()
  };
  mockData.invoices.push(newInvoice);
  res.json({
    success: true,
    data: newInvoice
  });
});

app.get('/api/financials/expenses', (req, res) => {
  // Calculate expenses from projects
  const expenses = mockData.projects.map(p => ({
    id: `EXP-${p.id}`,
    projectId: p.id,
    projectName: p.name,
    amount: p.spent || 0,
    category: 'construction',
    date: p.createdAt
  }));
  
  res.json({
    success: true,
    data: expenses
  });
});

app.post('/api/financials/expenses', (req, res) => {
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎉 Simple Server started successfully!');
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/system/health`);
  console.log('✨ Ready to receive requests!');
});

export default app;
