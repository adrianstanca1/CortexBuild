/**
 * Reset user password
 * POST /api/reset-password
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const { email, newPassword } = req.body;
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Hash the new password
        const newHash = await bcrypt.hash(newPassword, 10);

        // Update the user
        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: newHash })
            .ilike('email', email)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Test the new password
        const testMatch = await bcrypt.compare(newPassword, newHash);

        return res.status(200).json({
            success: true,
            updated: data?.length || 0,
            test_match: testMatch
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
