// CortexBuild Platform - Purchase Orders API Routes
// Version: 1.1.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { PurchaseOrder, PurchaseOrderItem, ApiResponse, PaginatedResponse } from '../types';

export function createPurchaseOrdersRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/purchase-orders - List all purchase orders
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        vendor_id,
        status,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT po.*, 
               p.name as project_name,
               s.name as vendor_name
        FROM purchase_orders po
        LEFT JOIN projects p ON po.project_id = p.id
        LEFT JOIN subcontractors s ON po.vendor_id = s.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (project_id) {
        query += ' AND po.project_id = ?';
        params.push(parseInt(project_id));
      }

      if (vendor_id) {
        query += ' AND po.vendor_id = ?';
        params.push(parseInt(vendor_id));
      }

      if (status) {
        query += ' AND po.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (po.po_number LIKE ? OR s.name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      query += ' ORDER BY po.created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const orders = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: orders,
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

  // GET /api/purchase-orders/:id - Get single PO with items
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const po = db.prepare(`
        SELECT po.*, 
               p.name as project_name,
               s.name as vendor_name,
               s.email as vendor_email,
               s.phone as vendor_phone
        FROM purchase_orders po
        LEFT JOIN projects p ON po.project_id = p.id
        LEFT JOIN subcontractors s ON po.vendor_id = s.id
        WHERE po.id = ?
      `).get(id);

      if (!po) {
        return res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
      }

      const items = db.prepare(`
        SELECT * FROM po_items WHERE po_id = ? ORDER BY id
      `).all(id);

      res.json({
        success: true,
        data: {
          ...po,
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

  // POST /api/purchase-orders - Create new PO
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        vendor_id,
        po_number,
        order_date,
        delivery_date,
        subtotal,
        tax_amount = 0,
        total,
        notes,
        items = []
      } = req.body;

      if (!project_id || !vendor_id || !po_number || !order_date || !total) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, vendor ID, PO number, order date, and total are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO purchase_orders (
          project_id, vendor_id, po_number, order_date, delivery_date,
          subtotal, tax_amount, total, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        project_id, vendor_id, po_number, order_date, delivery_date,
        subtotal, tax_amount, total, notes
      );

      const poId = result.lastInsertRowid;

      if (items.length > 0) {
        const insertItem = db.prepare(`
          INSERT INTO po_items (
            po_id, description, quantity, unit_price, amount
          ) VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          insertItem.run(poId, item.description, item.quantity, item.unit_price, item.amount);
        }
      }

      const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(poId);

      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        project_id,
        'purchase_order',
        poId,
        'created',
        `Created PO: ${po_number}`
      );

      res.status(201).json({
        success: true,
        data: po,
        message: 'Purchase order created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/purchase-orders/:id - Update PO
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
      }

      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'items');
      if (fields.length === 0 && !updates.items) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      if (fields.length > 0) {
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);

        db.prepare(`
          UPDATE purchase_orders 
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(...values, id);
      }

      if (updates.items) {
        db.prepare('DELETE FROM po_items WHERE po_id = ?').run(id);

        const insertItem = db.prepare(`
          INSERT INTO po_items (po_id, description, quantity, unit_price, amount)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of updates.items) {
          insertItem.run(id, item.description, item.quantity, item.unit_price, item.amount);
        }
      }

      const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);

      res.json({
        success: true,
        data: po,
        message: 'Purchase order updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/purchase-orders/:id/approve - Approve PO
  router.put('/:id/approve', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const existing = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
      }

      db.prepare(`
        UPDATE purchase_orders 
        SET status = 'approved', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id);

      const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);

      res.json({
        success: true,
        data: po,
        message: 'Purchase order approved'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/purchase-orders/:id - Delete PO
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
      if (!po) {
        return res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
      }

      db.prepare('DELETE FROM po_items WHERE po_id = ?').run(id);
      db.prepare('DELETE FROM purchase_orders WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Purchase order deleted successfully'
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

