/**
 * Vercel Serverless Function - Enhanced Login
 * POST /api/auth/login
 *
 * Features:
 * - Rate limiting (5 attempts per 15 minutes)
 * - Request validation
 * - Structured logging
 * - Security headers
 * - Enhanced error handling
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../middleware/cors';
import { setSecurityHeaders, validateJwtSecret, getClientIp } from '../middleware/security';
import { logger, logRequest, logResponse } from '../middleware/logger';
import { validate, emailRule, passwordRule } from '../middleware/validation';
import { loginRateLimit } from '../middleware/rateLimit';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const startTime = Date.now();

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
        // Validate JWT secret
        validateJwtSecret();

        const { email, password } = req.body;
        const clientIp = getClientIp(req);

        logRequest('POST', '/api/auth/login', { email, ip: clientIp });

        // Validate input
        const validationErrors = validate(req.body, [emailRule, passwordRule]);
        if (validationErrors.length > 0) {
            logger.warn('Validation failed', { errors: validationErrors, ip: clientIp });
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: validationErrors
            });
        }

        // Rate limiting
        const rateLimitResult = loginRateLimit(clientIp);
        res.setHeader('X-RateLimit-Limit', '5');
        res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

        if (!rateLimitResult.allowed) {
            logger.warn('Rate limit exceeded', { email, ip: clientIp });
            return res.status(429).json({
                success: false,
                error: 'Too many login attempts. Please try again later.',
                retryAfter: new Date(rateLimitResult.resetTime).toISOString()
            });
        }

        // Find user in Supabase
        const { data: users, error: queryError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .limit(1);

        if (queryError || !users || users.length === 0) {
            logger.warn('Login failed: User not found', { email, ip: clientIp, error: queryError });
            // Use same error message to prevent user enumeration
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            logger.warn('Login failed: Invalid password', { email, ip: clientIp });
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
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Create session in Supabase
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const { error: sessionError } = await supabase
            .from('sessions')
            .insert({
                id: sessionId,
                user_id: user.id,
                token: token,
                expires_at: expiresAt.toISOString()
            });

        if (sessionError) {
            logger.warn('Failed to create session', { error: sessionError, userId: user.id });
            // Continue anyway - session creation is not critical for login
        }

        logger.info('Login successful', {
            userId: user.id,
            email: user.email,
            ip: clientIp
        });

        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/login', 200, duration);

        // Return user data (without password) and token
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                companyId: user.company_id
            },
            token,
            expiresAt: expiresAt.toISOString()
        });
    } catch (error: any) {
        logger.error('Login error', error, { ip: getClientIp(req) });

        const duration = Date.now() - startTime;
        logResponse('POST', '/api/auth/login', 500, duration);

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
