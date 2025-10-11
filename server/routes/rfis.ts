// CortexBuild Platform - RFIs API Routes
// Version: 1.0.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { RFI, ApiResponse, PaginatedResponse } from '../types';

export function createRFIsRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/rfis - List all RFIs with filters
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        status,
        priority,
        assigned_to,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT r.*, 
               p.name as project_name,
               u1.name as submitted_by_name,
               u2.name as assigned_to_name
        FROM rfis r
        LEFT JOIN projects p ON r.project_id = p.id
        LEFT JOIN users u1 ON r.submitted_by = u1.id
        LEFT JOIN users u2 ON r.assigned_to = u2.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (project_id) {
        query += ' AND r.project_id = ?';
        params.push(parseInt(project_id));
      }

      if (status) {
        query += ' AND r.status = ?';
        params.push(status);
      }

      if (priority) {
        query += ' AND r.priority = ?';
        params.push(priority);
      }

      if (assigned_to) {
        query += ' AND r.assigned_to = ?';
        params.push(parseInt(assigned_to));
      }

      if (search) {
        query += ' AND (r.subject LIKE ? OR r.question LIKE ? OR r.rfi_number LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Get total count
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      // Add pagination
      query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const rfis = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: rfis,
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

  // GET /api/rfis/:id - Get single RFI
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const rfi = db.prepare(`
        SELECT r.*, 
               p.name as project_name,
               u1.name as submitted_by_name,
               u1.email as submitted_by_email,
               u2.name as assigned_to_name,
               u2.email as assigned_to_email
        FROM rfis r
        LEFT JOIN projects p ON r.project_id = p.id
        LEFT JOIN users u1 ON r.submitted_by = u1.id
        LEFT JOIN users u2 ON r.assigned_to = u2.id
        WHERE r.id = ?
      `).get(id);

      if (!rfi) {
        return res.status(404).json({
          success: false,
          error: 'RFI not found'
        });
      }

      res.json({
        success: true,
        data: rfi
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/rfis - Create new RFI
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        rfi_number,
        subject,
        question,
        priority = 'medium',
        submitted_by,
        assigned_to,
        due_date
      } = req.body;

      if (!project_id || !rfi_number || !subject || !question || !submitted_by) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, RFI number, subject, question, and submitted_by are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO rfis (
          project_id, rfi_number, subject, question, priority, submitted_by, assigned_to, due_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(project_id, rfi_number, subject, question, priority, submitted_by, assigned_to, due_date);

      const rfi = db.prepare('SELECT * FROM rfis WHERE id = ?').get(result.lastInsertRowid);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        submitted_by,
        project_id,
        'rfi',
        result.lastInsertRowid,
        'created',
        `Created RFI: ${rfi_number} - ${subject}`
      );

      res.status(201).json({
        success: true,
        data: rfi,
        message: 'RFI created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/rfis/:id - Update RFI
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM rfis WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'RFI not found'
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
        UPDATE rfis 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);

      const rfi = db.prepare('SELECT * FROM rfis WHERE id = ?').get(id);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        (existing as any).project_id,
        'rfi',
        id,
        'updated',
        `Updated RFI: ${(existing as any).rfi_number}`
      );

      res.json({
        success: true,
        data: rfi,
        message: 'RFI updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/rfis/:id/answer - Answer RFI
  router.put('/:id/answer', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { answer } = req.body;

      if (!answer) {
        return res.status(400).json({
          success: false,
          error: 'Answer is required'
        });
      }

      const existing = db.prepare('SELECT * FROM rfis WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'RFI not found'
        });
      }

      db.prepare(`
        UPDATE rfis 
        SET answer = ?, status = 'answered', answered_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(answer, id);

      const rfi = db.prepare('SELECT * FROM rfis WHERE id = ?').get(id);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        (existing as any).project_id,
        'rfi',
        id,
        'answered',
        `Answered RFI: ${(existing as any).rfi_number}`
      );

      res.json({
        success: true,
        data: rfi,
        message: 'RFI answered successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/rfis/:id - Delete RFI
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const rfi = db.prepare('SELECT * FROM rfis WHERE id = ?').get(id);
      if (!rfi) {
        return res.status(404).json({
          success: false,
          error: 'RFI not found'
        });
      }

      db.prepare('DELETE FROM rfis WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'RFI deleted successfully'
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

