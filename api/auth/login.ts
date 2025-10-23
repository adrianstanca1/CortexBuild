/**
 * Login API Endpoint
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

// Initialize Supabase client
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

// Generate JWT token
function generateToken(user: any): string {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id
    };

    // Use JWT_SECRET from environment or generate a default one
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    return jwt.sign(payload, secret, {
        expiresIn: '7d' // Token expires in 7 days
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Missing credentials',
                details: 'Email and password are required'
            });
        }

        // Hash the provided password
        const hashedPassword = hashPassword(password);

        console.log('🔐 Login attempt:', {
            email: email.toLowerCase(),
            hashedPassword: hashedPassword
        });

        // First, check if user exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id, email, name, role, company_id, status, created_at, password')
            .eq('email', email.toLowerCase())
            .single();

        console.log('👤 User lookup result:', {
            found: !!existingUser,
            error: checkError?.message,
            storedPasswordHash: existingUser?.password,
            providedPasswordHash: hashedPassword,
            passwordsMatch: existingUser?.password === hashedPassword
        });

        if (checkError || !existingUser) {
            return res.status(401).json({
                error: 'Invalid credentials',
                details: 'Email not found'
            });
        }

        // Check if password matches
        if (existingUser.password !== hashedPassword) {
            return res.status(401).json({
                error: 'Invalid credentials',
                details: 'Password is incorrect'
            });
        }

        // Remove password from user object
        const { password: _, ...user } = existingUser;

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({ 
                error: 'Account disabled',
                details: `Your account is ${user.status}. Please contact support.`
            });
        }

        // Update last login timestamp
        await supabase
            .from('users')
            .update({ 
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        // Get company details if user has a company
        let company = null;
        if (user.company_id) {
            const { data: companyData } = await supabase
                .from('companies')
                .select('id, name, email, subscription_plan, status')
                .eq('id', user.company_id)
                .single();
            
            company = companyData;
        }

        // Generate JWT token
        const token = generateToken(user);

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                company_id: user.company_id,
                status: user.status,
                created_at: user.created_at
            },
            company: company
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}

