import express, { Request, Response } from 'express';
import { db } from '../database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface App {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    version: string;
    installation_type: 'individual' | 'company';
    status: 'active' | 'inactive' | 'pending';
    installed_at: string;
    code?: string;
}

// Extend the Express Request type to include the user property
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        company_id?: string;
        role: string;
    };
}

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication failed.' });
    }

    try {
        // Get individually installed apps
        const userAppsQuery = db.prepare(`
            SELECT sa.*, uai.installed_at, 'individual' as installation_type, uai.status
            FROM sdk_apps sa
            JOIN user_app_installations uai ON sa.id = uai.app_id
            WHERE uai.user_id = ?
        `).all(userId);

        let companyAppsQuery = [];
        if (companyId) {
            // Get company-wide installed apps
            companyAppsQuery = db.prepare(`
                SELECT sa.*, cai.installed_at, 'company' as installation_type, cai.status
                FROM sdk_apps sa
                JOIN company_app_installations cai ON sa.id = cai.app_id
                WHERE cai.company_id = ?
            `).all(companyId);
        }

        const allApps: App[] = [...userAppsQuery, ...companyAppsQuery];

        // Deduplicate apps, giving preference to user installations over company ones.
        const uniqueApps = allApps.reduce((acc, current) => {
            if (!acc.find(item => item.id === current.id)) {
                acc.push(current);
            }
            return acc;
        }, [] as App[]);

        // Sort apps alphabetically by name
        uniqueApps.sort((a, b) => a.name.localeCompare(b.name));

        res.json({ success: true, data: uniqueApps });

    } catch (error) {
        console.error('Error fetching my-applications:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching applications.' });
    }
});

export default router;