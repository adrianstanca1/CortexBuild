// CortexBuild Platform - Invoices API Routes
// Version: 1.0.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Invoice, InvoiceItem, ApiResponse, PaginatedResponse } from '../types';

export function createInvoicesRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/invoices - List all invoices with filters
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        client_id,
        project_id,
        status,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT i.*, 
               c.name as client_name,
               p.name as project_name
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        LEFT JOIN projects p ON i.project_id = p.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (client_id) {
        query += ' AND i.client_id = ?';
        params.push(parseInt(client_id));
      }

      if (project_id) {
        query += ' AND i.project_id = ?';
        params.push(parseInt(project_id));
      }

      if (status) {
        query += ' AND i.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (i.invoice_number LIKE ? OR c.name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Get total count
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      // Add pagination
      query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const invoices = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: invoices,
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

  // GET /api/invoices/:id - Get single invoice with line items
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const invoice = db.prepare(`
        SELECT i.*, 
               c.name as client_name,
               c.email as client_email,
               c.phone as client_phone,
               p.name as project_name
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        LEFT JOIN projects p ON i.project_id = p.id
        WHERE i.id = ?
      `).get(id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      // Get line items
      const items = db.prepare(`
        SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id
      `).all(id);

      res.json({
        success: true,
        data: {
          ...invoice,
          items
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/invoices - Create new invoice with line items
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        client_id,
        project_id,
        invoice_number,
        issue_date,
        due_date,
        subtotal,
        tax_rate = 0,
        tax_amount = 0,
        total,
        notes,
        items = []
      } = req.body;

      if (!client_id || !invoice_number || !issue_date || !due_date || !total) {
        return res.status(400).json({
          success: false,
          error: 'Client ID, invoice number, issue date, due date, and total are required'
        });
      }

      // Create invoice
      const result = db.prepare(`
        INSERT INTO invoices (
          client_id, project_id, invoice_number, issue_date, due_date,
          subtotal, tax_rate, tax_amount, total, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        client_id, project_id, invoice_number, issue_date, due_date,
        subtotal, tax_rate, tax_amount, total, notes
      );

      const invoiceId = result.lastInsertRowid;

      // Create line items
      if (items.length > 0) {
        const insertItem = db.prepare(`
          INSERT INTO invoice_items (
            invoice_id, description, quantity, unit_price, amount
          ) VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          insertItem.run(
            invoiceId,
            item.description,
            item.quantity,
            item.unit_price,
            item.amount
          );
        }
      }

      const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        project_id,
        'invoice',
        invoiceId,
        'created',
        `Created invoice: ${invoice_number}`
      );

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/invoices/:id - Update invoice
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'items');
      if (fields.length === 0 && !updates.items) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      // Update invoice
      if (fields.length > 0) {
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);

        db.prepare(`
          UPDATE invoices 
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(...values, id);
      }

      // Update line items if provided
      if (updates.items) {
        // Delete existing items
        db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);

        // Insert new items
        const insertItem = db.prepare(`
          INSERT INTO invoice_items (
            invoice_id, description, quantity, unit_price, amount
          ) VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of updates.items) {
          insertItem.run(
            id,
            item.description,
            item.quantity,
            item.unit_price,
            item.amount
          );
        }
      }

      const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/invoices/:id/send - Send invoice to client
  router.put('/:id/send', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      db.prepare(`
        UPDATE invoices 
        SET status = 'sent', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id);

      const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice sent successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/invoices/:id/pay - Mark invoice as paid
  router.put('/:id/pay', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { payment_date } = req.body;

      const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      db.prepare(`
        UPDATE invoices 
        SET status = 'paid', paid_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(payment_date || new Date().toISOString(), id);

      const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice marked as paid'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/invoices/:id - Delete invoice
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      // Delete line items first
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
      
      // Delete invoice
      db.prepare('DELETE FROM invoices WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Invoice deleted successfully'
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

