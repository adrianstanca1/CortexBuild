/**
 * Token Verification API Endpoint
 * POST /api/auth/verify
 * Verifies JWT token and returns user data
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
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
        const { token } = req.body;

        // Validate token presence
        if (!token) {
            return res.status(400).json({ 
                error: 'Missing token',
                details: 'Token is required'
            });
        }

        // Verify JWT token
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        
        let decoded: any;
        try {
            decoded = jwt.verify(token, secret);
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: 'Token expired',
                    details: 'Your session has expired. Please login again.'
                });
            }
            return res.status(401).json({ 
                error: 'Invalid token',
                details: 'Token verification failed'
            });
        }

        // Get fresh user data from database
        const { data: user, error: queryError } = await supabase
            .from('users')
            .select('id, email, name, role, company_id, status, created_at')
            .eq('id', decoded.id)
            .single();

        if (queryError || !user) {
            return res.status(404).json({ 
                error: 'User not found',
                details: 'User associated with this token does not exist'
            });
        }

        // Check if user is still active
        if (user.status !== 'active') {
            return res.status(403).json({ 
                error: 'Account disabled',
                details: `Your account is ${user.status}. Please contact support.`
            });
        }

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

        // Return user data
        return res.status(200).json({
            success: true,
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
        console.error('Token verification error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}

