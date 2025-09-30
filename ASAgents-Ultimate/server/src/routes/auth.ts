import { Router } from 'express';
import bcrypt from 'bcrypt';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { authenticate, refreshTokens, revokeRefreshToken, issueTokens } from '../services/auth.js';
import { pool } from '../services/db.js';
import { authenticateUser, type AuthenticatedRequest } from '../middleware/authenticate.js';

interface PasswordHashRow extends RowDataPacket {
  password_hash: string;
}

const router = Router();

router.post('/register', async (req, res) => {
  const { tenant, email, password, firstName, lastName, companyName } = req.body ?? {};
  if (!tenant || !email || !password || !firstName || !lastName) {
    return res.status(400).json({
      message: 'tenant, email, password, firstName and lastName are required'
    });
  }

  try {
    // Check if tenant exists
    const [tenantRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM tenants WHERE slug = ? AND is_active = 1',
      [tenant]
    );

    if (tenantRows.length === 0) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const tenantId = tenantRows[0].id;

    // Check if email already exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND tenant_id = ?',
      [email, tenantId]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (
        tenant_id, email, password_hash, first_name, last_name, role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, email, passwordHash, firstName, lastName, 'viewer', 'active']
    );

    // Get the created user with tenant info
    const [userRows] = await pool.query<RowDataPacket[]>(
      `SELECT u.*, t.slug as tenant_slug
       FROM users u
       INNER JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = ?`,
      [result.insertId]
    );

    const user = userRows[0];
    const tokens = await issueTokens(user);

    return res.status(201).json({
      user: {
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      tokens,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { tenant, email, password } = req.body ?? {};
  if (!tenant || !email || !password) {
    return res.status(400).json({ message: 'tenant, email and password are required' });
  }

  try {
    const { user, tokens } = await authenticate(tenant, email, password);
    return res.json({
      user: {
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      tokens
    });
  } catch (error) {
    return res.status(401).json({ message: (error as Error).message });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken required' });
  }

  try {
    const payload = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64url').toString());
    const tokens = await refreshTokens(Number(payload.sub), refreshToken);
    return res.json(tokens);
  } catch (error) {
    return res.status(401).json({ message: (error as Error).message });
  }
});

router.post('/logout', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { refreshToken } = req.body ?? {};
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  return res.status(204).send();
});

router.post('/change-password', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const [rows] = await pool.query<PasswordHashRow[]>(`SELECT password_hash FROM users WHERE id = ?`, [req.user.sub]);
  const user = rows[0];
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  const nextHash = await bcrypt.hash(newPassword, 12);
  await pool.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [nextHash, req.user.sub]);
  return res.status(204).send();
});

export default router;
