import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/connection';
import { authenticate, requireCompanyAccess } from '../middleware/auth';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler, errors } from '../middleware/errorHandler';
import { Invoice, InvoiceItem, InvoicesQuery, CreateInvoiceRequest, UpdateInvoiceRequest, ApiResponse } from '../types';

const router = Router();

// Generate invoice number
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `INV-${year}-${timestamp}`;
}

// Get all invoices for user's company
router.get('/',
  authenticate,
  requireCompanyAccess,
  validateQuery(schemas.invoicesQuery),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const companyId = req.user!.company_id!;
    const query = req.query as InvoicesQuery;
    
    // Build WHERE clause
    let whereClause = 'WHERE i.company_id = ?';
    const params: any[] = [companyId];
    
    if (query.status) {
      whereClause += ' AND i.status = ?';
      params.push(query.status);
    }
    
    if (query.client_id) {
      whereClause += ' AND i.client_id = ?';
      params.push(query.client_id);
    }
    
    if (query.project_id) {
      whereClause += ' AND i.project_id = ?';
      params.push(query.project_id);
    }
    
    if (query.date_from) {
      whereClause += ' AND i.issue_date >= ?';
      params.push(query.date_from);
    }
    
    if (query.date_to) {
      whereClause += ' AND i.issue_date <= ?';
      params.push(query.date_to);
    }
    
    // Build ORDER BY clause
    const sortField = query.sort || 'created_at';
    const sortOrder = query.order || 'desc';
    const orderClause = `ORDER BY i.${sortField} ${sortOrder.toUpperCase()}`;
    
    // Get total count
    const countResult = await db.get<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM invoices i
      ${whereClause}
    `, params);
    
    const total = countResult?.count || 0;
    
    // Calculate pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    const pages = Math.ceil(total / limit);
    
    // Get invoices with related data
    const invoices = await db.all<Invoice & { 
      client_name?: string; 
      project_name?: string;
      item_count?: number;
    }>(`
      SELECT 
        i.*,
        c.name as client_name,
        p.name as project_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM invoices i
      LEFT JOIN companies c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    
    const response: ApiResponse = {
      success: true,
      data: invoices,
      meta: {
        total,
        page,
        limit,
        pages
      }
    };
    
    res.json(response);
  })
);

// Get single invoice with items
router.get('/:id',
  authenticate,
  requireCompanyAccess,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const invoiceId = req.params.id;
    const companyId = req.user!.company_id!;
    
    // Get invoice with related data
    const invoice = await db.get<Invoice & { 
      client_name?: string; 
      project_name?: string;
    }>(`
      SELECT 
        i.*,
        c.name as client_name,
        p.name as project_name
      FROM invoices i
      LEFT JOIN companies c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.id = ? AND i.company_id = ?
    `, [invoiceId, companyId]);
    
    if (!invoice) {
      throw errors.notFound('Invoice');
    }
    
    // Get invoice items
    const items = await db.all<InvoiceItem>(`
      SELECT * FROM invoice_items 
      WHERE invoice_id = ?
      ORDER BY created_at
    `, [invoiceId]);
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...invoice,
        items
      }
    };
    
    res.json(response);
  })
);

// Create new invoice
router.post('/',
  authenticate,
  requireCompanyAccess,
  validate(schemas.createInvoice),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const companyId = req.user!.company_id!;
    const invoiceData: CreateInvoiceRequest = req.body;
    
    // Validate client exists
    const client = await db.get(`
      SELECT id FROM companies 
      WHERE id = ? AND type = 'client' AND is_active = 1
    `, [invoiceData.client_id]);
    
    if (!client) {
      throw errors.badRequest('Invalid client ID');
    }
    
    // Validate project exists if provided
    if (invoiceData.project_id) {
      const project = await db.get(`
        SELECT id FROM projects 
        WHERE id = ? AND company_id = ?
      `, [invoiceData.project_id, companyId]);
      
      if (!project) {
        throw errors.badRequest('Invalid project ID');
      }
    }
    
    const invoiceId = uuidv4();
    const invoiceNumber = generateInvoiceNumber();
    const issueDate = new Date().toISOString().split('T')[0];
    
    // Calculate totals
    let subtotal = 0;
    const items = invoiceData.items.map(item => ({
      id: uuidv4(),
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }));
    
    subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = 0; // Can be calculated based on business rules
    const totalAmount = subtotal + taxAmount;
    
    await db.transaction(async () => {
      // Create invoice
      await db.run(`
        INSERT INTO invoices (
          id, invoice_number, project_id, client_id, company_id, 
          issue_date, due_date, subtotal, tax_amount, total_amount, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoiceId,
        invoiceNumber,
        invoiceData.project_id || null,
        invoiceData.client_id,
        companyId,
        issueDate,
        invoiceData.due_date,
        subtotal,
        taxAmount,
        totalAmount,
        invoiceData.notes || null
      ]);
      
      // Create invoice items
      for (const item of items) {
        await db.run(`
          INSERT INTO invoice_items (
            id, invoice_id, description, quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          item.id,
          item.invoice_id,
          item.description,
          item.quantity,
          item.unit_price,
          item.total_price
        ]);
      }
    });
    
    // Get the created invoice with related data
    const invoice = await db.get<Invoice & { 
      client_name?: string; 
      project_name?: string;
    }>(`
      SELECT 
        i.*,
        c.name as client_name,
        p.name as project_name
      FROM invoices i
      LEFT JOIN companies c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.id = ?
    `, [invoiceId]);
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...invoice,
        items
      },
      message: 'Invoice created successfully'
    };
    
    res.status(201).json(response);
  })
);

