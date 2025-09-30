import { Router } from 'express';
import { authenticateUser, requireRole } from '../middleware/authenticate.js';
import { pool } from '../services/db.js';
const router = Router();
// Get all companies for a tenant
router.get('/', authenticateUser, async (req, res) => {
    const { type, status } = req.query;
    let query = 'SELECT * FROM companies WHERE tenant_id = ?';
    const params = [req.user?.tenant_id];
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    query += ' ORDER BY name ASC';
    try {
        const [rows] = await pool.query(query, params);
        const companies = rows.map(row => ({
            id: row.id,
            tenantId: row.tenant_id,
            name: row.name,
            type: row.type,
            contactEmail: row.contact_email,
            contactPhone: row.contact_phone,
            address: row.address ? JSON.parse(row.address) : null,
            website: row.website,
            taxNumber: row.tax_number,
            storageUsageGb: row.storage_usage_gb,
            maxUsers: row.max_users,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
        return res.json(companies);
    }
    catch (error) {
        console.error('Error fetching companies:', error);
        return res.status(500).json({ message: 'Failed to fetch companies' });
    }
});
// Get a specific company
router.get('/:id', authenticateUser, async (req, res) => {
    const companyId = parseInt(req.params.id);
    try {
        const [rows] = await pool.query('SELECT * FROM companies WHERE id = ? AND tenant_id = ?', [companyId, req.user?.tenant_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        const row = rows[0];
        const company = {
            id: row.id,
            tenantId: row.tenant_id,
            name: row.name,
            type: row.type,
            contactEmail: row.contact_email,
            contactPhone: row.contact_phone,
            address: row.address ? JSON.parse(row.address) : null,
            website: row.website,
            taxNumber: row.tax_number,
            storageUsageGb: row.storage_usage_gb,
            maxUsers: row.max_users,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        return res.json(company);
    }
    catch (error) {
        console.error('Error fetching company:', error);
        return res.status(500).json({ message: 'Failed to fetch company' });
    }
});
// Create a new company
router.post('/', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req, res) => {
    const { name, type = 'client', contactEmail, contactPhone, address, website, taxNumber, maxUsers = 10, status = 'active' } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Company name is required' });
    }
    try {
        const [result] = await pool.execute(`INSERT INTO companies (
        tenant_id, name, type, contact_email, contact_phone, address,
        website, tax_number, max_users, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            req.user?.tenant_id,
            name,
            type,
            contactEmail || null,
            contactPhone || null,
            address ? JSON.stringify(address) : null,
            website || null,
            taxNumber || null,
            maxUsers,
            status
        ]);
        return res.status(201).json({
            id: result.insertId,
            message: 'Company created successfully'
        });
    }
    catch (error) {
        console.error('Error creating company:', error);
        return res.status(500).json({ message: 'Failed to create company' });
    }
});
// Update a company
router.put('/:id', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req, res) => {
    const companyId = parseInt(req.params.id);
    const { name, type, contactEmail, contactPhone, address, website, taxNumber, maxUsers, status } = req.body;
    try {
        // Check if company exists and belongs to tenant
        const [existingRows] = await pool.query('SELECT id FROM companies WHERE id = ? AND tenant_id = ?', [companyId, req.user?.tenant_id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        await pool.execute(`UPDATE companies SET 
        name = ?, type = ?, contact_email = ?, contact_phone = ?, address = ?,
        website = ?, tax_number = ?, max_users = ?, status = ?
       WHERE id = ? AND tenant_id = ?`, [
            name,
            type,
            contactEmail || null,
            contactPhone || null,
            address ? JSON.stringify(address) : null,
            website || null,
            taxNumber || null,
            maxUsers,
            status,
            companyId,
            req.user?.tenant_id
        ]);
        return res.json({ message: 'Company updated successfully' });
    }
    catch (error) {
        console.error('Error updating company:', error);
        return res.status(500).json({ message: 'Failed to update company' });
    }
});
// Delete a company
router.delete('/:id', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
    const companyId = parseInt(req.params.id);
    try {
        // Check if company has associated projects
        const [projectRows] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE company_id = ?', [companyId]);
        if (projectRows[0].count > 0) {
            return res.status(400).json({
                message: 'Cannot delete company with associated projects'
            });
        }
        const [result] = await pool.execute('DELETE FROM companies WHERE id = ? AND tenant_id = ?', [companyId, req.user?.tenant_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        return res.json({ message: 'Company deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting company:', error);
        return res.status(500).json({ message: 'Failed to delete company' });
    }
});
// Get company statistics
router.get('/:id/stats', authenticateUser, async (req, res) => {
    const companyId = parseInt(req.params.id);
    try {
        // Verify company belongs to tenant
        const [companyRows] = await pool.query('SELECT id FROM companies WHERE id = ? AND tenant_id = ?', [companyId, req.user?.tenant_id]);
        if (companyRows.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        // Get project statistics
        const [projectStats] = await pool.query(`SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(COALESCE(budget, 0)) as total_budget,
        SUM(COALESCE(spent, 0)) as total_spent
       FROM projects WHERE company_id = ?`, [companyId]);
        // Get invoice statistics
        const [invoiceStats] = await pool.query(`SELECT 
        COUNT(*) as total_invoices,
        SUM(amount_due) as total_amount_due,
        SUM(amount_paid) as total_amount_paid,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_invoices
       FROM invoices WHERE company_id = ?`, [companyId]);
        const stats = {
            projects: projectStats[0],
            invoices: invoiceStats[0]
        };
        return res.json(stats);
    }
    catch (error) {
        console.error('Error fetching company statistics:', error);
        return res.status(500).json({ message: 'Failed to fetch company statistics' });
    }
});
export default router;
