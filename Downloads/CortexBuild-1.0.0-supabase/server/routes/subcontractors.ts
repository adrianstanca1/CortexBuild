// CortexBuild Platform - Subcontractors API Routes
// Version: 1.0.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Subcontractor, ApiResponse, PaginatedResponse } from '../types';

export function createSubcontractorsRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/subcontractors - List all subcontractors
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        company_id,
        trade,
        status,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT s.*
        FROM subcontractors s
        WHERE 1=1
      `;
      const params: any[] = [];

      if (company_id) {
        query += ' AND s.company_id = ?';
        params.push(parseInt(company_id));
      }

      if (trade) {
        query += ' AND s.trade = ?';
        params.push(trade);
      }

      if (status) {
        query += ' AND s.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (s.name LIKE ? OR s.company_name LIKE ? OR s.email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Get total count
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      // Add pagination
      query += ' ORDER BY s.name LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const subcontractors = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: subcontractors,
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

  // GET /api/subcontractors/:id - Get single subcontractor with projects
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const subcontractor = db.prepare(`
        SELECT * FROM subcontractors WHERE id = ?
      `).get(id);

      if (!subcontractor) {
        return res.status(404).json({
          success: false,
          error: 'Subcontractor not found'
        });
      }

      // Get assigned projects
      const projects = db.prepare(`
        SELECT p.*, ps.role, ps.start_date, ps.end_date
        FROM projects p
        INNER JOIN project_subcontractors ps ON p.id = ps.project_id
        WHERE ps.subcontractor_id = ?
      `).all(id);

      res.json({
        success: true,
        data: {
          ...subcontractor,
          projects
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/subcontractors - Create new subcontractor
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        company_id,
        name,
        company_name,
        trade,
        email,
        phone,
        address,
        city,
        state,
        zip,
        license_number,
        insurance_expiry,
        hourly_rate,
        status = 'active'
      } = req.body;

      if (!company_id || !name || !trade) {
        return res.status(400).json({
          success: false,
          error: 'Company ID, name, and trade are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO subcontractors (
          company_id, name, company_name, trade, email, phone,
          address, city, state, zip, license_number, insurance_expiry,
          hourly_rate, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        company_id, name, company_name, trade, email, phone,
        address, city, state, zip, license_number, insurance_expiry,
        hourly_rate, status
      );

      const subcontractor = db.prepare('SELECT * FROM subcontractors WHERE id = ?').get(result.lastInsertRowid);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        'subcontractor',
        result.lastInsertRowid,
        'created',
        `Added subcontractor: ${name}`
      );

      res.status(201).json({
        success: true,
        data: subcontractor,
        message: 'Subcontractor created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/subcontractors/:id - Update subcontractor
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM subcontractors WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Subcontractor not found'
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
        UPDATE subcontractors 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);

      const subcontractor = db.prepare('SELECT * FROM subcontractors WHERE id = ?').get(id);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        'subcontractor',
        id,
        'updated',
        `Updated subcontractor: ${(existing as any).name}`
      );

      res.json({
        success: true,
        data: subcontractor,
        message: 'Subcontractor updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/subcontractors/:id - Delete subcontractor
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const subcontractor = db.prepare('SELECT * FROM subcontractors WHERE id = ?').get(id);
      if (!subcontractor) {
        return res.status(404).json({
          success: false,
          error: 'Subcontractor not found'
        });
      }

      // Check if subcontractor is assigned to any projects
      const projectCount = db.prepare(`
        SELECT COUNT(*) as count FROM project_subcontractors WHERE subcontractor_id = ?
      `).get(id) as { count: number };

      if (projectCount.count > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete subcontractor assigned to projects. Remove from projects first.'
        });
      }

      db.prepare('DELETE FROM subcontractors WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Subcontractor deleted successfully'
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

