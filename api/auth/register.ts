/**
 * Registration API Endpoint
 * POST /api/auth/register
 * Creates a new user account with hashed password
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// Initialize Supabase client with service role key for admin operations
// Note: VITE_ prefix is only for frontend, use plain env vars for serverless functions
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
    });
}

const supabase = createClient(
    supabaseUrl!,
    supabaseServiceKey!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Hash password using SHA-256
function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Validate email format
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password, name, role, company_id } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Email, password, and name are required'
            });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format'
            });
        }

        // Validate password strength
        const passwordValidation = isValidPassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ 
                error: 'Invalid password',
                details: passwordValidation.message
            });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return res.status(409).json({ 
                error: 'User already exists',
                details: 'An account with this email already exists'
            });
        }

        // Hash the password
        const hashedPassword = hashPassword(password);

        // Create the user
        const userId = crypto.randomUUID();
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: email.toLowerCase(),
                name: name,
                password: hashedPassword,
                role: role || 'user',
                company_id: company_id || null,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id, email, name, role, company_id, status, created_at')
            .single();

        if (insertError) {
            console.error('Error creating user:', insertError);
            return res.status(500).json({ 
                error: 'Failed to create user',
                details: insertError.message
            });
        }

        // Return success response (without password)
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: newUser
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}

