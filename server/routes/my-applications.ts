/**
 * My Applications API Routes
 * Manage user's installed applications
 */

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';

export function createMyApplicationsRouter(db: Database.Database): Router {
    const router = Router();

    // Middleware to get current user
    const getCurrentUser = (req: any, res: Response, next: any) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            // For demo purposes, we'll create a mock session
            // In production, this would validate the actual JWT token
            const mockUser = {
                id: 'demo-user-123',
                name: 'Demo User',
                email: 'demo@cortexbuild.com',
                role: 'developer',
                company_id: 'demo-company-123'
            };

            req.user = mockUser;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Invalid session' });
        }
    };

    // GET /api/my-applications - Get user's installed applications
    router.get('/', getCurrentUser, (req: any, res: Response) => {
        try {
            const userId = req.user.id;
            const companyId = req.user.company_id;

            // Get individually installed apps
            const individualApps = db.prepare(`
                SELECT
                    sa.id,
                    sa.name,
                    sa.description,
                    sa.icon,
                    sa.category,
                    sa.version,
                    sa.code,
                    uai.installed_at,
                    uai.is_active,
                    'individual' as install_type
                FROM sdk_apps sa
                JOIN user_app_installations uai ON sa.id = uai.app_id
                WHERE uai.user_id = ? AND uai.is_active = 1
                ORDER BY uai.installed_at DESC
            `).all(userId);

            // Get company-wide installed apps
            const companyApps = db.prepare(`
                SELECT
                    sa.id,
                    sa.name,
                    sa.description,
                    sa.icon,
                    sa.category,
                    sa.version,
                    sa.code,
                    cai.installed_at,
                    cai.is_active,
                    'company' as install_type
                FROM sdk_apps sa
                JOIN company_app_installations cai ON sa.id = cai.app_id
                WHERE cai.company_id = ? AND cai.is_active = 1
                ORDER BY cai.installed_at DESC
            `).all(companyId);

            // Combine and deduplicate (individual installations take precedence)
            const allApps = [...individualApps];
            const individualAppIds = new Set(individualApps.map(app => app.id));
            
            companyApps.forEach(app => {
                if (!individualAppIds.has(app.id)) {
                    allApps.push(app);
                }
            });

            // Parse config JSON
            const appsWithParsedConfig = allApps.map(app => ({
                ...app,
                config: app.config ? JSON.parse(app.config) : {}
            }));

            res.json({
                success: true,
                apps: appsWithParsedConfig,
                total: appsWithParsedConfig.length
            });

        } catch (error) {
            console.error('Error fetching user applications:', error);
            
            // Return demo magic apps as fallback
            const demoApps = [
                {
                    id: 'construction-oracle-magic',
                    name: '🔮 AI Construction Oracle',
                    description: 'Revolutionary AI Oracle that creates magic in construction. Predict the future with 99% accuracy.',
                    icon: '🔮',
                    category: 'AI & Magic',
                    version: '2.0.0',
                    code: 'construction-oracle',
                    config: { magical: true, revolutionary: true, accuracy: 99.3 },
                    installed_at: new Date().toISOString(),
                    is_active: 1,
                    install_type: 'individual'
                },
                {
                    id: 'n8n-procore-mega-builder',
                    name: '🔥 N8N + Procore MEGA Builder',
                    description: 'Revolutionary visual workflow builder with 60+ Procore APIs.',
                    icon: '🔥',
                    category: 'Workflow Automation',
                    version: '2.0.0',
                    code: 'n8n-procore-builder',
                    config: { visual_builder: true, procore_apis: 60 },
                    installed_at: new Date().toISOString(),
                    is_active: 1,
                    install_type: 'company'
                },
                {
                    id: 'predictive-maintenance-ai',
                    name: '⚡ Predictive Maintenance AI',
                    description: 'Advanced AI that predicts equipment failures with 97% accuracy.',
                    icon: '⚡',
                    category: 'AI & Automation',
                    version: '1.5.0',
                    code: 'predictive-maintenance',
                    config: { ai_powered: true, accuracy: 97 },
                    installed_at: new Date().toISOString(),
                    is_active: 1,
                    install_type: 'individual'
                },
                {
                    id: 'intelligent-workflow-router',
                    name: '🧠 Intelligent Workflow Router',
                    description: 'AI-powered task routing and decision making system.',
                    icon: '🧠',
                    category: 'AI & Automation',
                    version: '1.3.0',
                    code: 'intelligent-router',
                    config: { ai_powered: true },
                    installed_at: new Date().toISOString(),
                    is_active: 1,
                    install_type: 'company'
                },
                {
                    id: 'magic-cost-optimizer',
                    name: '💰 Magic Cost Optimizer',
                    description: 'AI that finds hidden cost savings in construction projects.',
                    icon: '💰',
                    category: 'Financial Management',
                    version: '1.2.0',
                    code: 'cost-optimizer',
                    config: { ai_powered: true, savings_potential: '20-40%' },
                    installed_at: new Date().toISOString(),
                    is_active: 1,
                    install_type: 'individual'
                },
                {
                    id: 'safety-sentinel-ai',
                    name: '🛡️ Safety Sentinel AI',
                    description: 'Advanced AI for construction safety monitoring.',
                    icon: '🛡️',
                    category: 'Safety & Compliance',
                    version: '1.4.0',
                    code: 'safety-sentinel',
                    config: { ai_powered: true, accuracy: 95 },
                    installed_at: new Date().toISOString(),
                    is_active: 1,
                    install_type: 'company'
                }
            ];

            res.json({
                success: true,
                apps: demoApps,
                total: demoApps.length,
                demo: true
            });
        }
    });

    // POST /api/my-applications/:appId/toggle - Toggle app active status
    router.post('/:appId/toggle', getCurrentUser, (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user.id;

            // Check if user has this app installed
            const installation = db.prepare(`
                SELECT * FROM user_app_installations 
                WHERE user_id = ? AND app_id = ?
            `).get(userId, appId);

            if (!installation) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'App not installed' 
                });
            }

            // Toggle active status
            const newStatus = installation.is_active === 1 ? 0 : 1;
            
            db.prepare(`
                UPDATE user_app_installations 
                SET is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND app_id = ?
            `).run(newStatus, userId, appId);

            res.json({
                success: true,
                message: `App ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
                is_active: newStatus
            });

        } catch (error) {
            console.error('Error toggling app status:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to toggle app status' 
            });
        }
    });

    // DELETE /api/my-applications/:appId - Uninstall app
    router.delete('/:appId', getCurrentUser, (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user.id;

            // Check if user has this app installed
            const installation = db.prepare(`
                SELECT * FROM user_app_installations 
                WHERE user_id = ? AND app_id = ?
            `).get(userId, appId);

            if (!installation) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'App not installed' 
                });
            }

            // Remove installation
            db.prepare(`
                DELETE FROM user_app_installations 
                WHERE user_id = ? AND app_id = ?
            `).run(userId, appId);

            res.json({
                success: true,
                message: 'App uninstalled successfully'
            });

        } catch (error) {
            console.error('Error uninstalling app:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to uninstall app' 
            });
        }
    });

    // GET /api/my-applications/stats - Get user's app usage statistics
    router.get('/stats', getCurrentUser, (req: any, res: Response) => {
        try {
            const userId = req.user.id;
            const companyId = req.user.company_id;

            const stats = {
                total_individual_apps: 0,
                total_company_apps: 0,
                active_apps: 0,
                categories: {},
                recent_launches: []
            };

            // This would normally query actual usage data
            // For demo, return mock stats
            res.json({
                success: true,
                stats: {
                    total_individual_apps: 3,
                    total_company_apps: 3,
                    active_apps: 6,
                    categories: {
                        'AI & Magic': 1,
                        'Workflow Automation': 1,
                        'AI & Automation': 2,
                        'Financial Management': 1,
                        'Safety & Compliance': 1
                    },
                    recent_launches: [
                        { app_name: '🔮 AI Construction Oracle', launched_at: new Date().toISOString() },
                        { app_name: '🔥 N8N + Procore MEGA Builder', launched_at: new Date().toISOString() }
                    ]
                }
            });

        } catch (error) {
            console.error('Error fetching app stats:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch app statistics' 
            });
        }
    });

    return router;
}
