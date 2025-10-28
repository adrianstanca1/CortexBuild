// CortexBuild Platform - Tasks API Routes
// Version: 1.1.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Task, ApiResponse, PaginatedResponse } from '../types';

export function createTasksRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/tasks - List all tasks
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        milestone_id,
        assigned_to,
        status,
        priority,
        search,
        page = '1',
        limit = '50'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT t.*, 
               p.name as project_name,
               m.title as milestone_title,
               u.first_name || ' ' || u.last_name as assigned_to_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN milestones m ON t.milestone_id = m.id
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (project_id) {
        query += ' AND t.project_id = ?';
        params.push(parseInt(project_id));
      }

      if (milestone_id) {
        query += ' AND t.milestone_id = ?';
        params.push(parseInt(milestone_id));
      }

      if (assigned_to) {
        query += ' AND t.assigned_to = ?';
        params.push(parseInt(assigned_to));
      }

      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }

      if (priority) {
        query += ' AND t.priority = ?';
        params.push(priority);
      }

      if (search) {
        query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      query += ' ORDER BY t.due_date ASC, t.priority DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const tasks = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/tasks/:id - Get single task
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const task = db.prepare(`
        SELECT t.*, 
               p.name as project_name,
               m.title as milestone_title,
               u.first_name || ' ' || u.last_name as assigned_to_name,
               u.email as assigned_to_email
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN milestones m ON t.milestone_id = m.id
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.id = ?
      `).get(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/tasks - Create new task
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        milestone_id,
        title,
        description,
        assigned_to,
        status = 'pending',
        priority = 'medium',
        due_date,
        estimated_hours
      } = req.body;

      if (!project_id || !title) {
        return res.status(400).json({
          success: false,
          error: 'Project ID and title are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO tasks (
          project_id, milestone_id, title, description, assigned_to,
          status, priority, due_date, estimated_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        project_id, milestone_id, title, description, assigned_to,
        status, priority, due_date, estimated_hours
      );

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        project_id,
        'task',
        result.lastInsertRowid,
        'created',
        `Created task: ${title}`
      );

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/tasks/:id - Update task
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      const fields = Object.keys(updates).filter(key => key !== 'id');
      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);

      db.prepare(`
        UPDATE tasks 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

      res.json({
        success: true,
        data: task,
        message: 'Task updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/tasks/:id/complete - Mark task as complete
  router.put('/:id/complete', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      db.prepare(`
        UPDATE tasks 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id);

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        (existing as any).project_id,
        'task',
        id,
        'completed',
        `Completed task: ${(existing as any).title}`
      );

      res.json({
        success: true,
        data: task,
        message: 'Task marked as complete'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/tasks/:id - Delete task
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

