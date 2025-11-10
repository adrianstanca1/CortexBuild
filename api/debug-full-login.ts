/**
 * Debug endpoint to test full login flow step by step
 * POST /api/debug-full-login
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
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
        const { email, password } = req.body || { email: 'dev@constructco.com', password: 'parola123' };
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';
        
        const results: any = {
            timestamp: new Date().toISOString(),
            test_email: email,
            steps: {}
        };

        // Step 1: Environment check
        if (!supabaseUrl || !supabaseServiceKey) {
            results.error = 'Environment not configured';
            return res.status(500).json(results);
        }
        results.steps.env_check = 'SUCCESS';

        // Step 2: Create Supabase client
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
            results.steps.user_query = { status: 'USER_NOT_FOUND' };
            return res.status(404).json(results);
        }

        const user = users[0];
        results.steps.user_query = 'SUCCESS';

        // Step 4: Verify password
        try {
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                results.steps.password_verification = 'FAILED - Password mismatch';
                return res.status(401).json(results);
            }
            results.steps.password_verification = 'SUCCESS';
        } catch (bcryptError: any) {
            results.steps.password_verification = {
                status: 'ERROR',
                error: bcryptError.message
            };
            return res.status(500).json(results);
        }

        // Step 5: Generate JWT token
        try {
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    companyId: user.company_id
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            results.steps.jwt_creation = {
                status: 'SUCCESS',
                token_preview: `${token.substring(0, 30)}...`
            };
        } catch (jwtError: any) {
            results.steps.jwt_creation = {
                status: 'ERROR',
                error: jwtError.message,
                stack: jwtError.stack
            };
            return res.status(500).json(results);
        }

        // Step 6: Create session
        try {
            const sessionId = uuidv4();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    companyId: user.company_id
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            const { error: sessionError } = await supabase
                .from('sessions')
                .insert({
                    id: sessionId,
                    user_id: user.id,
                    token: token,
                    expires_at: expiresAt.toISOString()
                });

            if (sessionError) {
                results.steps.session_creation = {
                    status: 'FAILED',
                    error: sessionError.message,
                    code: sessionError.code
                };
                // Continue anyway - session creation is non-fatal
            } else {
                results.steps.session_creation = 'SUCCESS';
            }
        } catch (sessionErr: any) {
            results.steps.session_creation = {
                status: 'ERROR',
                error: sessionErr.message
            };
        }

        // Step 7: Build response
        results.steps.response_built = 'SUCCESS';
        results.final_result = 'ALL_STEPS_SUCCESSFUL';

        return res.status(200).json(results);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
