// CortexBuild Platform - Super Admin API Routes
// Version: 2.0.0 MULTI-TENANT + ADVANCED FEATURES
// Super Admin: adrian.stanca1@gmail.com

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export function createAdminRouter(db: Database.Database): Router {
  const router = Router();

  // Middleware to check super_admin role
  const requireSuperAdmin = (req: any, res: Response, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as any;
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden - Super Admin only' });
    }

    req.user = user;
    next();
  };

  // GET /api/admin/dashboard - Super Admin Dashboard Stats
  router.get('/dashboard', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const stats = {
        totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get() as any,
        totalCompanies: db.prepare('SELECT COUNT(*) as count FROM companies').get() as any,
        totalProjects: db.prepare('SELECT COUNT(*) as count FROM projects').get() as any,
        totalClients: db.prepare('SELECT COUNT(*) as count FROM clients').get() as any,
        activeUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get() as any,
        recentActivity: db.prepare('SELECT * FROM activities ORDER BY created_at DESC LIMIT 10').all()
      };

      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/users - List all users (Super Admin)
  router.get('/users', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const { page = '1', limit = '50', search, company_id, role } = req.query;
      
      let query = 'SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id WHERE 1=1';
      const params: any[] = [];

      if (search) {
        query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (company_id) {
        query += ' AND u.company_id = ?';
        params.push(company_id);
      }

      if (role) {
        query += ' AND u.role = ?';
        params.push(role);
      }

      query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      params.push(limitNum, (pageNum - 1) * limitNum);

      const users = db.prepare(query).all(...params);
      const total = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;

      res.json({
        success: true,
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total.count,
          totalPages: Math.ceil(total.count / limitNum)
        }
      });
    } catch (error: any) {
      console.error('List users error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/admin/users - Create new user (Super Admin)
  router.post('/users', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const { email, password, name, role, company_id } = req.body;

      if (!email || !password || !name || !role || !company_id) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const userId = uuidv4();
      const passwordHash = bcrypt.hashSync(password, 10);

      db.prepare('INSERT INTO users (id, email, password_hash, name, role, company_id, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)').run(
        userId, email, passwordHash, name, role, company_id
      );

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      // Log activity
      db.prepare('INSERT INTO activities (user_id, action, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
        (req as any).user.id,
        'create',
        `Created user: ${email}`
      );

      res.json({ success: true, data: user });
    } catch (error: any) {
      console.error('Create user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/admin/users/:id - Update user (Super Admin)
  router.put('/users/:id', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, role, company_id, is_active, password } = req.body;

      const updates: string[] = [];
      const params: any[] = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
      }
      if (role !== undefined) {
        updates.push('role = ?');
        params.push(role);
      }
      if (company_id !== undefined) {
        updates.push('company_id = ?');
        params.push(company_id);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(is_active ? 1 : 0);
      }
      if (password) {
        updates.push('password_hash = ?');
        params.push(bcrypt.hashSync(password, 10));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      params.push(id);
      db.prepare(`UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

      // Log activity
      db.prepare('INSERT INTO activities (user_id, action, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
        (req as any).user.id,
        'update',
        `Updated user: ${id}`
      );

      res.json({ success: true, data: user });
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/admin/users/:id - Delete user (Super Admin)
  router.delete('/users/:id', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = db.prepare('SELECT role FROM users WHERE id = ?').get(id) as any;
      if (user && user.role === 'super_admin') {
        return res.status(403).json({ error: 'Cannot delete super admin' });
      }

      db.prepare('DELETE FROM users WHERE id = ?').run(id);

      // Log activity
      db.prepare('INSERT INTO activities (user_id, action, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
        (req as any).user.id,
        'delete',
        `Deleted user: ${id}`
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/companies - List all companies (Super Admin)
  router.get('/companies', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const companies = db.prepare(`
        SELECT c.*, 
          (SELECT COUNT(*) FROM users WHERE company_id = c.id) as user_count,
          (SELECT COUNT(*) FROM projects WHERE company_id = c.id) as project_count
        FROM companies c
        ORDER BY c.created_at DESC
      `).all();

      res.json({ success: true, data: companies });
    } catch (error: any) {
      console.error('List companies error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/admin/companies - Create new company (Super Admin)
  router.post('/companies', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        website,
        industry = 'construction',
        subscription_plan = 'free',
        max_users = 5,
        max_projects = 10
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Company name and email are required' });
      }

      const companyId = `company-${uuidv4()}`;

      // Check if companies table has the new columns, if not, use basic insert
      try {
        db.prepare(`INSERT INTO companies (
          id, name, email, phone, address, website, industry,
          subscription_plan, max_users, max_projects
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          companyId, name, email, phone || null, address || null,
          website || null, industry, subscription_plan, max_users, max_projects
        );
      } catch (err) {
        // Fallback to basic insert if columns don't exist
        db.prepare('INSERT INTO companies (id, name, subscription_plan, max_users, max_projects) VALUES (?, ?, ?, ?, ?)').run(
          companyId, name, subscription_plan, max_users, max_projects
        );
      }

      const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);

      // Log activity
      db.prepare('INSERT INTO activities (user_id, action, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
        (req as any).user.id,
        'create',
        `Created company: ${name}`
      );

      res.json({ success: true, data: company });
    } catch (error: any) {
      console.error('Create company error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/admin/companies/:id - Update company (Super Admin)
  router.put('/companies/:id', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, subscription_plan, max_users, max_projects, is_active } = req.body;

      const updates: string[] = [];
      const params: any[] = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
      }
      if (subscription_plan !== undefined) {
        updates.push('subscription_plan = ?');
        params.push(subscription_plan);
      }
      if (max_users !== undefined) {
        updates.push('max_users = ?');
        params.push(max_users);
      }
      if (max_projects !== undefined) {
        updates.push('max_projects = ?');
        params.push(max_projects);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(is_active ? 1 : 0);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      params.push(id);
      db.prepare(`UPDATE companies SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);

      const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);

      // Log activity
      db.prepare('INSERT INTO activities (user_id, action, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
        (req as any).user.id,
        'update',
        `Updated company: ${id}`
      );

      res.json({ success: true, data: company });
    } catch (error: any) {
      console.error('Update company error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/admin/companies/:id - Delete company (Super Admin)
  router.delete('/companies/:id', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if company has users
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE company_id = ?').get(id) as any;
      if (userCount && userCount.count > 0) {
        return res.status(400).json({
          error: `Cannot delete company with ${userCount.count} users. Please reassign or delete users first.`
        });
      }

      db.prepare('DELETE FROM companies WHERE id = ?').run(id);

      // Log activity
      db.prepare('INSERT INTO activities (user_id, action, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
        (req as any).user.id,
        'delete',
        `Deleted company: ${id}`
      );

      res.json({ success: true, message: 'Company deleted successfully' });
    } catch (error: any) {
      console.error('Delete company error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/system-stats - System statistics (Super Admin)
  router.get('/system-stats', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const stats = {
        database: {
          size: '2.5 MB',
          tables: 20,
          records: db.prepare('SELECT SUM(count) as total FROM (SELECT COUNT(*) as count FROM users UNION ALL SELECT COUNT(*) FROM companies UNION ALL SELECT COUNT(*) FROM projects UNION ALL SELECT COUNT(*) FROM clients)').get() as any
        },
        performance: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        },
        activity: {
          last24h: db.prepare('SELECT COUNT(*) as count FROM activities WHERE created_at > datetime("now", "-1 day")').get() as any,
          last7d: db.prepare('SELECT COUNT(*) as count FROM activities WHERE created_at > datetime("now", "-7 days")').get() as any
        }
      };

      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('System stats error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/activity-logs - Get activity logs (Super Admin)
  router.get('/activity-logs', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const { page = '1', limit = '20', user_id, action } = req.query;
      
      let query = 'SELECT a.*, u.name as user_name, u.email as user_email FROM activities a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1';
      const params: any[] = [];

      if (user_id) {
        query += ' AND a.user_id = ?';
        params.push(user_id);
      }

      if (action) {
        query += ' AND a.action = ?';
        params.push(action);
      }

      query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      params.push(limitNum, (pageNum - 1) * limitNum);

      const logs = db.prepare(query).all(...params);
      const total = db.prepare('SELECT COUNT(*) as count FROM activities').get() as any;

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total.count,
          totalPages: Math.ceil(total.count / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Activity logs error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/analytics - Platform analytics (Super Admin)
  router.get('/analytics', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const { period = '30d' } = req.query;
      
      let daysBack = 30;
      if (period === '7d') daysBack = 7;
      if (period === '90d') daysBack = 90;

      const analytics = {
        userGrowth: db.prepare(`
          SELECT DATE(created_at) as date, COUNT(*) as count 
          FROM users 
          WHERE created_at > datetime('now', '-${daysBack} days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `).all(),
        
        companyGrowth: db.prepare(`
          SELECT DATE(created_at) as date, COUNT(*) as count 
          FROM companies 
          WHERE created_at > datetime('now', '-${daysBack} days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `).all(),
        
        projectGrowth: db.prepare(`
          SELECT DATE(created_at) as date, COUNT(*) as count 
          FROM projects 
          WHERE created_at > datetime('now', '-${daysBack} days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `).all(),
        
        topCompanies: db.prepare(`
          SELECT c.name, c.subscription_plan,
            (SELECT COUNT(*) FROM users WHERE company_id = c.id) as user_count,
            (SELECT COUNT(*) FROM projects WHERE company_id = c.id) as project_count
          FROM companies c
          ORDER BY user_count DESC, project_count DESC
          LIMIT 10
        `).all(),
        
        subscriptionDistribution: db.prepare(`
          SELECT subscription_plan, COUNT(*) as count
          FROM companies
          GROUP BY subscription_plan
        `).all(),
        
        roleDistribution: db.prepare(`
          SELECT role, COUNT(*) as count
          FROM users
          GROUP BY role
        `).all()
      };

      res.json({ success: true, data: analytics });
    } catch (error: any) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
