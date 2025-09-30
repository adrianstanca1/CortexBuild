import { Router } from 'express';
import { authenticateUser, requireRole } from '../middleware/authenticate.js';
import { pool } from '../services/db.js';
const router = Router();
// Get all expenses for a tenant
router.get('/', authenticateUser, async (req, res) => {
    const { project_id, user_id, category, status, start_date, end_date } = req.query;
    let query = `
    SELECT e.*, 
           p.name as project_name,
           CONCAT(u.first_name, ' ', u.last_name) as user_name,
           CONCAT(a.first_name, ' ', a.last_name) as approver_name
    FROM expenses e
    LEFT JOIN projects p ON e.project_id = p.id
    LEFT JOIN users u ON e.user_id = u.id
    LEFT JOIN users a ON e.approved_by = a.id
    WHERE e.tenant_id = ?
  `;
    const params = [req.user?.tenant_id];
    if (project_id) {
        query += ' AND e.project_id = ?';
        params.push(project_id);
    }
    if (user_id) {
        query += ' AND e.user_id = ?';
        params.push(user_id);
    }
    if (category) {
        query += ' AND e.category = ?';
        params.push(category);
    }
    if (status) {
        query += ' AND e.status = ?';
        params.push(status);
    }
    if (start_date) {
        query += ' AND e.expense_date >= ?';
        params.push(start_date);
    }
    if (end_date) {
        query += ' AND e.expense_date <= ?';
        params.push(end_date);
    }
    query += ' ORDER BY e.expense_date DESC';
    try {
        const [rows] = await pool.query(query, params);
        const expenses = rows.map(row => ({
            id: row.id,
            tenantId: row.tenant_id,
            projectId: row.project_id,
            userId: row.user_id,
            category: row.category,
            description: row.description,
            amount: row.amount,
            currency: row.currency,
            expenseDate: row.expense_date,
            receiptUrl: row.receipt_url,
            status: row.status,
            approvedBy: row.approved_by,
            approvedAt: row.approved_at,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            projectName: row.project_name,
            userName: row.user_name,
            approverName: row.approver_name
        }));
        return res.json(expenses);
    }
    catch (error) {
        console.error('Error fetching expenses:', error);
        return res.status(500).json({ message: 'Failed to fetch expenses' });
    }
});
// Get a specific expense
router.get('/:id', authenticateUser, async (req, res) => {
    const expenseId = parseInt(req.params.id);
    try {
        const [rows] = await pool.query(`SELECT e.*, 
              p.name as project_name,
              CONCAT(u.first_name, ' ', u.last_name) as user_name,
              CONCAT(a.first_name, ' ', a.last_name) as approver_name
       FROM expenses e
       LEFT JOIN projects p ON e.project_id = p.id
       LEFT JOIN users u ON e.user_id = u.id
       LEFT JOIN users a ON e.approved_by = a.id
       WHERE e.id = ? AND e.tenant_id = ?`, [expenseId, req.user?.tenant_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        const row = rows[0];
        const expense = {
            id: row.id,
            tenantId: row.tenant_id,
            projectId: row.project_id,
            userId: row.user_id,
            category: row.category,
            description: row.description,
            amount: row.amount,
            currency: row.currency,
            expenseDate: row.expense_date,
            receiptUrl: row.receipt_url,
            status: row.status,
            approvedBy: row.approved_by,
            approvedAt: row.approved_at,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            projectName: row.project_name,
            userName: row.user_name,
            approverName: row.approver_name
        };
        return res.json(expense);
    }
    catch (error) {
        console.error('Error fetching expense:', error);
        return res.status(500).json({ message: 'Failed to fetch expense' });
    }
});
// Create a new expense
router.post('/', authenticateUser, async (req, res) => {
    const { projectId, category, description, amount, currency = 'GBP', expenseDate, receiptUrl, notes } = req.body;
    if (!category || !description || !amount || !expenseDate) {
        return res.status(400).json({
            message: 'Category, description, amount, and expense date are required'
        });
    }
    try {
        const [result] = await pool.execute(`INSERT INTO expenses (
        tenant_id, project_id, user_id, category, description, amount,
        currency, expense_date, receipt_url, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`, [
            req.user?.tenant_id,
            projectId || null,
            req.user?.sub,
            category,
            description,
            amount,
            currency,
            expenseDate,
            receiptUrl || null,
            notes || null
        ]);
        return res.status(201).json({
            id: result.insertId,
            message: 'Expense created successfully'
        });
    }
    catch (error) {
        console.error('Error creating expense:', error);
        return res.status(500).json({ message: 'Failed to create expense' });
    }
});
// Update an expense
router.put('/:id', authenticateUser, async (req, res) => {
    const expenseId = parseInt(req.params.id);
    const { projectId, category, description, amount, currency, expenseDate, receiptUrl, notes, status } = req.body;
    try {
        // Check if expense exists and user has permission to edit
        const [existingRows] = await pool.query('SELECT user_id FROM expenses WHERE id = ? AND tenant_id = ?', [expenseId, req.user?.tenant_id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        // Users can only edit their own expenses unless they're admin/manager
        const userRole = req.user?.role;
        const isOwner = existingRows[0].user_id === req.user?.sub;
        const canEdit = isOwner || ['owner', 'admin', 'manager'].includes(userRole || '');
        if (!canEdit) {
            return res.status(403).json({ message: 'Not authorized to edit this expense' });
        }
        await pool.execute(`UPDATE expenses SET 
        project_id = ?, category = ?, description = ?, amount = ?,
        currency = ?, expense_date = ?, receipt_url = ?, notes = ?, status = ?
       WHERE id = ? AND tenant_id = ?`, [
            projectId || null,
            category,
            description,
            amount,
            currency,
            expenseDate,
            receiptUrl || null,
            notes || null,
            status || 'draft',
            expenseId,
            req.user?.tenant_id
        ]);
        return res.json({ message: 'Expense updated successfully' });
    }
    catch (error) {
        console.error('Error updating expense:', error);
        return res.status(500).json({ message: 'Failed to update expense' });
    }
});
// Approve/reject an expense
router.patch('/:id/approval', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req, res) => {
    const expenseId = parseInt(req.params.id);
    const { status, notes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    try {
        const [existingRows] = await pool.query('SELECT id FROM expenses WHERE id = ? AND tenant_id = ?', [expenseId, req.user?.tenant_id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        await pool.execute(`UPDATE expenses SET 
        status = ?, approved_by = ?, approved_at = ?, notes = ?
       WHERE id = ? AND tenant_id = ?`, [
            status,
            req.user?.sub,
            new Date(),
            notes || null,
            expenseId,
            req.user?.tenant_id
        ]);
        return res.json({ message: `Expense ${status} successfully` });
    }
    catch (error) {
        console.error('Error updating expense approval:', error);
        return res.status(500).json({ message: 'Failed to update expense approval' });
    }
});
// Delete an expense
router.delete('/:id', authenticateUser, async (req, res) => {
    const expenseId = parseInt(req.params.id);
    try {
        // Check if expense exists and user has permission to delete
        const [existingRows] = await pool.query('SELECT user_id FROM expenses WHERE id = ? AND tenant_id = ?', [expenseId, req.user?.tenant_id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        // Users can only delete their own expenses unless they're admin/manager
        const userRole = req.user?.role;
        const isOwner = existingRows[0].user_id === req.user?.sub;
        const canDelete = isOwner || ['owner', 'admin', 'manager'].includes(userRole || '');
        if (!canDelete) {
            return res.status(403).json({ message: 'Not authorized to delete this expense' });
        }
        await pool.execute('DELETE FROM expenses WHERE id = ? AND tenant_id = ?', [expenseId, req.user?.tenant_id]);
        return res.json({ message: 'Expense deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting expense:', error);
        return res.status(500).json({ message: 'Failed to delete expense' });
    }
});
export default router;
