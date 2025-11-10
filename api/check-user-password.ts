/**
 * Check specific user password
 * POST /api/check-user-password
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const { email } = req.body;
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: users } = await supabase
            .from('users')
            .select('id, email, role, password_hash')
            .ilike('email', email)
            .limit(1);

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        
        // Test different passwords
        const testPasswords = ['Lolozania1', 'parola123', 'lolozania1'];
        const results = {};
        
        for (const pwd of testPasswords) {
            results[pwd] = await bcrypt.compare(pwd, user.password_hash);
        }

        return res.status(200).json({
            user: {
                email: user.email,
                role: user.role,
                hash_length: user.password_hash.length
            },
            password_tests: results
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
