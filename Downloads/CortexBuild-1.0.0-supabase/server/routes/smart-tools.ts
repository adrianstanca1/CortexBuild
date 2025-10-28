// CortexBuild - Smart Tools API Routes
// Handles automation, cron jobs, and workflows

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';

export function createSmartToolsRouter(db: Database.Database): Router {
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

  // GET /api/smart-tools - List all smart tools for company
  router.get('/', getCurrentUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const tools = db.prepare(`
        SELECT * FROM smart_tools
        WHERE company_id = ?
        ORDER BY created_at DESC
      `).all(user.company_id);

      res.json({ success: true, data: tools });
    } catch (error: any) {
      console.error('List smart tools error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/smart-tools - Create new smart tool
  router.post('/', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { name, description, tool_type, schedule, config } = req.body;
      const user = (req as any).user;

      if (!name || !tool_type) {
        return res.status(400).json({ error: 'Name and tool_type are required' });
      }

      // Calculate next run time for scheduled tools
      let next_run_at = null;
      if (tool_type === 'scheduled' && schedule) {
        // Simple calculation: next hour for demo purposes
        const nextRun = new Date();
        nextRun.setHours(nextRun.getHours() + 1);
        next_run_at = nextRun.toISOString();
      }

      const result = db.prepare(`
        INSERT INTO smart_tools (company_id, name, description, tool_type, schedule, config, next_run_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        user.company_id,
        name,
        description || '',
        tool_type,
        schedule || null,
        config || '{}',
        next_run_at
      );

      const tool = db.prepare('SELECT * FROM smart_tools WHERE id = ?').get(result.lastInsertRowid);

      // Log activity
      db.prepare('INSERT INTO activities (user_id, action, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
        user.id,
        'smart_tool_create',
        `Created smart tool: ${name}`
      );

      res.json({ success: true, data: tool });
    } catch (error: any) {
      console.error('Create smart tool error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/smart-tools/:id/toggle - Toggle tool active status
  router.put('/:id/toggle', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const user = (req as any).user;

      const tool = db.prepare('SELECT * FROM smart_tools WHERE id = ? AND company_id = ?').get(id, user.company_id);
      if (!tool) {
        return res.status(404).json({ error: 'Smart tool not found' });
      }

      db.prepare('UPDATE smart_tools SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
        is_active ? 1 : 0,
        id
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error('Toggle smart tool error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/smart-tools/:id/run - Execute tool manually
  router.post('/:id/run', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const tool = db.prepare('SELECT * FROM smart_tools WHERE id = ? AND company_id = ?').get(id, user.company_id) as any;
      if (!tool) {
        return res.status(404).json({ error: 'Smart tool not found' });
      }

      // Create execution record
      const started_at = new Date().toISOString();
      const result = db.prepare(`
        INSERT INTO smart_tool_executions (tool_id, status, started_at)
        VALUES (?, ?, ?)
      `).run(tool.id, 'running', started_at);

      // Simulate execution (in production, this would run actual tool logic)
      setTimeout(() => {
        const completed_at = new Date().toISOString();
        db.prepare(`
          UPDATE smart_tool_executions
          SET status = ?, completed_at = ?, output_data = ?
          WHERE id = ?
        `).run('success', completed_at, '{"result": "Tool executed successfully"}', result.lastInsertRowid);

        // Update tool last_run_at
        db.prepare('UPDATE smart_tools SET last_run_at = ? WHERE id = ?').run(completed_at, tool.id);
      }, 1000);

      res.json({ success: true, message: 'Tool execution started' });
    } catch (error: any) {
      console.error('Run smart tool error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/smart-tools/:id - Delete smart tool
  router.delete('/:id', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const tool = db.prepare('SELECT * FROM smart_tools WHERE id = ? AND company_id = ?').get(id, user.company_id);
      if (!tool) {
        return res.status(404).json({ error: 'Smart tool not found' });
      }

      db.prepare('DELETE FROM smart_tools WHERE id = ?').run(id);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete smart tool error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/smart-tools/executions - Get recent executions
  router.get('/executions', getCurrentUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const executions = db.prepare(`
        SELECT e.* FROM smart_tool_executions e
        JOIN smart_tools t ON e.tool_id = t.id
        WHERE t.company_id = ?
        ORDER BY e.started_at DESC
        LIMIT 50
      `).all(user.company_id);

      res.json({ success: true, data: executions });
    } catch (error: any) {
      console.error('Get executions error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

