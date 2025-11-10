/**
 * Vercel Serverless Function - Login
 * POST /api/auth/login-new
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN_EXPIRY = '24h';

// Simple CORS handler
function handleCors(req: VercelRequest, res: VercelResponse): boolean {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const startTime = Date.now();

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
        // Get environment variables inside handler
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

        const { email, password } = req.body;

        console.log('🔐 [Login] Attempt:', email);

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Check if Supabase is configured
        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ Supabase not configured');
            return res.status(500).json({
                success: false,
                error: 'Database not configured. Please contact administrator.'
            });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Find user in Supabase
        const { data: users, error: queryError } = await supabase
            .from('users')
            .select('*')
            .ilike('email', email)
            .limit(1);

        if (queryError) {
            console.error('❌ Database query error:', queryError);
            return res.status(500).json({
                success: false,
                error: 'Database error occurred'
            });
        }

        if (!users || users.length === 0) {
            console.warn('⚠️  User not found:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            console.warn('⚠️  Invalid password for:', email);
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
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Create session in Supabase
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await supabase
            .from('sessions')
            .insert({
                id: sessionId,
                user_id: user.id,
                token: token,
                expires_at: expiresAt.toISOString()
            })
            .catch(err => {
                console.warn('⚠️  Session creation failed:', err);
                // Non-fatal - continue with login
            });

        console.log('✅ Login successful:', user.email, `(${Date.now() - startTime}ms)`);

        // Return user data (without password) and token
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
                role: user.role,
                avatar: user.avatar_url || user.avatar || '',
                company_id: user.company_id
            },
            token
        });
    } catch (error: any) {
        console.error('❌ Login error:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.'
        });
    }
}
