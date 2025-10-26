import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './utils/auth';

interface ProjectMetrics {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    spentBudget: number;
    remainingBudget: number;
    totalTasks: number;
    completedTasks: number;
    totalTimeSpent: number;
    averageProjectDuration: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const user = verifyAuth(req);
        const { timeRange = '30d' } = req.query;

        // Mock analytics data - in production, fetch from database
        const metrics: ProjectMetrics = {
            totalProjects: 24,
            activeProjects: 8,
            completedProjects: 16,
            totalBudget: 2500000,
            spentBudget: 1850000,
            remainingBudget: 650000,
            totalTasks: 342,
            completedTasks: 278,
            totalTimeSpent: 2840, // minutes
            averageProjectDuration: 45, // days
        };

        return res.status(200).json({
            success: true,
            metrics,
            timeRange,
        });
    } catch (error: any) {
        console.error('Analytics API error:', error);
        
        if (error.message === 'No token provided') {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
