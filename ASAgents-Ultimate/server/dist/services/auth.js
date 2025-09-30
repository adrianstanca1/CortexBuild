import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import { env } from '../utils/env.js';
async function findUserByEmail(tenantSlug, email) {
    const [rows] = await pool.query(`SELECT u.*, t.slug as tenant_slug
     FROM users u
     INNER JOIN tenants t ON u.tenant_id = t.id
     WHERE t.slug = ? AND u.email = ? AND u.status = 'active'`, [tenantSlug, email]);
    return rows[0] ?? null;
}
export async function authenticate(tenantSlug, email, password) {
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
export async function issueTokens(user) {
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
    await pool.execute(`INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at)
     VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND))`, [user.id, accessToken, refreshToken, env.jwtRefreshExpiresIn]);
    return {
        accessToken,
        refreshToken,
        expiresIn: env.jwtAccessExpiresIn
    };
}
export async function refreshTokens(userId, refreshToken) {
    const [rows] = await pool.query(`SELECT refresh_token, expires_at FROM user_sessions WHERE user_id = ? AND refresh_token = ? AND expires_at > UTC_TIMESTAMP()`, [userId, refreshToken]);
    if (rows.length === 0) {
        throw new Error('Session expired');
    }
    const [userRows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [userId]);
    const user = userRows[0];
    if (!user) {
        throw new Error('User not found');
    }
    await pool.execute(`DELETE FROM user_sessions WHERE user_id = ? AND refresh_token = ?`, [userId, refreshToken]);
    return issueTokens({ ...user, tenant_slug: '' });
}
export async function revokeRefreshToken(refreshToken) {
    await pool.execute(`DELETE FROM user_sessions WHERE refresh_token = ?`, [refreshToken]);
}
export function verifyAccessToken(token) {
    const payload = jwt.verify(token, env.jwtAccessSecret, { issuer: 'asagents-platform' });
    if (typeof payload === 'string') {
        throw new Error('Unexpected token payload');
    }
    const candidate = payload;
    if (typeof candidate.tenant_id !== 'number' ||
        typeof candidate.sub !== 'number' ||
        typeof candidate.role !== 'string') {
        throw new Error('Invalid token payload');
    }
    return {
        ...payload,
        tenant_id: candidate.tenant_id,
        sub: candidate.sub,
        role: candidate.role
    };
}
