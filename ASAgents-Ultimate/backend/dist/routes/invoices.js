"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const connection_1 = require("../database/connection");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
function generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}-${timestamp}`;
}
router.get('/', auth_1.authenticate, auth_1.requireCompanyAccess, (0, validation_1.validateQuery)(validation_1.schemas.invoicesQuery), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const companyId = req.user.company_id;
    const query = req.query;
    let whereClause = 'WHERE i.company_id = ?';
    const params = [companyId];
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
    const sortField = query.sort || 'created_at';
    const sortOrder = query.order || 'desc';
    const orderClause = `ORDER BY i.${sortField} ${sortOrder.toUpperCase()}`;
    const countResult = await db.get(`
      SELECT COUNT(*) as count
      FROM invoices i
      ${whereClause}
    `, params);
    const total = countResult?.count || 0;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    const pages = Math.ceil(total / limit);
    const invoices = await db.all(`
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
    const response = {
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
}));
router.get('/:id', auth_1.authenticate, auth_1.requireCompanyAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const invoiceId = req.params.id;
    const companyId = req.user.company_id;
    const invoice = await db.get(`
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
        throw errorHandler_1.errors.notFound('Invoice');
    }
    const items = await db.all(`
      SELECT * FROM invoice_items 
      WHERE invoice_id = ?
      ORDER BY created_at
    `, [invoiceId]);
    const response = {
        success: true,
        data: {
            ...invoice,
            items
        }
    };
    res.json(response);
}));
router.post('/', auth_1.authenticate, auth_1.requireCompanyAccess, (0, validation_1.validate)(validation_1.schemas.createInvoice), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const companyId = req.user.company_id;
    const invoiceData = req.body;
    const client = await db.get(`
      SELECT id FROM companies 
      WHERE id = ? AND type = 'client' AND is_active = 1
    `, [invoiceData.client_id]);
    if (!client) {
        throw errorHandler_1.errors.badRequest('Invalid client ID');
    }
    if (invoiceData.project_id) {
        const project = await db.get(`
        SELECT id FROM projects 
        WHERE id = ? AND company_id = ?
      `, [invoiceData.project_id, companyId]);
        if (!project) {
            throw errorHandler_1.errors.badRequest('Invalid project ID');
        }
    }
    const invoiceId = (0, uuid_1.v4)();
    const invoiceNumber = generateInvoiceNumber();
    const issueDate = new Date().toISOString().split('T')[0];
    let subtotal = 0;
    const items = invoiceData.items.map(item => ({
        id: (0, uuid_1.v4)(),
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
    }));
    subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = 0;
    const totalAmount = subtotal + taxAmount;
    await db.transaction(async () => {
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
    const invoice = await db.get(`
      SELECT 
        i.*,
        c.name as client_name,
        p.name as project_name
      FROM invoices i
      LEFT JOIN companies c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.id = ?
    `, [invoiceId]);
    const response = {
        success: true,
        data: {
            ...invoice,
            items
        },
        message: 'Invoice created successfully'
    };
    res.status(201).json(response);
}));
router.put('/:id', auth_1.authenticate, auth_1.requireCompanyAccess, (0, validation_1.validate)(validation_1.schemas.updateInvoice), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const invoiceId = req.params.id;
    const companyId = req.user.company_id;
    const updates = req.body;
    const existingInvoice = await db.get(`
      SELECT * FROM invoices 
      WHERE id = ? AND company_id = ?
    `, [invoiceId, companyId]);
    if (!existingInvoice) {
        throw errorHandler_1.errors.notFound('Invoice');
    }
    if (existingInvoice.status === 'paid' && updates.status && updates.status !== 'paid') {
        throw errorHandler_1.errors.badRequest('Cannot change status of paid invoice');
    }
    const updateFields = Object.keys(updates);
    if (updateFields.length === 0) {
        throw errorHandler_1.errors.badRequest('No fields to update');
    }
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);
    values.push(invoiceId, companyId);
    await db.run(`
      UPDATE invoices 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND company_id = ?
    `, values);
    const invoice = await db.get(`
      SELECT 
        i.*,
        c.name as client_name,
        p.name as project_name
      FROM invoices i
      LEFT JOIN companies c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.id = ?
    `, [invoiceId]);
    const items = await db.all(`
      SELECT * FROM invoice_items 
      WHERE invoice_id = ?
      ORDER BY created_at
    `, [invoiceId]);
    const response = {
        success: true,
        data: {
            ...invoice,
            items
        },
        message: 'Invoice updated successfully'
    };
    res.json(response);
}));
router.delete('/:id', auth_1.authenticate, auth_1.requireCompanyAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const invoiceId = req.params.id;
    const companyId = req.user.company_id;
    const existingInvoice = await db.get(`
      SELECT status FROM invoices 
      WHERE id = ? AND company_id = ?
    `, [invoiceId, companyId]);
    if (!existingInvoice) {
        throw errorHandler_1.errors.notFound('Invoice');
    }
    if (['sent', 'paid'].includes(existingInvoice.status)) {
        throw errorHandler_1.errors.badRequest('Cannot delete sent or paid invoices');
    }
    await db.transaction(async () => {
        await db.run(`DELETE FROM invoice_items WHERE invoice_id = ?`, [invoiceId]);
        await db.run(`
        DELETE FROM invoices 
        WHERE id = ? AND company_id = ?
      `, [invoiceId, companyId]);
    });
    const response = {
        success: true,
        message: 'Invoice deleted successfully'
    };
    res.json(response);
}));
router.get('/summary', auth_1.authenticate, auth_1.requireCompanyAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const companyId = req.user.company_id;
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
    const response = {
        success: true,
        data: summary
    };
    res.json(response);
}));
exports.default = router;
//# sourceMappingURL=invoices.js.map