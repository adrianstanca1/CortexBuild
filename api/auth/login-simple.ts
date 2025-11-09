/**
 * Simplified Vercel Serverless Function - Login
 * POST /api/auth/login-simple
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        console.log('Login attempt for:', email);

        // Find user in Supabase
        const { data: users, error: queryError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .limit(1);

        if (queryError) {
            console.error('Supabase query error:', queryError);
            return res.status(500).json({
                success: false,
                error: 'Database error',
                details: queryError.message
            });
        }

        if (!users || users.length === 0) {
            console.log('User not found:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = users[0];
        console.log('User found:', user.email);

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            console.log('Invalid password for:', email);
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

        const { error: sessionError } = await supabase
            .from('sessions')
            .insert({
                id: sessionId,
                user_id: user.id,
                token: token,
                expires_at: expiresAt.toISOString()
            });

        if (sessionError) {
            console.warn('Failed to create session:', sessionError);
            // Continue anyway - session creation is not critical for login
        }

        // Return success response
        console.log('Login successful for:', email);
        return res.status(200).json({
            success: true,
            token,
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
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}

