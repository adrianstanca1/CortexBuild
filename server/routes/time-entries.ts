// CortexBuild Platform - Time Tracking API Routes
// Version: 1.0.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { TimeEntry, ApiResponse, PaginatedResponse } from '../types';

export function createTimeEntriesRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/time-entries - List all time entries with filters
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        user_id,
        project_id,
        task_id,
        billable,
        start_date,
        end_date,
        page = '1',
        limit = '50'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT te.*, 
               u.name as user_name,
               p.name as project_name,
               t.title as task_title
        FROM time_entries te
        LEFT JOIN users u ON te.user_id = u.id
        LEFT JOIN projects p ON te.project_id = p.id
        LEFT JOIN tasks t ON te.task_id = t.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (user_id) {
        query += ' AND te.user_id = ?';
        params.push(parseInt(user_id));
      }

      if (project_id) {
        query += ' AND te.project_id = ?';
        params.push(parseInt(project_id));
      }

      if (task_id) {
        query += ' AND te.task_id = ?';
        params.push(parseInt(task_id));
      }

      if (billable !== undefined) {
        query += ' AND te.billable = ?';
        params.push(billable === 'true' ? 1 : 0);
      }

      if (start_date) {
        query += ' AND te.start_time >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND te.start_time <= ?';
        params.push(end_date);
      }

      // Get total count
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      // Add pagination
      query += ' ORDER BY te.start_time DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const entries = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: entries,
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

  // GET /api/time-entries/:id - Get single time entry
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const entry = db.prepare(`
        SELECT te.*, 
               u.name as user_name,
               u.email as user_email,
               p.name as project_name,
               t.title as task_title
        FROM time_entries te
        LEFT JOIN users u ON te.user_id = u.id
        LEFT JOIN projects p ON te.project_id = p.id
        LEFT JOIN tasks t ON te.task_id = t.id
        WHERE te.id = ?
      `).get(id);

      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Time entry not found'
        });
      }

      res.json({
        success: true,
        data: entry
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/time-entries - Create/start new time entry
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        user_id,
        project_id,
        task_id,
        description,
        start_time,
        billable = true,
        hourly_rate
      } = req.body;

      if (!user_id || !project_id) {
        return res.status(400).json({
          success: false,
          error: 'User ID and Project ID are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO time_entries (
          user_id, project_id, task_id, description, start_time, billable, hourly_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        user_id,
        project_id,
        task_id,
        description,
        start_time || new Date().toISOString(),
        billable ? 1 : 0,
        hourly_rate
      );

      const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(result.lastInsertRowid);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        user_id,
        project_id,
        'time_entry',
        result.lastInsertRowid,
        'created',
        'Started time tracking'
      );

      res.status(201).json({
        success: true,
        data: entry,
        message: 'Time entry started successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/time-entries/:id - Update/stop time entry
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Time entry not found'
        });
      }

      // If stopping timer, calculate duration
      if (updates.end_time && !(existing as any).end_time) {
        const startTime = new Date((existing as any).start_time).getTime();
        const endTime = new Date(updates.end_time).getTime();
        updates.duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
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
        UPDATE time_entries 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);

      const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(id);

      res.json({
        success: true,
        data: entry,
        message: 'Time entry updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/time-entries/summary - Get time summary
  router.get('/summary/stats', (req: Request, res: Response) => {
    try {
      const { user_id, project_id, start_date, end_date } = req.query as any;

      let query = `
        SELECT 
          COUNT(*) as total_entries,
          SUM(duration) as total_minutes,
          SUM(CASE WHEN billable = 1 THEN duration ELSE 0 END) as billable_minutes,
          SUM(CASE WHEN billable = 0 THEN duration ELSE 0 END) as non_billable_minutes
        FROM time_entries
        WHERE 1=1
      `;
      const params: any[] = [];

      if (user_id) {
        query += ' AND user_id = ?';
        params.push(parseInt(user_id));
      }

      if (project_id) {
        query += ' AND project_id = ?';
        params.push(parseInt(project_id));
      }

      if (start_date) {
        query += ' AND start_time >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND start_time <= ?';
        params.push(end_date);
      }

      const summary = db.prepare(query).get(...params);

      res.json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/time-entries/:id - Delete time entry
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(id);
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Time entry not found'
        });
      }

      db.prepare('DELETE FROM time_entries WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Time entry deleted successfully'
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

