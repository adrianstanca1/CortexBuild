// CortexBuild - Module Marketplace API Routes
// Handles module browsing, installation, and management

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';

export function createMarketplaceRouter(db: Database.Database): Router {
  const router = Router();

  // Middleware to get current user from token
  const getCurrentUser = (req: any, res: Response, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as any;
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  };

  // GET /api/marketplace/modules - Browse available modules
  router.get('/modules', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { category, search, sort = 'downloads' } = req.query;
      
      let query = `
        SELECT m.*, mc.name as category_name, mc.icon as category_icon,
          (SELECT COUNT(*) FROM module_installations WHERE module_id = m.id) as install_count
        FROM modules m
        LEFT JOIN module_categories mc ON m.category = mc.slug
        WHERE m.status = 'published'
      `;
      const params: any[] = [];

      if (category) {
        query += ' AND m.category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (m.name LIKE ? OR m.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // Sorting
      if (sort === 'downloads') {
        query += ' ORDER BY m.downloads DESC';
      } else if (sort === 'rating') {
        query += ' ORDER BY m.rating DESC';
      } else if (sort === 'newest') {
        query += ' ORDER BY m.published_at DESC';
      } else {
        query += ' ORDER BY m.name ASC';
      }

      const modules = db.prepare(query).all(...params);

      res.json({ success: true, data: modules });
    } catch (error: any) {
      console.error('Browse modules error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/marketplace/categories - Get all categories
  router.get('/categories', getCurrentUser, (req: Request, res: Response) => {
    try {
      const categories = db.prepare(`
        SELECT mc.*, COUNT(m.id) as module_count
        FROM module_categories mc
        LEFT JOIN modules m ON mc.slug = m.category AND m.status = 'published'
        GROUP BY mc.id
        ORDER BY mc.sort_order
      `).all();

      res.json({ success: true, data: categories });
    } catch (error: any) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/marketplace/modules/:id - Get module details
  router.get('/modules/:id', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const module = db.prepare(`
        SELECT m.*, mc.name as category_name,
          (SELECT COUNT(*) FROM module_installations WHERE module_id = m.id) as install_count,
          (SELECT COUNT(*) FROM module_reviews WHERE module_id = m.id) as review_count
        FROM modules m
        LEFT JOIN module_categories mc ON m.category = mc.slug
        WHERE m.id = ? AND m.status = 'published'
      `).get(id);

      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      // Get reviews
      const reviews = db.prepare(`
        SELECT mr.*, u.name as user_name, u.email as user_email
        FROM module_reviews mr
        LEFT JOIN users u ON mr.user_id = u.id
        WHERE mr.module_id = ?
        ORDER BY mr.created_at DESC
        LIMIT 10
      `).all(id);

      // Get dependencies
      const dependencies = db.prepare(`
        SELECT md.*, m.name as module_name, m.version as current_version
        FROM module_dependencies md
        LEFT JOIN modules m ON md.depends_on_module_id = m.id
        WHERE md.module_id = ?
      `).all(id);

      res.json({ 
        success: true, 
        data: { 
          ...module, 
          reviews, 
          dependencies 
        } 
      });
    } catch (error: any) {
      console.error('Get module details error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/marketplace/install - Install a module
  router.post('/install', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { module_id } = req.body;
      const user = (req as any).user;

      if (!module_id) {
        return res.status(400).json({ error: 'Module ID is required' });
      }

      // Check if module exists and is published
      const module = db.prepare('SELECT * FROM modules WHERE id = ? AND status = ?').get(module_id, 'published') as any;
      if (!module) {
        return res.status(404).json({ error: 'Module not found or not available' });
      }

      // Check if already installed
      const existing = db.prepare('SELECT id FROM module_installations WHERE company_id = ? AND module_id = ?').get(user.company_id, module_id);
      if (existing) {
        return res.status(400).json({ error: 'Module already installed' });
      }

      // Check subscription limits (example: free plan = 5 modules max)
      const company = db.prepare('SELECT subscription_plan FROM companies WHERE id = ?').get(user.company_id) as any;
      const installedCount = db.prepare('SELECT COUNT(*) as count FROM module_installations WHERE company_id = ?').get(user.company_id) as any;
      
      const limits: any = {
        'free': 5,
        'starter': 15,
        'pro': 999,
        'enterprise': 999
      };

      if (installedCount.count >= limits[company.subscription_plan || 'free']) {
        return res.status(403).json({ error: 'Module installation limit reached. Upgrade your plan.' });
      }

      // Install module
      db.prepare('INSERT INTO module_installations (company_id, module_id, config) VALUES (?, ?, ?)').run(
        user.company_id,
        module_id,
        '{}'
      );

      // Increment download count
      db.prepare('UPDATE modules SET downloads = downloads + 1 WHERE id = ?').run(module_id);

      // Log activity
      db.prepare('INSERT INTO activities (user_id, action, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
        user.id,
        'module_install',
        `Installed module: ${module.name}`
      );

      res.json({ success: true, message: 'Module installed successfully' });
    } catch (error: any) {
      console.error('Install module error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/marketplace/uninstall/:module_id - Uninstall a module
  router.delete('/uninstall/:module_id', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { module_id } = req.params;
      const user = (req as any).user;

      const installation = db.prepare('SELECT * FROM module_installations WHERE company_id = ? AND module_id = ?').get(user.company_id, module_id) as any;
      if (!installation) {
        return res.status(404).json({ error: 'Module not installed' });
      }

      // Delete installation
      db.prepare('DELETE FROM module_installations WHERE company_id = ? AND module_id = ?').run(user.company_id, module_id);

      // Log activity
      const module = db.prepare('SELECT name FROM modules WHERE id = ?').get(module_id) as any;
      db.prepare('INSERT INTO activities (user_id, action, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
        user.id,
        'module_uninstall',
        `Uninstalled module: ${module?.name || module_id}`
      );

      res.json({ success: true, message: 'Module uninstalled successfully' });
    } catch (error: any) {
      console.error('Uninstall module error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/marketplace/installed - Get installed modules for current company
  router.get('/installed', getCurrentUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const installed = db.prepare(`
        SELECT mi.*, m.name, m.description, m.version, m.category, mc.name as category_name
        FROM module_installations mi
        LEFT JOIN modules m ON mi.module_id = m.id
        LEFT JOIN module_categories mc ON m.category = mc.slug
        WHERE mi.company_id = ?
        ORDER BY mi.installed_at DESC
      `).all(user.company_id);

      res.json({ success: true, data: installed });
    } catch (error: any) {
      console.error('Get installed modules error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/marketplace/configure/:module_id - Configure module settings
  router.put('/configure/:module_id', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { module_id } = req.params;
      const { config } = req.body;
      const user = (req as any).user;

      const installation = db.prepare('SELECT * FROM module_installations WHERE company_id = ? AND module_id = ?').get(user.company_id, module_id);
      if (!installation) {
        return res.status(404).json({ error: 'Module not installed' });
      }

      db.prepare('UPDATE module_installations SET config = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ? AND module_id = ?').run(
        JSON.stringify(config),
        user.company_id,
        module_id
      );

      res.json({ success: true, message: 'Module configuration updated' });
    } catch (error: any) {
      console.error('Configure module error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

