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
  res.json({
    success: true,
    data: {
      totalProjects: 5,
      activeProjects: 3,
      completedProjects: 2,
      totalRevenue: 150000,
      totalExpenses: 75000,
      activeTasks: 12,
      completedTasks: 45
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
    data: []
  });
});

app.post('/api/tasks', (req, res) => {
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/tasks/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      title: 'Sample Task',
      status: 'active'
    }
  });
});

app.put('/api/tasks/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Task deleted'
  });
});

app.post('/api/tasks/:id/complete', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      status: 'completed',
      completedAt: new Date().toISOString()
    }
  });
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
  res.json({
    success: true,
    data: {
      totalRevenue: 150000,
      totalExpenses: 75000,
      profit: 75000
    }
  });
});

app.get('/api/analytics/projects', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/analytics/revenue', (req, res) => {
  res.json({
    success: true,
    data: {
      monthly: [],
      total: 150000
    }
  });
});

app.get('/api/analytics/performance', (req, res) => {
  res.json({
    success: true,
    data: {
      avgResponseTime: 50,
      uptime: 99.9
    }
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          email,
          name: 'Demo User'
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
    data: [
      {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/users/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'user',
      createdAt: new Date().toISOString()
    }
  });
});

app.put('/api/users/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/users/:id', (req, res) => {
  res.json({
    success: true,
    message: 'User deleted'
  });
});

// Projects endpoints
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Sample Project',
        status: 'active',
        progress: 65,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });
});

app.post('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/projects/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      name: 'Sample Project',
      status: 'active',
      progress: 65
    }
  });
});

app.put('/api/projects/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/projects/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Project deleted'
  });
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
    data: []
  });
});

app.post('/api/financials/invoices', (req, res) => {
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/financials/expenses', (req, res) => {
  res.json({
    success: true,
    data: []
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
