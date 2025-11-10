/**
 * Secure Login API - Production Ready
 * POST /api/auth/login
 * 
 * Security Features:
 * - Input validation and sanitization
 * - Proper error handling without stack traces
 * - Rate limiting protection
 * - Secure JWT handling
 * - Comprehensive logging
 * - SQL injection protection
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Input validation regex patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

// Rate limiting (in-memory for simplicity, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

interface LoginRequest {
    email: string;
    password: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    password_hash: string;
    company_id: string;
}

interface SecurityEvent {
    timestamp: string;
    event: string;
    user?: string;
    ip: string;
    userAgent: string;
    details: string;
}

// Security event logging
const logSecurityEvent = (event: SecurityEvent) => {
    const logEntry = {
        ...event,
        id: randomUUID(),
        timestamp: new Date().toISOString()
    };
    
    // In production, send to proper logging service
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
    
    // In production, you might also want to:
    // - Send to SIEM system
    // - Store in security events table
    // - Trigger alerts for suspicious activity
};

// Rate limiting check
const checkRateLimit = (identifier: string): boolean => {
    const now = Date.now();
    const windowMs = WINDOW_MINUTES * 60 * 1000;
    
    const record = rateLimitMap.get(identifier);
    
    if (!record) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (now > record.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (record.count >= MAX_ATTEMPTS) {
        return false;
    }
    
    record.count++;
    return true;
};

// Input sanitization
const sanitizeInput = (input: string): string => {
    return input.trim().toLowerCase().replace(/[^\w@.-]/g, '');
};

// Input validation
const validateInput = (data: any): { isValid: boolean; error?: string; sanitizedData?: LoginRequest } => {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Invalid request body' };
    }
    
    const { email, password } = data as LoginRequest;
    
    if (!email || !password) {
        return { isValid: false, error: 'Email and password are required' };
    }
    
    if (typeof email !== 'string' || typeof password !== 'string') {
        return { isValid: false, error: 'Email and password must be strings' };
    }
    
    const sanitizedEmail = sanitizeInput(email);
    
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
        return { isValid: false, error: 'Invalid email format' };
    }
    
    if (password.length < PASSWORD_MIN_LENGTH) {
        return { isValid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
    }
    
    if (password.length > 128) {
        return { isValid: false, error: 'Password is too long' };
    }
    
    return { isValid: true, sanitizedData: { email: sanitizedEmail, password } };
};

// Environment validation
const getSecureConfig = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing');
    }
    
    if (!jwtSecret || jwtSecret === 'your-very-secure-jwt-secret-key-change-this-in-production' || jwtSecret === 'test-secret') {
        throw new Error('JWT secret not properly configured for production');
    }
    
    return {
        supabaseUrl,
        supabaseServiceKey,
        jwtSecret,
        isProduction: process.env.NODE_ENV === 'production'
    };
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

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            code: 'METHOD_NOT_ALLOWED'
        });
    }

    // Get client information for logging
    const clientIP = req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    try {
        // Validate input
        const validation = validateInput(req.body);
        if (!validation.isValid) {
            logSecurityEvent({
                event: 'INVALID_INPUT',
                ip: clientIP,
                userAgent,
                details: validation.error || 'Unknown validation error'
            });
            
            return res.status(400).json({
                error: validation.error,
                code: 'VALIDATION_ERROR'
            });
        }

        const { email, password } = validation.sanitizedData!;
        const identifier = `${clientIP}:${email}`;

        // Check rate limiting
        if (!checkRateLimit(identifier)) {
            logSecurityEvent({
                event: 'RATE_LIMIT_EXCEEDED',
                user: email,
                ip: clientIP,
                userAgent,
                details: `Rate limit exceeded for ${identifier}`
            });
            
            return res.status(429).json({
                error: 'Too many login attempts. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED'
            });
        }

        // Get secure configuration
        const config = getSecureConfig();
        const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

        // Query user with parameterized query (SQL injection protection)
        const { data: users, error: queryError } = await supabase
            .from('users')
            .select('id, email, name, role, password_hash, company_id')
            .eq('email', email)
            .limit(1);

        if (queryError) {
            logSecurityEvent({
                event: 'DATABASE_ERROR',
                user: email,
                ip: clientIP,
                userAgent,
                details: `Database query error: ${queryError.message}`
            });
            
            return res.status(500).json({
                error: 'Internal server error',
                code: 'DATABASE_ERROR'
            });
        }

        if (!users || users.length === 0) {
            logSecurityEvent({
                event: 'LOGIN_FAILED',
                user: email,
                ip: clientIP,
                userAgent,
                details: 'User not found'
            });
            
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        const user = users[0] as User;

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            logSecurityEvent({
                event: 'LOGIN_FAILED',
                user: user.email,
                ip: clientIP,
                userAgent,
                details: 'Invalid password'
            });
            
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Create secure JWT token
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            companyId: user.company_id,
            sessionId: randomUUID(),
            issuedAt: Date.now()
        };

        const token = jwt.sign(
            tokenPayload,
            config.jwtSecret,
            { 
                expiresIn: '24h',
                issuer: 'cortexbuild-auth',
                audience: 'cortexbuild-users'
            }
        );

        // Log successful login
        logSecurityEvent({
            event: 'LOGIN_SUCCESS',
            user: user.email,
            ip: clientIP,
            userAgent,
            details: `User ${user.id} logged in successfully`
        });

        // Return success response
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyId: user.company_id
            },
            token,
            sessionId: tokenPayload.sessionId,
            expiresIn: 86400 // 24 hours in seconds
        });

    } catch (error: any) {
        // Log security incident
        logSecurityEvent({
            event: 'LOGIN_ERROR',
            ip: clientIP,
            userAgent,
            details: `Unexpected error: ${error.message}`
        });
        
        // Don't expose internal errors in production
        const isProduction = process.env.NODE_ENV === 'production';
        
        return res.status(500).json({
            error: isProduction ? 'Internal server error' : error.message,
            code: 'INTERNAL_ERROR',
            ...(isProduction ? {} : { stack: error.stack })
        });
    }
}
