/**
 * Token Refresh API Endpoint
 * POST /api/auth/refresh
 * 
 * Security Features:
 * - JWT token validation and refresh
 * - Session management
 * - Rate limiting protection
 * - Structured logging
 * - SQL injection protection
 */

import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN_EXPIRY = '24h';
const REFRESH_WINDOW_MINUTES = 30;
const MAX_REFRESH_ATTEMPTS = 3;

// Simple rate limiting for refresh tokens
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Environment validation
const getSecureConfig = () => {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret || 
        jwtSecret === 'your-very-secure-jwt-secret-key-change-this-in-production' || 
        jwtSecret === 'test-secret' ||
        jwtSecret === 'cortexbuild-secret-2025') {
        throw new Error('JWT secret not properly configured for production');
    }
    
    return { jwtSecret, isProduction: process.env.NODE_ENV === 'production' };
};

// Rate limiting check
const checkRefreshRateLimit = (identifier: string): boolean => {
    const now = Date.now();
    const windowMs = REFRESH_WINDOW_MINUTES * 60 * 1000;
    
    const record = rateLimitMap.get(identifier);
    
    if (!record) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (now > record.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (record.count >= MAX_REFRESH_ATTEMPTS) {
        return false;
    }
    
    record.count++;
    return true;
};

// Security event logging
const logSecurityEvent = (event: string, details: any) => {
    const logEntry = {
        event,
        timestamp: new Date().toISOString(),
        ...details
    };
    
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set security headers
    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || '*' : '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed',
            code: 'METHOD_NOT_ALLOWED'
        });
    }

    const clientIP = req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string || 'unknown';
    
    try {
        // Get secure configuration
        const config = getSecureConfig();

        // Rate limiting
        const identifier = `${clientIP}:${req.headers.authorization?.split(' ')[1]?.slice(-10) || 'unknown'}`;
        if (!checkRefreshRateLimit(identifier)) {
            logSecurityEvent('REFRESH_RATE_LIMIT_EXCEEDED', { ip: clientIP, identifier });
            return res.status(429).json({
                success: false,
                error: 'Too many refresh attempts. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED'
            });
        }

        // Extract and validate token
        const authHeader = req.headers.authorization;
        const oldToken = authHeader?.replace('Bearer ', '');

        if (!oldToken) {
            logSecurityEvent('REFRESH_MISSING_TOKEN', { ip: clientIP });
            return res.status(401).json({
                success: false,
                error: 'Authentication token is required',
                code: 'MISSING_TOKEN'
            });
        }

        // Verify JWT (allow expired tokens for refresh)
        let payload: { userId: string; email: string; role?: string };
        try {
            payload = jwt.verify(oldToken, config.jwtSecret, { ignoreExpiration: true }) as { userId: string; email: string; role?: string };
        } catch (jwtError: any) {
            logSecurityEvent('REFRESH_INVALID_TOKEN', { ip: clientIP, error: jwtError.message });
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }

        // Check if session exists (SQL injection protected)
        const { rows: sessions } = await sql`
            SELECT * FROM sessions 
            WHERE token = ${oldToken} AND expires_at > NOW()
            LIMIT 1
        `;

        if (sessions.length === 0) {
            logSecurityEvent('REFRESH_SESSION_NOT_FOUND', { userId: payload.userId, ip: clientIP });
            return res.status(401).json({
                success: false,
                error: 'Session not found or expired. Please login again.',
                code: 'SESSION_NOT_FOUND'
            });
        }

        // Get user (SQL injection protected)
        const { rows: users } = await sql`
            SELECT id, email, name, role, avatar, company_id 
            FROM users 
            WHERE id = ${payload.userId}
            LIMIT 1
        `;

        if (users.length === 0) {
            logSecurityEvent('REFRESH_USER_NOT_FOUND', { userId: payload.userId, ip: clientIP });
            return res.status(401).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = users[0];

        // Generate new JWT token
        const newToken = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role,
                companyId: user.company_id,
                sessionId: uuidv4(),
                issuedAt: Date.now()
            },
            config.jwtSecret,
            { 
                expiresIn: TOKEN_EXPIRY,
                issuer: 'cortexbuild-auth',
                audience: 'cortexbuild-users'
            }
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

        logSecurityEvent('REFRESH_SUCCESS', { 
            userId: user.id, 
            email: user.email,
            ip: clientIP 
        });

        return res.status(200).json({
            success: true,
            token: newToken,
            sessionId,
            expiresAt: expiresAt.toISOString(),
            expiresIn: 86400, // 24 hours in seconds
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
        logSecurityEvent('REFRESH_ERROR', { ip: clientIP, error: error.message });
        
        const isProduction = process.env.NODE_ENV === 'production';
        
        return res.status(500).json({
            success: false,
            error: isProduction ? 'Internal server error' : error.message,
            code: 'INTERNAL_ERROR',
            ...(isProduction ? {} : { stack: error.stack })
        });
    }
}