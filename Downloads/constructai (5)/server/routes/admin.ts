import { Router } from 'express';
import type Database from 'better-sqlite3';

export function createAdminRouter(db: Database.Database) {
  const router = Router();

  // Get all users (admin only)
  router.get('/users', (req, res) => {
    try {
      const users = db.prepare(`
        SELECT id, email, name, role, company_id, created_at
        FROM users
        ORDER BY created_at DESC
      `).all();
      
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Get all companies (admin only)
  router.get('/companies', (req, res) => {
    try {
      const companies = db.prepare(`
        SELECT id, name, created_at
        FROM companies
        ORDER BY created_at DESC
      `).all();
      
      res.json(companies);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  });

  // Get system stats (admin only)
  router.get('/stats', (req, res) => {
    try {
      const stats = {
        totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number },
        totalCompanies: db.prepare('SELECT COUNT(*) as count FROM companies').get() as { count: number },
        activeSessions: db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > datetime("now")').get() as { count: number }
      };
      
      res.json({
        users: stats.totalUsers.count,
        companies: stats.totalCompanies.count,
        activeSessions: stats.activeSessions.count
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  return router;
}

