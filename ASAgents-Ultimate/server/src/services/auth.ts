import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from './db.js';
import { env } from '../utils/env.js';
import type { AuthenticatedUser, User } from '../types/index.js';

interface AuthenticatedUserRow extends AuthenticatedUser, RowDataPacket {}
interface SessionRow extends RowDataPacket {
  refresh_token: string;
  expires_at: Date;
}
interface UserRow extends User, RowDataPacket {}

type AuthenticatedUserPayload = Express.AuthenticatedUserPayload;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

async function findUserByEmail(tenantSlug: string, email: string): Promise<AuthenticatedUser | null> {
  const [rows] = await pool.query<AuthenticatedUserRow[]>(
    `SELECT u.*, t.slug as tenant_slug
     FROM users u
     INNER JOIN tenants t ON u.tenant_id = t.id
     WHERE t.slug = ? AND u.email = ? AND u.status = 'active'`,
    [tenantSlug, email]
  );
  return rows[0] ?? null;
}

export async function authenticate(tenantSlug: string, email: string, password: string): Promise<{ user: AuthenticatedUser; tokens: TokenPair; }> {
  const user = await findUserByEmail(tenantSlug, email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const tokens = await issueTokens(user);
  return { user, tokens };
}

export async function issueTokens(user: AuthenticatedUser): Promise<TokenPair> {
  const accessToken = jwt.sign({
    sub: user.id,
    tenant_id: user.tenant_id,
    role: user.role
  }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
    issuer: 'asagents-platform'
  });

  const refreshToken = jwt.sign({
    sub: user.id,
    tenant_id: user.tenant_id
  }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
    issuer: 'asagents-platform'
  });

  await pool.execute(
    `INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at)
     VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND))`,
    [user.id, accessToken, refreshToken, env.jwtRefreshExpiresIn]
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: env.jwtAccessExpiresIn
  };
}

export async function refreshTokens(userId: number, refreshToken: string): Promise<TokenPair> {
  const [rows] = await pool.query<SessionRow[]>(
    `SELECT refresh_token, expires_at FROM user_sessions WHERE user_id = ? AND refresh_token = ? AND expires_at > UTC_TIMESTAMP()`,
    [userId, refreshToken]
  );

  if (rows.length === 0) {
    throw new Error('Session expired');
  }

  const [userRows] = await pool.query<UserRow[]>(`SELECT * FROM users WHERE id = ?`, [userId]);
  const user = userRows[0];
  if (!user) {
    throw new Error('User not found');
  }

  await pool.execute(`DELETE FROM user_sessions WHERE user_id = ? AND refresh_token = ?`, [userId, refreshToken]);
  return issueTokens({ ...user, tenant_slug: '' });
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await pool.execute(`DELETE FROM user_sessions WHERE refresh_token = ?`, [refreshToken]);
}

export function verifyAccessToken(token: string): AuthenticatedUserPayload {
  const payload = jwt.verify(token, env.jwtAccessSecret, { issuer: 'asagents-platform' });
  if (typeof payload === 'string') {
    throw new Error('Unexpected token payload');
  }

  const candidate = payload as Partial<AuthenticatedUserPayload>;
  if (
    typeof candidate.tenant_id !== 'number' ||
    typeof candidate.sub !== 'number' ||
    typeof candidate.role !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  return {
    ...payload,
    tenant_id: candidate.tenant_id,
    sub: candidate.sub,
    role: candidate.role
  } as AuthenticatedUserPayload;
}
