/**
 * Debug endpoint to test login process step by step
 * GET /api/debug-login
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple CORS handler
function handleCors(req: VercelRequest, res: VercelResponse): boolean {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        
        const results: any = {
            timestamp: new Date().toISOString(),
            environment_check: {
                supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
                supabaseServiceKey: supabaseServiceKey ? 'SET (hidden)' : 'NOT SET',
                urlValid: supabaseUrl.startsWith('http')
            },
            database_connection: null,
            users_table_check: null,
            sessions_table_check: null,
            sample_user_query: null
        };

        // Test database connection
        if (!supabaseUrl || !supabaseServiceKey) {
            results.database_connection = 'FAILED - Missing credentials';
            return res.status(200).json(results);
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        results.database_connection = 'SUCCESS - Client created';

        // Check users table
        try {
            const { data: usersTest, error: usersError } = await supabase
                .from('users')
                .select('id, email, role')
                .limit(5);

            if (usersError) {
                results.users_table_check = {
                    status: 'FAILED',
                    error: usersError.message,
                    code: usersError.code
                };
            } else {
                results.users_table_check = {
                    status: 'SUCCESS',
                    count: usersTest?.length || 0,
                    sample_emails: usersTest?.map(u => u.email) || []
                };
            }
        } catch (err: any) {
            results.users_table_check = {
                status: 'ERROR',
                message: err.message
            };
        }

        // Check sessions table
        try {
            const { data: sessionsTest, error: sessionsError } = await supabase
                .from('sessions')
                .select('id')
                .limit(1);

            if (sessionsError) {
                results.sessions_table_check = {
                    status: 'FAILED',
                    error: sessionsError.message,
                    code: sessionsError.code
                };
            } else {
                results.sessions_table_check = {
                    status: 'SUCCESS',
                    count: sessionsTest?.length || 0
                };
            }
        } catch (err: any) {
            results.sessions_table_check = {
                status: 'ERROR',
                message: err.message
            };
        }

        // Test specific user query (dev@constructco.com)
        try {
            const { data: users, error: queryError } = await supabase
                .from('users')
                .select('*')
                .ilike('email', 'dev@constructco.com')
                .limit(1);

            if (queryError) {
                results.sample_user_query = {
                    status: 'FAILED',
                    error: queryError.message,
                    code: queryError.code
                };
            } else if (!users || users.length === 0) {
                results.sample_user_query = {
                    status: 'USER_NOT_FOUND',
                    message: 'dev@constructco.com not in database'
                };
            } else {
                results.sample_user_query = {
                    status: 'SUCCESS',
                    user: {
                        id: users[0].id,
                        email: users[0].email,
                        role: users[0].role,
                        company_id: users[0].company_id,
                        has_password_hash: !!users[0].password_hash,
                        created_at: users[0].created_at
                    }
                };
            }
        } catch (err: any) {
            results.sample_user_query = {
                status: 'ERROR',
                message: err.message
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
