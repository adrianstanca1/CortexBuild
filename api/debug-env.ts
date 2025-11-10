/**
 * Vercel Serverless Function - Debug Environment
 * GET /api/debug-env
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const env = {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
                `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` : 'NOT SET',
            VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?
                `${process.env.VITE_SUPABASE_URL.substring(0, 30)}...` : 'NOT SET',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET',
            JWT_SECRET: process.env.JWT_SECRET ? 'SET (hidden)' : 'NOT SET',
            NODE_ENV: process.env.NODE_ENV || 'NOT SET',
            VERCEL: process.env.VERCEL || 'NOT SET',
            VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET'
        };

        return res.status(200).json({
            success: true,
            environment: env,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
