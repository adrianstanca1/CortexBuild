/**
 * Global Marketplace API Routes
 * Version: 2.0.0 - Supabase Migration
 * Complete publishing workflow and installation system for sdk_apps
 * Last Updated: 2025-10-31
 */

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as auth from '../auth-supabase';

export function createGlobalMarketplaceRouter(supabase: SupabaseClient): Router {
    const router = Router();

    // Middleware to get current user
    const getCurrentUser = async (req: any, res: Response, next: any) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const user = await auth.getCurrentUserByToken(token);
            if (!user) {
                return res.status(401).json({ error: 'Invalid session' });
            }

            req.user = user;
            next();
        } catch (error: any) {
            res.status(401).json({ error: error.message || 'Unauthorized' });
        }
    };

    // Helper: Log analytics
    const logAnalytics = async (appId: string, eventType: string, userId?: string, companyId?: string, metadata?: any) => {
        try {
            await supabase
                .from('app_analytics')
                .insert({
                    id: uuidv4(),
                    app_id: appId,
                    event_type: eventType,
                    user_id: userId || null,
                    company_id: companyId || null,
                    metadata: metadata ? JSON.stringify(metadata) : null
                });
        } catch (error) {
            console.warn('[Analytics] Failed to log event:', error);
        }
    };

    // Helper: Log review history
    const logReviewHistory = async (appId: string, reviewerId: string, previousStatus: string | null, newStatus: string, feedback?: string) => {
        try {
            await supabase
                .from('app_review_history')
                .insert({
                    id: uuidv4(),
                    app_id: appId,
                    reviewer_id: reviewerId,
                    previous_status: previousStatus,
                    new_status: newStatus,
                    feedback: feedback || null,
                    reviewed_at: new Date().toISOString()
                });
        } catch (error) {
            console.warn('[Review History] Failed to log:', error);
        }
    };

    // ========================================================================
    // PUBLIC ROUTES - No authentication required
    // ========================================================================

    // GET /api/global-marketplace/apps - Browse all published apps
    router.get('/apps', async (req: Request, res: Response) => {
        try {
            const { category, search, sort = 'recent' } = req.query as any;
            
            let query = supabase
                .from('sdk_apps')
                .select(`
                    id, name, description, icon, category, version,
                    developer_id, published_at,
                    user_app_installations!inner(id),
                    company_app_installations!inner(id)
                `, { count: 'exact' })
                .eq('review_status', 'approved')
                .eq('is_public', true)
                .eq('user_app_installations.is_active', true)
                .eq('company_app_installations.is_active', true);

            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            if (search) {
                query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
            }

            // Sorting
            if (sort === 'popular') {
                // Note: Supabase doesn't support complex ORDER BY with subqueries directly
                // We'll need to fetch and sort in memory or use a view
                query = query.order('published_at', { ascending: false });
            } else if (sort === 'name') {
                query = query.order('name');
            } else {
                query = query.order('published_at', { ascending: false });
            }

            const { data: apps, error, count } = await query;

            if (error) throw error;

            // Transform data and calculate install counts
            const transformedApps = (apps || []).map((app: any) => {
                const userInstalls = Array.isArray(app.user_app_installations) ? app.user_app_installations : [app.user_app_installations];
                const companyInstalls = Array.isArray(app.company_app_installations) ? app.company_app_installations : [app.company_app_installations];
                const install_count = userInstalls.filter((i: any) => i).length;
                const company_install_count = companyInstalls.filter((i: any) => i).length;

                return {
                    ...app,
                    install_count,
                    company_install_count
                };
            });

            // Sort by popularity if needed (after fetching)
            if (sort === 'popular') {
                transformedApps.sort((a: any, b: any) => 
                    (b.install_count + b.company_install_count) - (a.install_count + a.company_install_count)
                );
            }

            res.json({
                success: true,
                apps: transformedApps,
                total: count || transformedApps.length
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
    router.get('/apps/detailed', getCurrentUser, async (req: any, res: Response) => {
        try {
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            const { category, search, sort = 'recent' } = req.query as any;
            
            let query = supabase
                .from('sdk_apps')
                .select(`
                    *,
                    user_app_installations!left(id, is_active),
                    company_app_installations!left(id, is_active)
                `)
                .eq('review_status', 'approved')
                .eq('is_public', true);

            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            if (search) {
                query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
            }

            // Sorting
            if (sort === 'name') {
                query = query.order('name');
            } else {
                query = query.order('published_at', { ascending: false });
            }

            const { data: apps, error } = await query;

            if (error) throw error;

            // Get install counts separately
            const appsWithDetails = await Promise.all(
                (apps || []).map(async (app: any) => {
                    // Get install counts
                    const [userInstallsResult, companyInstallsResult, myInstallResult, companyInstallResult] = await Promise.all([
                        supabase
                            .from('user_app_installations')
                            .select('id', { count: 'exact', head: true })
                            .eq('app_id', app.id)
                            .eq('is_active', true),
                        supabase
                            .from('company_app_installations')
                            .select('id', { count: 'exact', head: true })
                            .eq('app_id', app.id)
                            .eq('is_active', true),
                        supabase
                            .from('user_app_installations')
                            .select('id')
                            .eq('app_id', app.id)
                            .eq('user_id', userId)
                            .eq('is_active', true)
                            .single(),
                        supabase
                            .from('company_app_installations')
                            .select('id')
                            .eq('app_id', app.id)
                            .eq('company_id', companyId)
                            .eq('is_active', true)
                            .single()
                    ]);

                    return {
                        ...app,
                        install_count: userInstallsResult.count || 0,
                        company_install_count: companyInstallsResult.count || 0,
                        is_installed_by_me: !!myInstallResult.data,
                        is_installed_by_company: !!companyInstallResult.data
                    };
                })
            );

            // Sort by popularity if needed
            if (sort === 'popular') {
                appsWithDetails.sort((a: any, b: any) => 
                    (b.install_count + b.company_install_count) - (a.install_count + a.company_install_count)
                );
            }

            res.json({
                success: true,
                apps: appsWithDetails,
                total: appsWithDetails.length
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error fetching detailed apps:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /api/global-marketplace/my-apps - Get my published apps (developer view)
    router.get('/my-apps', getCurrentUser, async (req: any, res: Response) => {
        try {
            const userId = req.user?.id;
            
            const { data: apps, error } = await supabase
                .from('sdk_apps')
                .select('*')
                .eq('developer_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get install counts for each app
            const appsWithCounts = await Promise.all(
                (apps || []).map(async (app: any) => {
                    const [userInstalls, companyInstalls] = await Promise.all([
                        supabase
                            .from('user_app_installations')
                            .select('id', { count: 'exact', head: true })
                            .eq('app_id', app.id)
                            .eq('is_active', true),
                        supabase
                            .from('company_app_installations')
                            .select('id', { count: 'exact', head: true })
                            .eq('app_id', app.id)
                            .eq('is_active', true)
                    ]);

                    return {
                        ...app,
                        install_count: userInstalls.count || 0,
                        company_install_count: companyInstalls.count || 0
                    };
                })
            );

            res.json({
                success: true,
                apps: appsWithCounts,
                total: appsWithCounts.length
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error fetching my apps:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /api/global-marketplace/my-installed-apps - Get apps installed for me
    router.get('/my-installed-apps', getCurrentUser, async (req: any, res: Response) => {
        try {
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            
            // Get user installations
            const { data: userInstalls } = await supabase
                .from('user_app_installations')
                .select('*, sdk_apps!inner(*)')
                .eq('user_id', userId)
                .eq('is_active', true);

            // Get company installations
            const { data: companyInstalls } = await supabase
                .from('company_app_installations')
                .select('*, sdk_apps!inner(*)')
                .eq('company_id', companyId)
                .eq('is_active', true);

            // Merge and transform
            const apps: any[] = [];
            
            (userInstalls || []).forEach((install: any) => {
                const app = Array.isArray(install.sdk_apps) ? install.sdk_apps[0] : install.sdk_apps;
                if (app) {
                    apps.push({
                        ...app,
                        installation_type: 'individual',
                        installed_at: install.installed_at
                    });
                }
            });

            (companyInstalls || []).forEach((install: any) => {
                const app = Array.isArray(install.sdk_apps) ? install.sdk_apps[0] : install.sdk_apps;
                if (app && !apps.find((a: any) => a.id === app.id)) {
                    apps.push({
                        ...app,
                        installation_type: 'company',
                        installed_at: install.installed_at
                    });
                }
            });

            // Sort by installed_at
            apps.sort((a: any, b: any) => 
                new Date(b.installed_at).getTime() - new Date(a.installed_at).getTime()
            );

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
    router.get('/pending-review', getCurrentUser, async (req: any, res: Response) => {
        try {
            const userRole = req.user?.role;
            
            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }
            
            const { data: apps, error } = await supabase
                .from('sdk_apps')
                .select(`
                    *,
                    users!sdk_apps_developer_id_fkey(id, name, email)
                `)
                .eq('review_status', 'pending_review')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Transform data
            const transformedApps = (apps || []).map((app: any) => {
                const users = Array.isArray(app.users) ? app.users[0] : app.users;
                return {
                    ...app,
                    developer_name: users?.name || null,
                    developer_email: users?.email || null
                };
            });

            res.json({
                success: true,
                apps: transformedApps,
                total: transformedApps.length
            });
        } catch (error: any) {
            console.error('[Global Marketplace] Error fetching pending apps:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST /api/global-marketplace/submit-for-review/:appId - Submit app for review
    router.post('/submit-for-review/:appId', getCurrentUser, async (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;

            const { data: app } = await supabase
                .from('sdk_apps')
                .select('review_status')
                .eq('id', appId)
                .eq('developer_id', userId)
                .single();

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found or unauthorized' });
            }

            const previousStatus = app.review_status;

            const { error } = await supabase
                .from('sdk_apps')
                .update({
                    review_status: 'pending_review'
                })
                .eq('id', appId);

            if (error) throw error;

            await logReviewHistory(appId, userId, previousStatus, 'pending_review');
            await logAnalytics(appId, 'submit_for_review', userId);

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
    router.post('/approve/:appId', getCurrentUser, async (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const { feedback } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }

            const { data: app } = await supabase
                .from('sdk_apps')
                .select('review_status')
                .eq('id', appId)
                .single();

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found' });
            }

            const previousStatus = app.review_status;
            const now = new Date().toISOString();

            const { error } = await supabase
                .from('sdk_apps')
                .update({
                    review_status: 'approved',
                    is_public: true,
                    reviewed_by: userId,
                    reviewed_at: now,
                    published_at: now,
                    review_feedback: feedback || null
                })
                .eq('id', appId);

            if (error) throw error;

            await logReviewHistory(appId, userId, previousStatus, 'approved', feedback);
            await logAnalytics(appId, 'approved', userId);

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
    router.post('/reject/:appId', getCurrentUser, async (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const { feedback } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }

            const { data: app } = await supabase
                .from('sdk_apps')
                .select('review_status')
                .eq('id', appId)
                .single();

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found' });
            }

            const previousStatus = app.review_status;

            const { error } = await supabase
                .from('sdk_apps')
                .update({
                    review_status: 'rejected',
                    reviewed_by: userId,
                    reviewed_at: new Date().toISOString(),
                    review_feedback: feedback || 'App rejected'
                })
                .eq('id', appId);

            if (error) throw error;

            await logReviewHistory(appId, userId, previousStatus, 'rejected', feedback);
            await logAnalytics(appId, 'rejected', userId);

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
    router.post('/install/individual/:appId', getCurrentUser, async (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;

            const { data: app } = await supabase
                .from('sdk_apps')
                .select('id')
                .eq('id', appId)
                .eq('review_status', 'approved')
                .eq('is_public', true)
                .single();

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found or not published' });
            }

            // Check if already installed
            const { data: existing } = await supabase
                .from('user_app_installations')
                .select('id')
                .eq('user_id', userId)
                .eq('app_id', appId)
                .single();

            if (existing) {
                return res.status(400).json({ success: false, error: 'App already installed' });
            }

            const { error } = await supabase
                .from('user_app_installations')
                .insert({
                    id: uuidv4(),
                    user_id: userId,
                    app_id: appId,
                    installation_type: 'individual',
                    installed_by: userId,
                    is_active: true
                });

            if (error) throw error;

            await logAnalytics(appId, 'install', userId, req.user?.company_id, { type: 'individual' });

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
    router.post('/install/company/:appId', getCurrentUser, async (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            const userRole = req.user?.role;

            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Only admins can install apps company-wide' });
            }

            const { data: app } = await supabase
                .from('sdk_apps')
                .select('id')
                .eq('id', appId)
                .eq('review_status', 'approved')
                .eq('is_public', true)
                .single();

            if (!app) {
                return res.status(404).json({ success: false, error: 'App not found or not published' });
            }

            // Check if already installed
            const { data: existing } = await supabase
                .from('company_app_installations')
                .select('id')
                .eq('company_id', companyId)
                .eq('app_id', appId)
                .single();

            if (existing) {
                return res.status(400).json({ success: false, error: 'App already installed for company' });
            }

            const { error } = await supabase
                .from('company_app_installations')
                .insert({
                    id: uuidv4(),
                    company_id: companyId,
                    app_id: appId,
                    installed_by: userId,
                    is_active: true
                });

            if (error) throw error;

            await logAnalytics(appId, 'install', userId, companyId, { type: 'company' });

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
    router.delete('/uninstall/individual/:appId', getCurrentUser, async (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;

            const { error } = await supabase
                .from('user_app_installations')
                .delete()
                .eq('user_id', userId)
                .eq('app_id', appId);

            if (error) throw error;

            await logAnalytics(appId, 'uninstall', userId, req.user?.company_id, { type: 'individual' });

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
    router.delete('/uninstall/company/:appId', getCurrentUser, async (req: any, res: Response) => {
        try {
            const { appId } = req.params;
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            const userRole = req.user?.role;

            if (userRole !== 'super_admin' && userRole !== 'company_admin') {
                return res.status(403).json({ success: false, error: 'Only admins can uninstall company apps' });
            }

            const { error } = await supabase
                .from('company_app_installations')
                .delete()
                .eq('company_id', companyId)
                .eq('app_id', appId);

            if (error) throw error;

            await logAnalytics(appId, 'uninstall', userId, companyId, { type: 'company' });

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
    router.get('/categories', (_req: Request, res: Response) => {
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
