// CortexBuild - Widget & Dashboard API Routes
// Handles custom dashboards and widget management

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';

export function createWidgetsRouter(db: Database.Database): Router {
  const router = Router();

  // Middleware to get current user
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

  // GET /api/widgets/dashboards - Get user's dashboards
  router.get('/dashboards', getCurrentUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const dashboards = db.prepare(`
        SELECT * FROM user_dashboards
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC
      `).all(user.id);

      res.json({ success: true, data: dashboards });
    } catch (error: any) {
      console.error('Get dashboards error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/widgets/dashboards - Create new dashboard
  router.post('/dashboards', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { name, layout, is_default } = req.body;
      const user = (req as any).user;

      if (!name) {
        return res.status(400).json({ error: 'Dashboard name is required' });
      }

      // If setting as default, unset other defaults
      if (is_default) {
        db.prepare('UPDATE user_dashboards SET is_default = 0 WHERE user_id = ?').run(user.id);
      }

      const result = db.prepare(`
        INSERT INTO user_dashboards (user_id, name, layout, is_default)
        VALUES (?, ?, ?, ?)
      `).run(user.id, name, layout || '[]', is_default ? 1 : 0);

      const dashboard = db.prepare('SELECT * FROM user_dashboards WHERE id = ?').get(result.lastInsertRowid);

      res.json({ success: true, data: dashboard });
    } catch (error: any) {
      console.error('Create dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/widgets/dashboards/:id - Update dashboard
  router.put('/dashboards/:id', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, layout, is_default } = req.body;
      const user = (req as any).user;

      const dashboard = db.prepare('SELECT * FROM user_dashboards WHERE id = ? AND user_id = ?').get(id, user.id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      const updates: string[] = [];
      const params: any[] = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
      }
      if (layout !== undefined) {
        updates.push('layout = ?');
        params.push(layout);
      }
      if (is_default !== undefined) {
        if (is_default) {
          db.prepare('UPDATE user_dashboards SET is_default = 0 WHERE user_id = ?').run(user.id);
        }
        updates.push('is_default = ?');
        params.push(is_default ? 1 : 0);
      }

      if (updates.length > 0) {
        params.push(id);
        db.prepare(`UPDATE user_dashboards SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);
      }

      const updated = db.prepare('SELECT * FROM user_dashboards WHERE id = ?').get(id);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('Update dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/widgets/dashboards/:id - Delete dashboard
  router.delete('/dashboards/:id', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const dashboard = db.prepare('SELECT * FROM user_dashboards WHERE id = ? AND user_id = ?').get(id, user.id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      db.prepare('DELETE FROM user_dashboards WHERE id = ?').run(id);

      res.json({ success: true, message: 'Dashboard deleted' });
    } catch (error: any) {
      console.error('Delete dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/widgets/dashboard/:id/widgets - Get widgets for a dashboard
  router.get('/dashboard/:id/widgets', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Verify dashboard belongs to user
      const dashboard = db.prepare('SELECT * FROM user_dashboards WHERE id = ? AND user_id = ?').get(id, user.id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      const widgets = db.prepare(`
        SELECT dw.*, m.name as module_name
        FROM dashboard_widgets dw
        LEFT JOIN modules m ON dw.module_id = m.id
        WHERE dw.dashboard_id = ?
        ORDER BY dw.position_y, dw.position_x
      `).all(id);

      res.json({ success: true, data: widgets });
    } catch (error: any) {
      console.error('Get widgets error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/widgets/add - Add widget to dashboard
  router.post('/add', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { dashboard_id, widget_type, module_id, title, config, position_x, position_y, width, height } = req.body;
      const user = (req as any).user;

      // Verify dashboard belongs to user
      const dashboard = db.prepare('SELECT * FROM user_dashboards WHERE id = ? AND user_id = ?').get(dashboard_id, user.id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      const result = db.prepare(`
        INSERT INTO dashboard_widgets (dashboard_id, widget_type, module_id, title, config, position_x, position_y, width, height)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        dashboard_id,
        widget_type,
        module_id || null,
        title,
        config || '{}',
        position_x || 0,
        position_y || 0,
        width || 4,
        height || 2
      );

      const widget = db.prepare('SELECT * FROM dashboard_widgets WHERE id = ?').get(result.lastInsertRowid);

      res.json({ success: true, data: widget });
    } catch (error: any) {
      console.error('Add widget error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/widgets/:id - Update widget
  router.put('/:id', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, config, position_x, position_y, width, height, is_visible } = req.body;
      const user = (req as any).user;

      // Verify widget belongs to user's dashboard
      const widget = db.prepare(`
        SELECT dw.* FROM dashboard_widgets dw
        JOIN user_dashboards ud ON dw.dashboard_id = ud.id
        WHERE dw.id = ? AND ud.user_id = ?
      `).get(id, user.id);

      if (!widget) {
        return res.status(404).json({ error: 'Widget not found' });
      }

      const updates: string[] = [];
      const params: any[] = [];

      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (config !== undefined) {
        updates.push('config = ?');
        params.push(config);
      }
      if (position_x !== undefined) {
        updates.push('position_x = ?');
        params.push(position_x);
      }
      if (position_y !== undefined) {
        updates.push('position_y = ?');
        params.push(position_y);
      }
      if (width !== undefined) {
        updates.push('width = ?');
        params.push(width);
      }
      if (height !== undefined) {
        updates.push('height = ?');
        params.push(height);
      }
      if (is_visible !== undefined) {
        updates.push('is_visible = ?');
        params.push(is_visible ? 1 : 0);
      }

      if (updates.length > 0) {
        params.push(id);
        db.prepare(`UPDATE dashboard_widgets SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);
      }

      const updated = db.prepare('SELECT * FROM dashboard_widgets WHERE id = ?').get(id);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('Update widget error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/widgets/:id - Remove widget
  router.delete('/:id', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Verify widget belongs to user's dashboard
      const widget = db.prepare(`
        SELECT dw.* FROM dashboard_widgets dw
        JOIN user_dashboards ud ON dw.dashboard_id = ud.id
        WHERE dw.id = ? AND ud.user_id = ?
      `).get(id, user.id);

      if (!widget) {
        return res.status(404).json({ error: 'Widget not found' });
      }

      db.prepare('DELETE FROM dashboard_widgets WHERE id = ?').run(id);

      res.json({ success: true, message: 'Widget removed' });
    } catch (error: any) {
      console.error('Remove widget error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/widgets/templates - Get available widget templates
  router.get('/templates', getCurrentUser, (req: Request, res: Response) => {
    try {
      const templates = db.prepare(`
        SELECT * FROM widget_templates
        WHERE is_public = 1
        ORDER BY name
      `).all();

      res.json({ success: true, data: templates });
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