// Update invoice
router.put('/:id',
  authenticate,
  requireCompanyAccess,
  validate(schemas.updateInvoice),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const invoiceId = req.params.id;
    const companyId = req.user!.company_id!;
    const updates: UpdateInvoiceRequest = req.body;
    
    // Check if invoice exists and belongs to user's company
    const existingInvoice = await db.get<Invoice>(`
      SELECT * FROM invoices 
      WHERE id = ? AND company_id = ?
    `, [invoiceId, companyId]);
    
    if (!existingInvoice) {
      throw errors.notFound('Invoice');
    }
    
    // Don't allow updates to paid invoices (except paid_amount)
    if (existingInvoice.status === 'paid' && updates.status && updates.status !== 'paid') {
      throw errors.badRequest('Cannot change status of paid invoice');
    }
    
    const updateFields = Object.keys(updates);
    if (updateFields.length === 0) {
      throw errors.badRequest('No fields to update');
    }
    
    // Build dynamic update query
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field as keyof UpdateInvoiceRequest]);
    values.push(invoiceId, companyId);
    
    await db.run(`
      UPDATE invoices 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND company_id = ?
    `, values);
    
    // Get updated invoice with related data
    const invoice = await db.get<Invoice & { 
      client_name?: string; 
      project_name?: string;
    }>(`
      SELECT 
        i.*,
        c.name as client_name,
        p.name as project_name
      FROM invoices i
      LEFT JOIN companies c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.id = ?
    `, [invoiceId]);
    
    // Get invoice items
    const items = await db.all<InvoiceItem>(`
      SELECT * FROM invoice_items 
      WHERE invoice_id = ?
      ORDER BY created_at
    `, [invoiceId]);
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...invoice,
        items
      },
      message: 'Invoice updated successfully'
    };
    
    res.json(response);
  })
);

// Delete invoice
router.delete('/:id',
  authenticate,
  requireCompanyAccess,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const invoiceId = req.params.id;
    const companyId = req.user!.company_id!;
    
    // Check if invoice exists and belongs to user's company
    const existingInvoice = await db.get<Invoice>(`
      SELECT status FROM invoices 
      WHERE id = ? AND company_id = ?
    `, [invoiceId, companyId]);
    
    if (!existingInvoice) {
      throw errors.notFound('Invoice');
    }
    
    // Don't allow deletion of sent or paid invoices
    if (['sent', 'paid'].includes(existingInvoice.status)) {
      throw errors.badRequest('Cannot delete sent or paid invoices');
    }
    
    await db.transaction(async () => {
      // Delete invoice items first (due to foreign key constraint)
      await db.run(`DELETE FROM invoice_items WHERE invoice_id = ?`, [invoiceId]);
      
      // Delete invoice
      await db.run(`
        DELETE FROM invoices 
        WHERE id = ? AND company_id = ?
      `, [invoiceId, companyId]);
    });
    
    const response: ApiResponse = {
      success: true,
      message: 'Invoice deleted successfully'
    };
    
    res.json(response);
  })
);

// Get invoice summary/statistics
router.get('/summary',
  authenticate,
  requireCompanyAccess,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const companyId = req.user!.company_id!;
    
    const summary = await db.get(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'draft' THEN total_amount ELSE 0 END), 0) as draft_amount,
        COALESCE(SUM(CASE WHEN status = 'sent' THEN total_amount ELSE 0 END), 0) as sent_amount,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END), 0) as overdue_amount,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
      FROM invoices 
      WHERE company_id = ?
    `, [companyId]);
    
    const response: ApiResponse = {
      success: true,
      data: summary
    };
    
    res.json(response);
  })
);

export default router;
