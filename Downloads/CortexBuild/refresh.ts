/**
 * Vercel Serverless Function - Refresh Token
 * POST /api/auth/refresh
 * 
 * Features:
 * - Token refresh without re-login
 * - Session extension
 * - Rate limiting
 * - Security headers
 * - Structured logging
 */

import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../middleware/cors';
import { setSecurityHeaders, validateJwtSecret, getClientIp } from '../middleware/security';
import { logger, logRequest, logResponse } from '../middleware/logger';
import { apiRateLimit } from '../middleware/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const startTime = Date.now();
    
    setSecurityHeaders(res);
    
    if (handleCors(req, res)) {
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed' 
        });
    }

    try {
        validateJwtSecret();

        const clientIp = getClientIp(req);
        logRequest('POST', '/api/auth/refresh', { ip: clientIp });

        // Rate limiting
        const rateLimitResult = apiRateLimit(clientIp);
        res.setHeader('X-RateLimit-Limit', '60');
        res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

        if (!rateLimitResult.allowed) {
            logger.warn('Rate limit exceeded', { ip: clientIp });
            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.',
                retryAfter: new Date(rateLimitResult.resetTime).toISOString()
            });
        }

        // Extract old token
        const authHeader = req.headers.authorization;
        const oldToken = authHeader?.replace('Bearer ', '');

        if (!oldToken) {
            logger.warn('Missing token', { ip: clientIp });
            return res.status(401).json({
                success: false,
                error: 'Authentication token is required'
            });
        }

        // Verify old JWT (allow expired tokens for refresh)
        let payload: { userId: string; email: string; role?: string };
        try {
            payload = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true }) as { userId: string; email: string; role?: string };
        } catch (jwtError: any) {
            logger.warn('Invalid JWT token', { error: jwtError.message, ip: clientIp });
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }

        // Check if old session exists
        const { rows: sessions } = await sql`
            SELECT * FROM sessions WHERE token = ${oldToken} LIMIT 1
        `;

        if (sessions.length === 0) {
            logger.warn('Session not found for refresh', { userId: payload.userId, ip: clientIp });
            return res.status(401).json({
                success: false,
                error: 'Session not found. Please login again.'
            });
        }

        // Get user
        const { rows: users } = await sql`
            SELECT * FROM users WHERE id = ${payload.userId} LIMIT 1
        `;

        if (users.length === 0) {
            logger.warn('User not found', { userId: payload.userId, ip: clientIp });
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        const user = users[0];

        // Generate new JWT token
        const newToken = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Delete old session
        await sql`DELETE FROM sessions WHERE token = ${oldToken}`;

        // Create new session
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await sql`
            INSERT INTO sessions (id, user_id, token, expires_at)
            VALUES (${sessionId}, ${user.id}, ${newToken}, ${expiresAt.toISOString()})
        `;

        logger.info('Token refreshed', { 
            userId: user.id, 
            email: user.email,
            ip: clientIp 
        });

        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/refresh', 200, duration);

        return res.status(200).json({
            success: true,
            token: newToken,
            expiresAt: expiresAt.toISOString(),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                companyId: user.company_id
            }
        });
    } catch (error: any) {
        logger.error('Token refresh error', error, { ip: getClientIp(req) });
        
        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/refresh', 500, duration);
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

