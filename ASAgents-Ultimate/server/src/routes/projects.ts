import { Router } from 'express';
import { authenticateUser, type AuthenticatedRequest, requireRole } from '../middleware/authenticate.js';
import { pool } from '../services/db.js';

const router = Router();

router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const [rows] = await pool.query(
    `SELECT id, code, name, status, budget, start_date, end_date
     FROM projects WHERE tenant_id = ? ORDER BY start_date DESC`,
    [req.user?.tenant_id]
  );
  return res.json(rows);
});

router.post('/', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req: AuthenticatedRequest, res) => {
  const { code, name, description, status, budget, startDate, endDate } = req.body ?? {};
  if (!code || !name) {
    return res.status(400).json({ message: 'code and name are required' });
  }

  const [result] = await pool.execute(
    `INSERT INTO projects (tenant_id, owner_id, code, name, description, status, budget, start_date, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user?.tenant_id,
      req.user?.sub,
      code,
      name,
      description ?? null,
      status ?? 'draft',
      budget ?? null,
      startDate ?? null,
      endDate ?? null
    ]
  );

  return res.status(201).json({ id: (result as any).insertId });
});

router.patch('/:id', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req: AuthenticatedRequest, res) => {
  const updates: string[] = [];
  const values: unknown[] = [];

  const allowed = {
    name: 'name',
    description: 'description',
    status: 'status',
    budget: 'budget',
    startDate: 'start_date',
    endDate: 'end_date'
  } as const;

  for (const [key, column] of Object.entries(allowed)) {
    if (req.body?.[key] !== undefined) {
      updates.push(`${column} = ?`);
      values.push(req.body[key]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No updates provided' });
  }

  values.push(req.params.id, req.user?.tenant_id);
  await pool.execute(
    `UPDATE projects SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`,
    values
  );

  return res.status(204).send();
});

export default router;
