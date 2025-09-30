import { Router } from 'express';
import { authenticateUser, requireRole } from '../middleware/authenticate.js';
import { pool } from '../services/db.js';
const router = Router();
router.get('/', authenticateUser, async (req, res) => {
    const [rows] = await pool.query(`SELECT id, client_name, amount_due, amount_paid, currency, due_date, status
     FROM invoices WHERE tenant_id = ? ORDER BY due_date ASC`, [req.user?.tenant_id]);
    return res.json(rows);
});
router.post('/', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req, res) => {
    const { clientName, clientEmail, projectId, amountDue, currency, dueDate, notes } = req.body ?? {};
    if (!clientName || !amountDue || !currency || !dueDate) {
        return res.status(400).json({ message: 'Missing invoice fields' });
    }
    const [result] = await pool.execute(`INSERT INTO invoices (tenant_id, project_id, client_name, client_email, amount_due, amount_paid, currency, due_date, issued_date, status, notes)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, UTC_DATE(), 'sent', ?)`, [
        req.user?.tenant_id,
        projectId ?? null,
        clientName,
        clientEmail ?? null,
        amountDue,
        currency,
        dueDate,
        notes ?? null
    ]);
    return res.status(201).json({ id: result.insertId });
});
router.patch('/:id/payments', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req, res) => {
    const { amount, method, reference } = req.body ?? {};
    if (!amount) {
        return res.status(400).json({ message: 'Payment amount required' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute(`INSERT INTO payments (invoice_id, amount, paid_at, method, reference)
       VALUES (?, ?, UTC_TIMESTAMP(), ?, ?)`, [req.params.id, amount, method ?? 'bank_transfer', reference ?? null]);
        await connection.execute(`UPDATE invoices SET amount_paid = amount_paid + ?, status = CASE WHEN amount_paid + ? >= amount_due THEN 'paid' ELSE status END
       WHERE id = ? AND tenant_id = ?`, [amount, amount, req.params.id, req.user?.tenant_id]);
        await connection.commit();
        return res.status(204).send();
    }
    catch (error) {
        await connection.rollback();
        return res.status(500).json({ message: error.message });
    }
    finally {
        connection.release();
    }
});
export default router;
