// CortexBuild Platform - Milestones API Routes
// Version: 1.1.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Milestone, ApiResponse, PaginatedResponse } from '../types';

export function createMilestonesRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/milestones - List all milestones
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        status,
        search,
        page = '1',
        limit = '50'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT m.*, 
               p.name as project_name,
               COUNT(t.id) as task_count,
               SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM milestones m
        LEFT JOIN projects p ON m.project_id = p.id
        LEFT JOIN tasks t ON m.id = t.milestone_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (project_id) {
        query += ' AND m.project_id = ?';
        params.push(parseInt(project_id));
      }

      if (status) {
        query += ' AND m.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (m.name LIKE ? OR m.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' GROUP BY m.id';

      const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      query += ' ORDER BY m.due_date ASC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const milestones = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: milestones,
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

  // GET /api/milestones/:id - Get single milestone with tasks
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const milestone = db.prepare(`
        SELECT m.*, 
               p.name as project_name
        FROM milestones m
        LEFT JOIN projects p ON m.project_id = p.id
        WHERE m.id = ?
      `).get(id);

      if (!milestone) {
        return res.status(404).json({
          success: false,
          error: 'Milestone not found'
        });
      }

      // Get associated tasks
      const tasks = db.prepare(`
        SELECT t.*, 
               u.name as assigned_to_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.milestone_id = ?
        ORDER BY t.due_date ASC
      `).all(id);

      res.json({
        success: true,
        data: {
          ...milestone,
          tasks
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/milestones - Create new milestone
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        title,
        description,
        due_date,
        status = 'pending'
      } = req.body;

      if (!project_id || !title || !due_date) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, title, and due date are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO milestones (
          project_id, name, description, due_date, status
        ) VALUES (?, ?, ?, ?, ?)
      `).run(project_id, title, description, due_date, status);

      const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(result.lastInsertRowid);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        project_id,
        'milestone',
        result.lastInsertRowid,
        'created',
        `Created milestone: ${title}`
      );

      res.status(201).json({
        success: true,
        data: milestone,
        message: 'Milestone created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/milestones/:id - Update milestone
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Milestone not found'
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
        UPDATE milestones 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);

      const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        (existing as any).project_id,
        'milestone',
        id,
        'updated',
        `Updated milestone: ${(existing as any).title}`
      );

      res.json({
        success: true,
        data: milestone,
        message: 'Milestone updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/milestones/:id - Delete milestone
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);
      if (!milestone) {
        return res.status(404).json({
          success: false,
          error: 'Milestone not found'
        });
      }

      // Check if milestone has tasks
      const taskCount = db.prepare(`
        SELECT COUNT(*) as count FROM tasks WHERE milestone_id = ?
      `).get(id) as { count: number };

      if (taskCount.count > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete milestone with associated tasks. Remove tasks first.'
        });
      }

      db.prepare('DELETE FROM milestones WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Milestone deleted successfully'
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

