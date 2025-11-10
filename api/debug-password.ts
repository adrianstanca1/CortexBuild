/**
 * Debug endpoint to test password verification
 * POST /api/debug-password
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple CORS handler
function handleCors(req: VercelRequest, res: VercelResponse): boolean {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS
    if (handleCors(req, res)) {
        return;
    }

    try {
        const { email } = req.body || { email: 'dev@constructco.com' };
        const password = 'parola123'; // Test password
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        
        const results: any = {
            timestamp: new Date().toISOString(),
            test_email: email,
            test_password: 'parola123',
            steps: {}
        };

        // Step 1: Check environment
        results.steps.env_check = {
            supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
            supabaseKey: supabaseServiceKey ? 'SET' : 'NOT SET'
        };

        if (!supabaseUrl || !supabaseServiceKey) {
            return res.status(500).json({ ...results, error: 'Environment not configured' });
        }

        // Step 2: Create client
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        results.steps.client_created = 'SUCCESS';

        // Step 3: Query user
        const { data: users, error: queryError } = await supabase
            .from('users')
            .select('*')
            .ilike('email', email)
            .limit(1);

        if (queryError) {
            results.steps.user_query = {
                status: 'FAILED',
                error: queryError.message
            };
            return res.status(500).json(results);
        }

        if (!users || users.length === 0) {
            results.steps.user_query = {
                status: 'USER_NOT_FOUND'
            };
            return res.status(404).json(results);
        }

        const user = users[0];
        results.steps.user_query = {
            status: 'SUCCESS',
            user_id: user.id,
            user_email: user.email,
            user_role: user.role,
            has_password_hash: !!user.password_hash,
            password_hash_preview: user.password_hash ? `${user.password_hash.substring(0, 20)}...` : 'NULL'
        };

        // Step 4: Test bcrypt compare
        try {
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            results.steps.password_verification = {
                status: 'SUCCESS',
                result: isValidPassword ? 'MATCH' : 'NO_MATCH'
            };
        } catch (bcryptError: any) {
            results.steps.password_verification = {
                status: 'ERROR',
                error: bcryptError.message,
                stack: bcryptError.stack
            };
        }

        return res.status(200).json(results);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
