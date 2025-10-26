/**
 * Global Marketplace API Routes
 * Complete publishing workflow and installation system for sdk_apps
 */

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export function createGlobalMarketplaceRouter(db: Database.Database): Router {
    const router = Router();

    // Middleware to get current user
    const getCurrentUser = (req: any, res: Response, next: any) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as any;
        if (!session) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    };

    // Helper: Log analytics
    const logAnalytics = (appId: string, eventType: string, userId?: string, companyId?: string, metadata?: any) => {
        try {
            db.prepare(`
                INSERT INTO app_analytics (id, app_id, event_type, user_id, company_id, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).run(uuidv4(), appId, eventType, userId || null, companyId || null, metadata ? JSON.stringify(metadata) : null);
        } catch (error) {
            console.warn('[Analytics] Failed to log event:', error);
        }
    };

    // Helper: Log review history
    const logReviewHistory = (appId: string, reviewerId: string, previousStatus: string | null, newStatus: string, feedback?: string) => {
        try {
            db.prepare(`
                INSERT INTO app_review_history (id, app_id, reviewer_id, previous_status, new_status, feedback, reviewed_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).run(uuidv4(), appId, reviewerId, previousStatus, newStatus, feedback || null);
        } catch (error) {
            console.warn('[Review History] Failed to log:', error);
        }
    };

    // ========================================================================
    // PUBLIC ROUTES - No authentication required
    // ========================================================================

    // GET /api/global-marketplace/apps - Browse all published apps
    router.get('/apps', (req: Request, res: Response) => {
        try {
            const { category, search, sort = 'recent' } = req.query;
            
            let query = `
                SELECT 
                    id, name, description, icon, category, version,
                    developer_id, published_at,
                    (SELECT COUNT(*) FROM user_app_installations WHERE app_id = sdk_apps.id AND is_active = 1) as install_count,
                    (SELECT COUNT(*) FROM company_app_installations WHERE app_id = sdk_apps.id AND is_active = 1) as company_install_count
                FROM sdk_apps
                WHERE review_status = 'approved' AND is_public = 1
            `;
            
            const params: any[] = [];
            
            if (category && category !== 'all') {
                query += ` AND category = ?`;
                params.push(category);
            }
            
            if (search) {
                query += ` AND (name LIKE ? OR description LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }
            
            // Sorting
            if (sort === 'popular') {
                query += ` ORDER BY (install_count + company_install_count) DESC`;
            } else if (sort === 'name') {
                query += ` ORDER BY name ASC`;
            } else {
                query += ` ORDER BY published_at DESC`;
            }
            
            const apps = db.prepare(query).all(...params);
            
            res.json({
                success: true,
                apps,
                total: apps.length
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error fetching apps:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ========================================================================
    // AUTHENTICATED ROUTES
    // ========================================================================

    // GET /api/global-marketplace/apps/detailed - Get apps with user-specific data
    router.get('/apps/detailed', getCurrentUser, (req: any, res: Response) => {
        try {
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            const { category, search, sort = 'recent' } = req.query;
            
            let query = `
                SELECT 
                    a.*,
                    (SELECT COUNT(*) FROM user_app_installations WHERE app_id = a.id AND is_active = 1) as install_count,
                    (SELECT COUNT(*) FROM company_app_installations WHERE app_id = a.id AND is_active = 1) as company_install_count,
                    (SELECT 1 FROM user_app_installations WHERE app_id = a.id AND user_id = ? AND is_active = 1) as is_installed_by_me,
                    (SELECT 1 FROM company_app_installations WHERE app_id = a.id AND company_id = ? AND is_active = 1) as is_installed_by_company
                FROM sdk_apps a
                WHERE a.review_status = 'approved' AND a.is_public = 1
            `;
            
            const params: any[] = [userId, companyId];
            
            if (category && category !== 'all') {
                query += ` AND a.category = ?`;
                params.push(category);
            }
            
            if (search) {
                query += ` AND (a.name LIKE ? OR a.description LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }
            
            if (sort === 'popular') {
                query += ` ORDER BY (install_count + company_install_count) DESC`;
            } else if (sort === 'name') {
                query += ` ORDER BY a.name ASC`;
            } else {
                query += ` ORDER BY a.published_at DESC`;
            }
            
            const apps = db.prepare(query).all(...params);
            
            res.json({
                success: true,
                apps,
                total: apps.length
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error fetching detailed apps:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /api/global-marketplace/my-apps - Get my published apps (developer view)
    router.get('/my-apps', getCurrentUser, (req: any, res: Response) => {
        try {
            const userId = req.user?.id;
            
            const apps = db.prepare(`
                SELECT 
                    a.*,
                    (SELECT COUNT(*) FROM user_app_installations WHERE app_id = a.id AND is_active = 1) as install_count,
                    (SELECT COUNT(*) FROM company_app_installations WHERE app_id = a.id AND is_active = 1) as company_install_count
                FROM sdk_apps a
                WHERE a.developer_id = ?
                ORDER BY a.created_at DESC
            `).all(userId);
            
            res.json({
                success: true,
                apps,
                total: apps.length
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error fetching my apps:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /api/global-marketplace/my-installed-apps - Get apps installed for me
    router.get('/my-installed-apps', getCurrentUser, (req: any, res: Response) => {
        try {
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            
            const apps = db.prepare(`
                SELECT DISTINCT
                    a.*,
                    CASE 
                        WHEN uai.id IS NOT NULL THEN 'individual'
                        WHEN cai.id IS NOT NULL THEN 'company'
                        ELSE NULL
                    END as installation_type,
                    COALESCE(uai.installed_at, cai.installed_at) as installed_at
                FROM sdk_apps a
                LEFT JOIN user_app_installations uai ON a.id = uai.app_id AND uai.user_id = ? AND uai.is_active = 1
                LEFT JOIN company_app_installations cai ON a.id = cai.app_id AND cai.company_id = ? AND cai.is_active = 1
                WHERE (uai.id IS NOT NULL OR cai.id IS NOT NULL)
                ORDER BY installed_at DESC
            `).all(userId, companyId);
            
            res.json({
                success: true,
                apps,
                total: apps.length
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error fetching installed apps:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /api/global-marketplace/pending-review - Get apps pending review (admin only)
    router.get('/pending-review', getCurrentUser, (req: any, res: Response) => {
        try {
            const userRole = req.user?.role;
            
            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }
            
            const apps = db.prepare(`
                SELECT 
                    a.*,
                    u.name as developer_name,
                    u.email as developer_email
                FROM sdk_apps a
                LEFT JOIN users u ON a.developer_id = u.id
                WHERE a.review_status = 'pending_review'
                ORDER BY a.updated_at DESC
            `).all();
            
            res.json({
                success: true,
                apps,
                total: apps.length
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error fetching pending apps:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST /api/global-marketplace/submit-for-review/:appId - Submit app for review
    router.post('/submit-for-review/:appId', getCurrentUser, (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;

            const app = db.prepare('SELECT * FROM sdk_apps WHERE id = ? AND developer_id = ?').get(appId, userId) as any;

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found or unauthorized' });
            }

            const previousStatus = app.review_status;

            db.prepare(`
                UPDATE sdk_apps
                SET review_status = 'pending_review', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(appId);

            logReviewHistory(appId, userId, previousStatus, 'pending_review');
            logAnalytics(appId, 'submit_for_review', userId);

            res.json({
                success: true,
                message: 'App submitted for review'
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error submitting app:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST /api/global-marketplace/approve/:appId - Approve app (admin only)
    router.post('/approve/:appId', getCurrentUser, (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const { feedback } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }

            const app = db.prepare('SELECT * FROM sdk_apps WHERE id = ?').get(appId) as any;

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found' });
            }

            const previousStatus = app.review_status;

            db.prepare(`
                UPDATE sdk_apps
                SET review_status = 'approved',
                    is_public = 1,
                    reviewed_by = ?,
                    reviewed_at = CURRENT_TIMESTAMP,
                    published_at = CURRENT_TIMESTAMP,
                    review_feedback = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(userId, feedback || null, appId);

            logReviewHistory(appId, userId, previousStatus, 'approved', feedback);
            logAnalytics(appId, 'approved', userId);

            res.json({
                success: true,
                message: 'App approved and published'
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error approving app:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST /api/global-marketplace/reject/:appId - Reject app (admin only)
    router.post('/reject/:appId', getCurrentUser, (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const { feedback } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }

            const app = db.prepare('SELECT * FROM sdk_apps WHERE id = ?').get(appId) as any;

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found' });
            }

            const previousStatus = app.review_status;

            db.prepare(`
                UPDATE sdk_apps
                SET review_status = 'rejected',
                    reviewed_by = ?,
                    reviewed_at = CURRENT_TIMESTAMP,
                    review_feedback = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(userId, feedback || 'App rejected', appId);

            logReviewHistory(appId, userId, previousStatus, 'rejected', feedback);
            logAnalytics(appId, 'rejected', userId);

            res.json({
                success: true,
                message: 'App rejected'
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error rejecting app:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST /api/global-marketplace/install/individual/:appId - Install app for individual user
    router.post('/install/individual/:appId', getCurrentUser, (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;

            const app = db.prepare('SELECT * FROM sdk_apps WHERE id = ? AND review_status = ? AND is_public = 1').get(appId, 'approved') as any;

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found or not published' });
            }

            // Check if already installed
            const existing = db.prepare('SELECT * FROM user_app_installations WHERE user_id = ? AND app_id = ?').get(userId, appId);

            if (existing) {
                return res.status(400).json({ success: false, error: 'App already installed' });
            }

            db.prepare(`
                INSERT INTO user_app_installations (id, user_id, app_id, installation_type, installed_by, installed_at, is_active)
                VALUES (?, ?, ?, 'individual', ?, CURRENT_TIMESTAMP, 1)
            `).run(uuidv4(), userId, appId, userId);

            logAnalytics(appId, 'install', userId, req.user?.company_id, { type: 'individual' });

            res.json({
                success: true,
                message: 'App installed successfully'
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error installing app:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST /api/global-marketplace/install/company/:appId - Install app for entire company (admin only)
    router.post('/install/company/:appId', getCurrentUser, (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            const userRole = req.user?.role;

            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Only admins can install apps company-wide' });
            }

            const app = db.prepare('SELECT * FROM sdk_apps WHERE id = ? AND review_status = ? AND is_public = 1').get(appId, 'approved') as any;

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found or not published' });
            }

            // Check if already installed
            const existing = db.prepare('SELECT * FROM company_app_installations WHERE company_id = ? AND app_id = ?').get(companyId, appId);

            if (existing) {
                return res.status(400).json({ success: false, error: 'App already installed for company' });
            }

            db.prepare(`
                INSERT INTO company_app_installations (id, company_id, app_id, installed_by, installed_at, is_active)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
            `).run(uuidv4(), companyId, appId, userId);

            logAnalytics(appId, 'install', userId, companyId, { type: 'company' });

            res.json({
                success: true,
                message: 'App installed for entire company'
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error installing app for company:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // DELETE /api/global-marketplace/uninstall/individual/:appId - Uninstall app for individual user
    router.delete('/uninstall/individual/:appId', getCurrentUser, (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;

            db.prepare(`
                DELETE FROM user_app_installations
                WHERE user_id = ? AND app_id = ?
            `).run(userId, appId);

            logAnalytics(appId, 'uninstall', userId, req.user?.company_id, { type: 'individual' });

            res.json({
                success: true,
                message: 'App uninstalled successfully'
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error uninstalling app:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // DELETE /api/global-marketplace/uninstall/company/:appId - Uninstall app for company (admin only)
    router.delete('/uninstall/company/:appId', getCurrentUser, (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            const userRole = req.user?.role;

            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Only admins can uninstall company apps' });
            }

            db.prepare(`
                DELETE FROM company_app_installations
                WHERE company_id = ? AND app_id = ?
            `).run(companyId, appId);

            logAnalytics(appId, 'uninstall', userId, companyId, { type: 'company' });

            res.json({
                success: true,
                message: 'App uninstalled from company'
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error uninstalling company app:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /api/global-marketplace/categories - Get all categories
    router.get('/categories', (req: Request, res: Response) => {
        try {
            const categories = [
                { id: 'all', name: 'All Apps', icon: '📦' },
                { id: 'analytics', name: 'Analytics', icon: '📊' },
                { id: 'communication', name: 'Communication', icon: '💬' },
                { id: 'productivity', name: 'Productivity', icon: '⏱️' },
                { id: 'project-management', name: 'Project Management', icon: '📋' },
                { id: 'finance', name: 'Finance', icon: '💰' },
                { id: 'hr', name: 'Human Resources', icon: '👥' },
                { id: 'sales', name: 'Sales & CRM', icon: '📈' },
                { id: 'marketing', name: 'Marketing', icon: '📣' },
                { id: 'utilities', name: 'Utilities', icon: '🔧' },
                { id: 'general', name: 'General', icon: '⚙️' }
            ];

            res.json({
                success: true,
                categories
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error fetching categories:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
}

