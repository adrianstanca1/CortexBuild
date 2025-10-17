/**
 * Vercel Serverless Function - Health Check
 * GET /api/health
 * 
 * Features:
 * - Database connectivity check
 * - System status
 * - Version information
 * - Uptime tracking
 */

import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './middleware/cors';
import { setSecurityHeaders } from './middleware/security';

const startupTime = Date.now();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res);
    
    if (handleCors(req, res)) {
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed' 
        });
    }

    const checks: any = {
        api: 'healthy',
        database: 'unknown',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startupTime) / 1000),
        version: '2.0.0'
    };

    try {
        // Check database connectivity
        const { rows } = await sql`SELECT 1 as health`;
        checks.database = rows.length > 0 ? 'healthy' : 'unhealthy';
        
        // Get database stats
        const { rows: userCount } = await sql`SELECT COUNT(*) as count FROM users`;
        const { rows: sessionCount } = await sql`SELECT COUNT(*) as count FROM sessions`;
        const { rows: companyCount } = await sql`SELECT COUNT(*) as count FROM companies`;
        
        checks.stats = {
            users: parseInt(userCount[0].count),
            sessions: parseInt(sessionCount[0].count),
            companies: parseInt(companyCount[0].count)
        };

        const allHealthy = checks.api === 'healthy' && checks.database === 'healthy';

        return res.status(allHealthy ? 200 : 503).json({
            success: allHealthy,
            ...checks
        });
    } catch (error: any) {
        checks.database = 'unhealthy';
        checks.error = error.message;

        return res.status(503).json({
            success: false,
            ...checks
        });
    }
}

