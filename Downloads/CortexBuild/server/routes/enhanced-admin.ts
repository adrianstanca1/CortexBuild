import { Router } from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '../auth';

export function createEnhancedAdminRoutes(db: Database.Database) {
  const router = Router();

  // Middleware to check super admin access
  const requireSuperAdmin = (req: any, res: any, next: any) => {
    const user = getCurrentUser(req);
    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Super admin access required' });
    }
    next();
  };

  // ============================================================================
  // DASHBOARD ANALYTICS
  // ============================================================================

  // GET /api/admin/analytics/overview - Complete dashboard overview
  router.get('/analytics/overview', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      // User statistics
      const userStats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN last_login IS NOT NULL THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 ELSE 0 END) as new_this_week
        FROM users
      `).get() as any;

      // Company statistics
      const companyStats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) as active
        FROM companies
      `).get() as any;

      // Project statistics
      const projectStats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
        FROM projects
      `).get() as any;

      // SDK statistics
      const sdkStats = db.prepare(`
        SELECT 
          COUNT(DISTINCT user_id) as developers,
          COUNT(*) as total_requests,
          SUM(tokens_used) as total_tokens,
          SUM(cost) as total_cost
        FROM ai_requests
      `).get() as any;

      // Revenue calculation (mock for now - integrate with payment system)
      const revenue = {
        total: 125000,
        monthly: 15000,
        growth: 12.5
      };

      // System health (mock - integrate with actual monitoring)
      const system = {
        uptime: 99.9,
        cpu: Math.floor(Math.random() * 30) + 30, // 30-60%
        memory: Math.floor(Math.random() * 30) + 50, // 50-80%
        storage: Math.floor(Math.random() * 20) + 30 // 30-50%
      };

      res.json({
        success: true,
        data: {
          users: userStats,
          companies: companyStats,
          projects: projectStats,
          sdk: sdkStats,
          revenue,
          system
        }
      });
    } catch (error: any) {
      console.error('Analytics overview error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  // GET /api/admin/users/detailed - Get detailed user list with stats
  router.get('/users/detailed', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      const users = db.prepare(`
        SELECT 
          u.id,
          u.email,
          u.name,
          u.role,
          u.company_id,
          c.name as company_name,
          u.created_at,
          u.last_login,
          (SELECT COUNT(*) FROM projects WHERE created_by = u.id) as project_count,
          (SELECT COUNT(*) FROM ai_requests WHERE user_id = u.id) as api_requests,
          (SELECT SUM(cost) FROM ai_requests WHERE user_id = u.id) as total_cost
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        ORDER BY u.created_at DESC
      `).all();

      res.json({ success: true, data: users });
    } catch (error: any) {
      console.error('Get detailed users error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/admin/users/create - Create new user
  router.post('/users/create', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      const { email, name, password, role, company_id } = req.body;

      // Validate required fields
      if (!email || !name || !password || !role) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Check if user already exists
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }

      // Hash password (using bcrypt in production)
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create user
      const result = db.prepare(`
        INSERT INTO users (email, name, password, role, company_id, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).run(email, name, hashedPassword, role, company_id || null);

      res.json({
        success: true,
        data: { id: result.lastInsertRowid, email, name, role }
      });
    } catch (error: any) {
      console.error('Create user error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PATCH /api/admin/users/:id - Update user
  router.patch('/users/:id', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, company_id, active } = req.body;

      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (email !== undefined) {
        updates.push('email = ?');
        values.push(email);
      }
      if (role !== undefined) {
        updates.push('role = ?');
        values.push(role);
      }
      if (company_id !== undefined) {
        updates.push('company_id = ?');
        values.push(company_id);
      }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }

      values.push(id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

      res.json({ success: true, message: 'User updated successfully' });
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/admin/users/:id - Delete user
  router.delete('/users/:id', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      const { id } = req.params;
      
      // Don't allow deleting yourself
      const currentUser = getCurrentUser(req);
      if (currentUser.id === parseInt(id)) {
        return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
      }

      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // COMPANY MANAGEMENT
  // ============================================================================

  // GET /api/admin/companies/detailed - Get detailed company list
  router.get('/companies/detailed', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      const companies = db.prepare(`
        SELECT 
          c.id,
          c.name,
          c.created_at,
          COUNT(DISTINCT u.id) as user_count,
          COUNT(DISTINCT p.id) as project_count,
          SUM(CASE WHEN u.last_login > datetime('now', '-30 days') THEN 1 ELSE 0 END) as active_users
        FROM companies c
        LEFT JOIN users u ON c.id = u.company_id
        LEFT JOIN projects p ON c.id = p.company_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `).all();

      res.json({ success: true, data: companies });
    } catch (error: any) {
      console.error('Get detailed companies error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/admin/companies/create - Create new company
  router.post('/companies/create', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      const { name, industry, size } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Company name is required' });
      }

      const result = db.prepare(`
        INSERT INTO companies (name, created_at)
        VALUES (?, datetime('now'))
      `).run(name);

      res.json({
        success: true,
        data: { id: result.lastInsertRowid, name }
      });
    } catch (error: any) {
      console.error('Create company error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // SDK PLATFORM MANAGEMENT
  // ============================================================================

  // GET /api/admin/sdk/detailed-usage - Detailed SDK usage analytics
  router.get('/sdk/detailed-usage', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      const { timeRange = '30d' } = req.query;

      let dateFilter = "datetime('now', '-30 days')";
      if (timeRange === '7d') dateFilter = "datetime('now', '-7 days')";
      if (timeRange === '24h') dateFilter = "datetime('now', '-1 day')";

      // Usage by user
      const userUsage = db.prepare(`
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(ar.id) as request_count,
          SUM(ar.tokens_used) as total_tokens,
          SUM(ar.cost) as total_cost,
          ar.model,
          MAX(ar.created_at) as last_request
        FROM users u
        INNER JOIN ai_requests ar ON u.id = ar.user_id
        WHERE ar.created_at > ${dateFilter}
        GROUP BY u.id, ar.model
        ORDER BY total_cost DESC
        LIMIT 50
      `).all();

      // Usage by model
      const modelUsage = db.prepare(`
        SELECT 
          model,
          COUNT(*) as request_count,
          SUM(tokens_used) as total_tokens,
          SUM(cost) as total_cost,
          AVG(cost) as avg_cost
        FROM ai_requests
        WHERE created_at > ${dateFilter}
        GROUP BY model
        ORDER BY total_cost DESC
      `).all();

      // Daily usage trend
      const dailyTrend = db.prepare(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as requests,
          SUM(tokens_used) as tokens,
          SUM(cost) as cost
        FROM ai_requests
        WHERE created_at > ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `).all();

      res.json({
        success: true,
        data: {
          userUsage,
          modelUsage,
          dailyTrend
        }
      });
    } catch (error: any) {
      console.error('SDK detailed usage error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/admin/sdk/grant-access - Grant SDK access to user
  router.post('/sdk/grant-access', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      const { userId, tier } = req.body;

      if (!userId || !tier) {
        return res.status(400).json({ success: false, error: 'User ID and tier are required' });
      }

      // Check if user exists
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Create or update SDK developer record
      const existing = db.prepare('SELECT id FROM sdk_developers WHERE user_id = ?').get(userId);
      
      if (existing) {
        db.prepare(`
          UPDATE sdk_developers 
          SET subscription_tier = ?, updated_at = datetime('now')
          WHERE user_id = ?
        `).run(tier, userId);
      } else {
        db.prepare(`
          INSERT INTO sdk_developers (user_id, subscription_tier, created_at)
          VALUES (?, ?, datetime('now'))
        `).run(userId, tier);
      }

      res.json({ success: true, message: 'SDK access granted successfully' });
    } catch (error: any) {
      console.error('Grant SDK access error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // SYSTEM MONITORING
  // ============================================================================

  // GET /api/admin/system/health - System health check
  router.get('/system/health', getCurrentUser, requireSuperAdmin, (req, res) => {
    try {
      const dbSize = db.prepare("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").get() as any;
      const tableCount = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get() as any;

      res.json({
        success: true,
        data: {
          database: {
            size: dbSize.size,
            tables: tableCount.count,
            healthy: true
          },
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('System health error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

