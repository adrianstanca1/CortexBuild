/**
 * Test endpoint to debug request body parsing
 * POST /api/test-login
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('Test login - Method:', req.method);
        console.log('Test login - Headers:', JSON.stringify(req.headers));
        console.log('Test login - Body:', JSON.stringify(req.body));

        const { email, password } = req.body || {};

        return res.status(200).json({
            success: true,
            received: {
                method: req.method,
                hasBody: !!req.body,
                bodyType: typeof req.body,
                email: email || 'NOT PROVIDED',
                password: password ? '***' : 'NOT PROVIDED',
                rawBody: req.body
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
}
