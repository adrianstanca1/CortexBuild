// CortexBuild Platform - Clients API Routes
// Version: 1.0.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Client, ApiResponse, PaginatedResponse } from '../types';

export function createClientsRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/clients - List all clients
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        search,
        is_active,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = 'SELECT * FROM clients WHERE 1=1';
      const params: any[] = [];

      if (search) {
        query += ' AND (name LIKE ? OR contact_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (is_active !== undefined) {
        query += ' AND is_active = ?';
        params.push(is_active === 'true' ? 1 : 0);
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      // Add pagination
      query += ' ORDER BY name LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const clients = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: clients,
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

  // GET /api/clients/:id - Get single client
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      // Get client projects
      const projects = db.prepare(`
        SELECT * FROM projects 
        WHERE client_id = ? 
        ORDER BY created_at DESC
      `).all(id);

      // Get client invoices
      const invoices = db.prepare(`
        SELECT * FROM invoices 
        WHERE client_id = ? 
        ORDER BY issue_date DESC
        LIMIT 10
      `).all(id);

      res.json({
        success: true,
        data: {
          ...client,
          projects,
          invoices
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/clients - Create new client
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        company_id,
        name,
        contact_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        country = 'US',
        website,
        tax_id,
        payment_terms = 30,
        credit_limit,
        notes
      } = req.body;

      if (!company_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'Company ID and name are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO clients (
          company_id, name, contact_name, email, phone, address, city, state,
          zip_code, country, website, tax_id, payment_terms, credit_limit, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        company_id, name, contact_name, email, phone, address, city, state,
        zip_code, country, website, tax_id, payment_terms, credit_limit, notes
      );

      const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        success: true,
        data: client,
        message: 'Client created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/clients/:id - Update client
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
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
        UPDATE clients 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);

      const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);

      res.json({
        success: true,
        data: client,
        message: 'Client updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/clients/:id - Delete client
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      // Check if client has projects
      const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects WHERE client_id = ?').get(id) as { count: number };
      if (projectCount.count > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete client with existing projects'
        });
      }

      db.prepare('DELETE FROM clients WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Client deleted successfully'
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

