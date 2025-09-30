const request = require('supertest');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

// Mock the managers system for testing
const mockManagers = {
  performHealthCheck: async () => ({
    overall: 'healthy',
    managers: {
      security: { status: 'healthy' },
      secrets: { status: 'healthy' },
      api: { status: 'healthy' },
      configuration: { status: 'healthy' },
      monitoring: { status: 'healthy' }
    },
    timestamp: new Date().toISOString()
  }),
  getSystemStats: () => ({
    security: { policy: 'active' },
    secrets: { cacheStats: { hits: 100, misses: 10 } },
    api: { stats: { requests: 1000, errors: 5 } },
    configuration: { stats: { totalConfigurations: 50 } },
    monitoring: { stats: { totalLogs: 5000 } },
    integration: {
      uptime: process.uptime(),
      version: '1.0.0',
      environment: 'test'
    }
  }),
  config: {
    getEnvironmentConfig: async () => ({
      app_name: 'ASAgents Platform',
      app_version: '1.0.0',
      api_timeout: 30000
    })
  },
  api: {
    securityHeadersMiddleware: () => (req, res, next) => next(),
    authenticationMiddleware: () => (req, res, next) => {
      req.user = { sub: 1, tenant_id: 1, role: 'admin' };
      next();
    },
    rateLimitMiddleware: () => (req, res, next) => next(),
    responseFormattingMiddleware: () => (req, res, next) => next()
  },
  monitoring: {
    info: () => {},
    recordMetric: () => {}
  },
  shutdown: async () => {}
};

// Import the app after setting up mocks
let app;

beforeAll(async () => {
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_USER = 'test';
  process.env.DB_PASSWORD = 'test';
  process.env.DB_NAME = 'test_db';
  process.env.JWT_ACCESS_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  
  // Mock the managers integration
  jest.doMock('../src/services/managers/ManagersIntegration.js', () => ({
    ManagersIntegration: {
      initialize: async () => mockManagers
    }
  }));
  
  // Mock the database
  jest.doMock('../src/services/db.js', () => ({
    pool: {
      query: jest.fn().mockResolvedValue([[]]),
      execute: jest.fn().mockResolvedValue([{ insertId: 1, affectedRows: 1 }])
    },
    healthCheck: jest.fn().mockResolvedValue(true)
  }));
  
  // Import the app after mocking
  const { default: appModule } = await import('../src/index.js');
  app = appModule;
  
  // Wait a bit for initialization
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  // Clean up
  jest.clearAllMocks();
});

describe('Enhanced Backend API Tests', () => {
  describe('System Health Endpoints', () => {
    test('GET /api/system/health should return system health', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('managers');
      expect(response.body).toHaveProperty('timestamp');
    });
    
    test('GET /api/system/health/detailed should return detailed health info', async () => {
      const response = await request(app)
        .get('/api/system/health/detailed')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('managers');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('stats');
    });
    
    test('GET /api/system/metrics should return system metrics', async () => {
      const response = await request(app)
        .get('/api/system/metrics')
        .expect(200);
      
      expect(response.body).toHaveProperty('health');
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('timestamp');
    });
    
    test('GET /api/system/config should return system configuration', async () => {
      const response = await request(app)
        .get('/api/system/config')
        .expect(200);
      
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('config');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
  
  describe('Dashboard Endpoints', () => {
    test('GET /api/dashboard/snapshot should return dashboard data', async () => {
      const response = await request(app)
        .get('/api/dashboard/snapshot')
        .expect(200);
      
      expect(response.body).toHaveProperty('projects');
      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('expenses');
      expect(response.body).toHaveProperty('team');
      expect(response.body).toHaveProperty('portfolioSummary');
      expect(response.body).toHaveProperty('operationalInsights');
      expect(response.body).toHaveProperty('metadata');
    });
    
    test('GET /api/dashboard/stats/projects should return project statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats/projects')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('GET /api/dashboard/stats/tasks should return task statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats/tasks')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('GET /api/dashboard/stats/financial should return financial overview', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats/financial')
        .expect(200);
      
      expect(response.body).toHaveProperty('budgets');
      expect(response.body).toHaveProperty('expenses');
    });
  });
  
  describe('User Management Endpoints', () => {
    test('GET /api/users should return users list', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('POST /api/users should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'worker'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });
    
    test('GET /api/users/:id should return specific user', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);
      
      expect(response.body).toHaveProperty('id');
    });
    
    test('PUT /api/users/:id should update user', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      
      const response = await request(app)
        .put('/api/users/1')
        .send(updateData)
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('Notifications Endpoints', () => {
    test('GET /api/notifications should return notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('GET /api/notifications/unread-count should return unread count', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .expect(200);
      
      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });
    
    test('POST /api/notifications should create notification', async () => {
      const notificationData = {
        userId: 1,
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification'
      };
      
      const response = await request(app)
        .post('/api/notifications')
        .send(notificationData)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });
    
    test('PATCH /api/notifications/:id/read should mark notification as read', async () => {
      const response = await request(app)
        .patch('/api/notifications/1/read')
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
    });
    
    test('GET /api/notifications/preferences should return preferences', async () => {
      const response = await request(app)
        .get('/api/notifications/preferences')
        .expect(200);
      
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('push');
      expect(response.body).toHaveProperty('inApp');
    });
  });
  
  describe('Enhanced Task Endpoints', () => {
    test('GET /api/tasks should return tasks with enhanced data', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('GET /api/tasks with filters should work', async () => {
      const response = await request(app)
        .get('/api/tasks?status=in_progress&priority=high')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('POST /api/tasks should create task with enhanced fields', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        status: 'todo',
        priority: 'medium',
        estimatedHours: 8,
        tags: ['test', 'backend']
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('Enhanced Project Endpoints', () => {
    test('GET /api/projects should return projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('POST /api/projects should create project', async () => {
      const projectData = {
        code: 'TEST001',
        name: 'Test Project',
        description: 'Test project description',
        budget: 50000,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };
      
      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
    });
  });
  
  describe('Security and Middleware', () => {
    test('Should include security headers', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .expect(200);
      
      // Check for common security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
    
    test('Should handle authentication properly', async () => {
      // This test verifies that our mock authentication is working
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('Should handle rate limiting gracefully', async () => {
      // Make multiple requests to test rate limiting middleware
      const promises = Array(5).fill().map(() => 
        request(app).get('/api/system/health')
      );
      
      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });
});
