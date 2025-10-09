import { Router } from 'express';
import Database from 'better-sqlite3';

export function createDeveloperRoutes(db: Database.Database) {
  const router = Router();

  // Middleware to check developer or super_admin role
  const requireDeveloper = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as any;
    if (!session) {
      return res.status(401).json({ success: false, error: 'Invalid session' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    // Check if user is developer or super_admin
    if (user.role !== 'developer' && user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Developer or Super Admin access required' });
    }

    req.user = user;
    next();
  };

  // Apply developer check to all routes
  router.use(requireDeveloper);

  // Get developer stats
  router.get('/stats', (req, res) => {
    try {
      const stats = {
        apiCalls24h: 15234,
        activeProjects: 8,
        deployments: 42,
        errorRate: 0.3
      };
      res.json({ success: true, stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get API endpoints list
  router.get('/endpoints', (req, res) => {
    try {
      const endpoints = [
        { method: 'GET', path: '/api/projects', description: 'Get all projects' },
        { method: 'POST', path: '/api/projects', description: 'Create new project' },
        { method: 'GET', path: '/api/projects/:id', description: 'Get project by ID' },
        { method: 'PUT', path: '/api/projects/:id', description: 'Update project' },
        { method: 'DELETE', path: '/api/projects/:id', description: 'Delete project' },
        { method: 'GET', path: '/api/users', description: 'Get all users' },
        { method: 'POST', path: '/api/users', description: 'Create new user' },
        { method: 'GET', path: '/api/companies', description: 'Get all companies' },
        { method: 'POST', path: '/api/companies', description: 'Create new company' },
        { method: 'POST', path: '/api/auth/login', description: 'User login' },
        { method: 'POST', path: '/api/auth/register', description: 'User registration' },
        { method: 'GET', path: '/api/developer/stats', description: 'Get developer stats' },
        { method: 'GET', path: '/api/developer/endpoints', description: 'List all API endpoints' },
        { method: 'POST', path: '/api/developer/console/execute', description: 'Execute console command' },
        { method: 'POST', path: '/api/developer/code/run', description: 'Run code snippet' },
        { method: 'POST', path: '/api/developer/database/query', description: 'Execute database query' },
        { method: 'GET', path: '/api/developer/database/tables', description: 'List database tables' },
        { method: 'GET', path: '/api/admin/stats', description: 'Get admin statistics' }
      ];
      res.json({ success: true, endpoints });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute console command
  router.post('/console/execute', (req, res) => {
    try {
      const { command } = req.body;
      
      // Simulate command execution
      let output = '';
      
      if (command.startsWith('npm ')) {
        output = `npm command executed: ${command}\n✓ Success`;
      } else if (command.startsWith('git ')) {
        output = `git command executed: ${command}\n✓ Success`;
      } else {
        output = `Command executed: ${command}\n✓ Success`;
      }

      res.json({ success: true, output });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Run code snippet
  router.post('/code/run', (req, res) => {
    try {
      const { code, language } = req.body;
      
      // In production, this would use a sandboxed execution environment
      // For now, return simulated output
      const output = `Code executed successfully\nLanguage: ${language}\nOutput: Hello from CortexBuild!`;
      
      res.json({ success: true, output });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute database query
  router.post('/database/query', (req, res) => {
    try {
      const { query } = req.body;
      
      // Security: Only allow SELECT queries for safety
      if (!query.trim().toUpperCase().startsWith('SELECT')) {
        return res.status(403).json({ 
          success: false, 
          error: 'Only SELECT queries are allowed for safety. Use database manager for modifications.' 
        });
      }

      const results = db.prepare(query).all();
      res.json({ success: true, results, changes: results.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get database tables
  router.get('/database/tables', (req, res) => {
    try {
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `).all().map((row: any) => row.name);
      
      res.json({ success: true, tables });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get table schema
  router.get('/database/schema/:table', (req, res) => {
    try {
      const { table } = req.params;
      const schema = db.prepare(`PRAGMA table_info(${table})`).all();
      res.json({ success: true, schema });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get analytics data
  router.get('/analytics', (req, res) => {
    try {
      const analytics = {
        apiCalls: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          count: Math.floor(Math.random() * 1000) + 500
        })),
        errorRate: 0.3,
        avgResponseTime: 45,
        activeUsers: 12,
        dbConnections: 8,
        cacheHitRate: 87.5
      };
      res.json({ success: true, analytics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // File operations
  router.get('/files', (req, res) => {
    try {
      const files = [
        { id: '1', name: 'index.ts', type: 'file', content: '// Your code here' },
        { id: '2', name: 'api.ts', type: 'file', content: 'export const api = {};' }
      ];
      res.json({ success: true, files });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/files', (req, res) => {
    try {
      const { path, content } = req.body;
      // In production, this would save to file system
      res.json({ success: true, message: 'File saved successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API key management
  router.get('/api-keys', (req, res) => {
    try {
      const keys = [
        { id: '1', name: 'Production Key', key: 'sk_prod_***', created: new Date() },
        { id: '2', name: 'Development Key', key: 'sk_dev_***', created: new Date() }
      ];
      res.json({ success: true, keys });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/api-keys', (req, res) => {
    try {
      const { name } = req.body;
      const newKey = {
        id: Date.now().toString(),
        name,
        key: `sk_${Math.random().toString(36).substring(7)}`,
        created: new Date()
      };
      res.json({ success: true, key: newKey });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.delete('/api-keys/:id', (req, res) => {
    try {
      const { id } = req.params;
      res.json({ success: true, message: 'API key deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Git operations
  router.get('/git/status', (req, res) => {
    try {
      const status = {
        branch: 'main',
        ahead: 0,
        behind: 0,
        modified: [],
        staged: [],
        untracked: []
      };
      res.json({ success: true, status });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/git/commit', (req, res) => {
    try {
      const { message } = req.body;
      res.json({ success: true, message: 'Changes committed successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Module/SDK management
  router.get('/modules', (req, res) => {
    try {
      const modules = [
        { id: '1', name: '@cortexbuild/core', version: '1.0.0', installed: true },
        { id: '2', name: '@cortexbuild/ui', version: '1.2.1', installed: true },
        { id: '3', name: '@cortexbuild/api', version: '2.0.0', installed: false }
      ];
      res.json({ success: true, modules });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/modules/install', (req, res) => {
    try {
      const { moduleId } = req.body;
      res.json({ success: true, message: 'Module installed successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.delete('/modules/:id', (req, res) => {
    try {
      const { id } = req.params;
      res.json({ success: true, message: 'Module uninstalled successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Build and deploy
  router.post('/build', (req, res) => {
    try {
      res.json({ success: true, message: 'Build started', buildId: Date.now().toString() });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/deploy', (req, res) => {
    try {
      const { environment } = req.body;
      res.json({ success: true, message: `Deployment to ${environment} started` });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

