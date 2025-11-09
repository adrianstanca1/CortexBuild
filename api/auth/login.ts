/**
 * Vercel Serverless Function - Login with Enhanced Security
 * POST /api/auth/login
 *
 * Features:
 * - Rate limiting (5 attempts per 15 minutes)
 * - Input validation & email sanitization
 * - Password verification with bcrypt
 * - JWT token generation
 * - Session management
 * - Structured logging
 * - Security headers
 * - CORS protection
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../middleware/cors';
import { setSecurityHeaders, validateJwtSecret, getClientIp } from '../middleware/security';
import { logger, logRequest, logResponse } from '../middleware/logger';
import { loginRateLimit } from '../middleware/rateLimit';
import { validate, emailRule, passwordRule } from '../middleware/validation';

const TOKEN_EXPIRY = '24h';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get environment variables with fallbacks
 */
function getEnvConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const jwtSecret = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

    return { supabaseUrl, supabaseServiceKey, jwtSecret };
}

/**
 * Normalize and sanitize email
 */
function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

/**
 * Build user response object
 */
function buildUserResponse(user: any) {
    return {
        id: user.id,
        email: user.email,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        role: user.role,
        avatar: user.avatar_url || user.avatar || '',
        company_id: user.company_id
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const startTime = Date.now();
    const clientIp = getClientIp(req);

    // Set security headers
    setSecurityHeaders(res);

    // Handle CORS
    if (handleCors(req, res)) {
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        logRequest('POST', '/api/auth/login', { ip: clientIp });

        // Validate JWT secret
        validateJwtSecret();

        // Rate limiting
        const rateLimitResult = loginRateLimit(clientIp);
        res.setHeader('X-RateLimit-Limit', '5');
        res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

        if (!rateLimitResult.allowed) {
            logger.warn('Login rate limit exceeded', { ip: clientIp });
            return res.status(429).json({
                success: false,
                error: 'Too many login attempts. Please try again later.',
                retryAfter: new Date(rateLimitResult.resetTime).toISOString()
            });
        }

        // Extract and validate input
        const { email: rawEmail, password } = req.body;

        // Input validation
        const validationErrors = validate(
            { email: rawEmail, password },
            [emailRule, passwordRule]
        );

        if (validationErrors.length > 0) {
            logger.warn('Login validation failed', {
                ip: clientIp,
                errors: validationErrors
            });
            return res.status(400).json({
                success: false,
                error: 'Invalid email or password format'
            });
        }

        const email = normalizeEmail(rawEmail);

        // Get environment config
        const { supabaseUrl, supabaseServiceKey, jwtSecret } = getEnvConfig();

        // Validate Supabase configuration
        if (!supabaseUrl || !supabaseServiceKey) {
            logger.error('Supabase not configured', new Error('Missing Supabase config'));
            return res.status(500).json({
                success: false,
                error: 'Service temporarily unavailable'
            });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Query user
        const { data: users, error: queryError } = await supabase
            .from('users')
            .select('*')
            .ilike('email', email)
            .limit(1);

        if (queryError) {
            logger.error('Database query error', new Error(queryError.message), { ip: clientIp });
            return res.status(500).json({
                success: false,
                error: 'Service temporarily unavailable'
            });
        }

        if (!users || users.length === 0) {
            logger.warn('User not found', { ip: clientIp });
            // Use generic message to prevent user enumeration
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Verify password
        let isValidPassword = false;
        try {
            isValidPassword = await bcrypt.compare(password, user.password_hash);
        } catch (bcryptError) {
            logger.error('Password verification error', bcryptError as Error, { ip: clientIp });
            return res.status(500).json({
                success: false,
                error: 'Service temporarily unavailable'
            });
        }

        if (!isValidPassword) {
            logger.warn('Invalid password', { ip: clientIp });
            // Use generic message to prevent user enumeration
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                companyId: user.company_id
            },
            jwtSecret,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Create session
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

        const { error: sessionError } = await supabase
            .from('sessions')
            .insert({
                id: sessionId,
                user_id: user.id,
                token: token,
                expires_at: expiresAt.toISOString()
            });

        if (sessionError) {
            logger.warn('Session creation failed', { userId: user.id, error: sessionError.message });
            // Non-fatal: continue with login even if session creation fails
        }

        logger.info('Login successful', {
            userId: user.id,
            email: user.email,
            ip: clientIp
        });

        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/login', 200, duration);

        // Return success with token and user data
        return res.status(200).json({
            success: true,
            user: buildUserResponse(user),
            token,
            expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS).toISOString()
        });

    } catch (error: any) {
        logger.error('Login endpoint error', error, { ip: clientIp });

        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/login', 500, duration);

        return res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.'
        });
    }
}
