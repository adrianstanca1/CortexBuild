// Simple API Server for Testing Authentication
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { AuthMiddleware, authHelpers } = require('./middleware/auth.cjs');

const app = express();
const PORT = 3001;

// Initialize authentication middleware
const auth = new AuthMiddleware();

// Basic middleware with enhanced CSP
app.use(helmet({
  frameguard: { action: 'deny' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https:",
        "wss:",
        "https://*.supabase.co",
        "https://api.openai.com",
        "https://generativelanguage.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https:",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Add XSS protection manually since Helmet deprecated it
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
app.use(cors({
  origin: [
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:4173',  // Production preview server
    'http://localhost:3000',  // Alternative frontend port
    'http://192.168.1.140:4173' // Network access
  ],
  credentials: true
}));
app.use(express.json());

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CortexBuild API Server (Simple)'
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    const user = authHelpers.findUserByEmail(email);
    console.log('User lookup result:', user ? 'found' : 'not found');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const isValidPassword = authHelpers.validatePassword(password, user.password);
    console.log('Password validation:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const token = auth.generateToken(user);
    console.log('Token generated successfully');
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test protected endpoint
app.get('/api/test-protected', auth.requireUser(), (req, res) => {
  res.json({
    success: true,
    message: 'Protected endpoint accessed successfully',
    user: req.user
  });
});

// Chat endpoints (protected)
app.get('/api/chat/message', auth.authenticate(), auth.requireUser(), (req, res) => {
  res.json({
    success: true,
    messages: [],
    user: req.user.email
  });
});

app.post('/api/chat/message', auth.authenticate(), auth.requireUser(), (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 1000 characters)'
      });
    }

    // Simulate message processing
    const response = {
      success: true,
      message: {
        id: `msg-${Date.now()}`,
        content: message,
        timestamp: new Date().toISOString(),
        user: req.user.email
      }
    };

    res.json(response);
  } catch (err) {
    console.error('Error in handler:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Dashboard endpoints (protected)
app.get('/api/dashboard/stats', auth.authenticate(), auth.requireUser(), (req, res) => {
  res.json({
    success: true,
    stats: {
      totalProjects: 12,
      activeProjects: 8,
      completedProjects: 4,
      totalTasks: 156,
      completedTasks: 89,
      pendingTasks: 67,
      totalUsers: 24,
      activeUsers: 18,
      totalRevenue: 2450000,
      monthlyRevenue: 245000
    },
    user: req.user.email
  });
});

app.get('/api/dashboard/projects', auth.authenticate(), auth.requireUser(), (req, res) => {
  res.json({
    success: true,
    projects: [
      {
        id: 1,
        name: "Office Complex Alpha",
        status: "active",
        progress: 75,
        budget: 2500000,
        spent: 1875000,
        deadline: "2025-03-15"
      },
      {
        id: 2,
        name: "Residential Tower Beta",
        status: "active",
        progress: 45,
        budget: 3200000,
        spent: 1440000,
        deadline: "2025-06-30"
      },
      {
        id: 3,
        name: "Shopping Center Gamma",
        status: "planning",
        progress: 15,
        budget: 1800000,
        spent: 270000,
        deadline: "2025-09-20"
      }
    ],
    user: req.user.email
  });
});

app.get('/api/dashboard/tasks', auth.authenticate(), auth.requireUser(), (req, res) => {
  res.json({
    success: true,
    tasks: [
      {
        id: 1,
        title: "Foundation Inspection",
        project: "Office Complex Alpha",
        status: "pending",
        priority: "high",
        dueDate: "2025-01-20"
      },
      {
        id: 2,
        title: "Electrical Wiring Review",
        project: "Residential Tower Beta",
        status: "in-progress",
        priority: "medium",
        dueDate: "2025-01-25"
      },
      {
        id: 3,
        title: "Material Procurement",
        project: "Shopping Center Gamma",
        status: "completed",
        priority: "low",
        dueDate: "2025-01-15"
      }
    ],
    user: req.user.email
  });
});

// Platform admin endpoint (admin only)
app.get('/api/platformAdmin', auth.authenticate(), auth.requireAdmin(), (req, res) => {
  res.json({
    success: true,
    message: 'Platform Admin API accessed',
    user: req.user.email
  });
});

app.post('/api/platformAdmin', auth.authenticate(), auth.requireAdmin(), (req, res) => {
  res.json({
    success: true,
    message: 'Platform Admin POST endpoint',
    data: req.body,
    user: req.user.email
  });
});

// User profile endpoints
app.get('/api/user/profile', auth.authenticate(), auth.requireUser(), (req, res) => {
  res.json({
    success: true,
    profile: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name || 'Demo User',
      role: req.user.role,
      avatar: null,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    }
  });
});

app.put('/api/user/profile', auth.authenticate(), auth.requireUser(), (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully',
    profile: {
      ...req.body,
      id: req.user.id,
      email: req.user.email
    }
  });
});

// Admin user management endpoints
app.get('/api/admin/users', auth.authenticate(), auth.requireAdmin(), (req, res) => {
  res.json({
    success: true,
    users: [
      {
        id: 'demo-user-123',
        email: 'demo@cortexbuild.com',
        name: 'Demo User',
        role: 'admin',
        status: 'active',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'user-456',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user',
        status: 'active',
        lastLogin: '2025-01-16T10:30:00Z'
      },
      {
        id: 'user-789',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'user',
        status: 'inactive',
        lastLogin: '2025-01-10T14:20:00Z'
      }
    ]
  });
});

// Error handling middleware
app.use((error, req, res) => {
  console.error('Server error:', error);

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`?? Simple API Server running on http://localhost:${PORT}`);
  console.log(`?? Health check: http://localhost:${PORT}/api/health`);
  console.log(`?? Login: POST http://localhost:${PORT}/api/auth/login`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n?? Shutting down server...');
  process.exit(0);
});
