// CortexBuild Platform - Super Admin API Routes
// Version: 2.0.0 - Supabase Migration
// Super Admin: adrian.stanca1@gmail.com
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as auth from '../auth-supabase';

export function createAdminRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // Middleware to check super_admin role
  const requireSuperAdmin = async (req: any, res: Response, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await auth.getCurrentUserByToken(token);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden - Super Admin only' });
      }

      req.user = user;
      next();
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Unauthorized' });
    }
  };

  // GET /api/admin/dashboard - Super Admin Dashboard Stats
  router.get('/dashboard', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const weekAgoIso = weekAgo.toISOString();
      const startOfMonthIso = startOfMonth.toISOString();

      // Get totals
      const [usersResult, companiesResult, projectsResult, clientsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true })
      ]);

      const totals = {
        users: usersResult.count || 0,
        companies: companiesResult.count || 0,
        projects: projectsResult.count || 0,
        clients: clientsResult.count || 0
      };

      // Get user stats
      const [newUsersWeek, superAdminsResult, developersResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgoIso),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'super_admin'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'developer')
      ]);

      const userStats = {
        total: totals.users,
        active: totals.users,
        newThisWeek: newUsersWeek.count || 0,
        superAdmins: superAdminsResult.count || 0,
        developers: developersResult.count || 0
      };

      // Get company stats
      const [activeCompaniesResult, newCompaniesMonth] = await Promise.all([
        supabase.from('projects').select('company_id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('companies').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonthIso)
      ]);

      const companyStats = {
        total: totals.companies,
        active: activeCompaniesResult.count || totals.companies,
        newThisMonth: newCompaniesMonth.count || 0
      };

      // Get project stats
      const { data: projectsStatus } = await supabase
        .from('projects')
        .select('status');

      const projectStatusRows = (projectsStatus || []).reduce((acc: any, p: any) => {
        const status = p.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const projectStats = {
        total: totals.projects,
        active: projectStatusRows['active'] || 0,
        byStatus: Object.entries(projectStatusRows).map(([status, count]) => ({ status, count }))
      };

      const sdkDevelopers = userStats.developers;

      // Get usage summary
      const { data: usageLogs } = await supabase
        .from('api_usage_logs')
        .select('provider, cost, total_tokens')
        .gte('created_at', startOfMonthIso);

      const usageSummaryRows = (usageLogs || []).reduce((acc: any, log: any) => {
        const provider = log.provider || 'unknown';
        if (!acc[provider]) {
          acc[provider] = {
            provider,
            requests_this_month: 0,
            month_to_date_cost: 0,
            total_tokens: 0
          };
        }
        acc[provider].requests_this_month += 1;
        acc[provider].month_to_date_cost += log.cost || 0;
        acc[provider].total_tokens += log.total_tokens || 0;
        return acc;
      }, {});

      const sdkStats = {
        developers: sdkDevelopers,
        requestsThisMonth: Object.values(usageSummaryRows).reduce((sum: number, row: any) => sum + (row.requests_this_month || 0), 0),
        costThisMonth: Object.values(usageSummaryRows).reduce((sum: number, row: any) => sum + (row.month_to_date_cost || 0), 0),
        tokensThisMonth: Object.values(usageSummaryRows).reduce((sum: number, row: any) => sum + (row.total_tokens || 0), 0),
        topProviders: Object.values(usageSummaryRows).map((row: any) => ({
          provider: row.provider,
          requests: row.requests_this_month || 0,
          cost: row.month_to_date_cost || 0,
          tokens: row.total_tokens || 0
        }))
      };

      // Get tenant usage
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(8);

      const tenantUsage = await Promise.all(
        (companies || []).map(async (company: any) => {
          const [projectsResult, usersResult, logsResult] = await Promise.all([
            supabase.from('projects').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
            supabase
              .from('api_usage_logs')
              .select('cost, total_tokens')
              .gte('created_at', startOfMonthIso)
              .in('user_id', 
                (await supabase.from('users').select('id').eq('company_id', company.id)).data?.map((u: any) => u.id) || []
              )
          ]);

          const logs = logsResult.data || [];
          const apiCost = logs.reduce((sum: number, log: any) => sum + (log.cost || 0), 0);
          const tokens = logs.reduce((sum: number, log: any) => sum + (log.total_tokens || 0), 0);

          return {
            companyId: String(company.id),
            companyName: company.name,
            projects: projectsResult.count || 0,
            users: usersResult.count || 0,
            apiCost,
            tokens
          };
        })
      );

      tenantUsage.sort((a: any, b: any) => b.apiCost - a.apiCost || b.projects - a.projects);

      // Get recent activity
      let recentActivity: any[] = [];
      try {
        const { data: activities } = await supabase
          .from('activities')
          .select(`
            id,
            action,
            description,
            created_at,
            users!activities_user_id_fkey(id, name),
            users!activities_user_id_fkey(company_id),
            companies!users_company_id_fkey(id, name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        recentActivity = (activities || []).map((a: any) => {
          const users = Array.isArray(a.users) ? a.users[0] : a.users;
          const companies = Array.isArray(a.companies) ? a.companies[0] : a.companies;
          return {
            id: String(a.id),
            action: a.action,
            description: a.description,
            createdAt: a.created_at,
            userName: users?.name,
            companyName: companies?.name
          };
        });
      } catch (activityError) {
        console.warn('[Admin dashboard] recent activity unavailable', activityError);
      }

      // Get pending approvals
      const { data: pendingApps } = await supabase
        .from('sdk_apps')
        .select(`
          id,
          name,
          status,
          updated_at,
          users!sdk_apps_developer_id_fkey(id, name),
          companies!sdk_apps_company_id_fkey(id, name)
        `)
        .in('status', ['pending_review', 'draft'])
        .order('updated_at', { ascending: false })
        .limit(10);

      const pendingApprovals = (pendingApps || []).map((app: any) => {
        const users = Array.isArray(app.users) ? app.users[0] : app.users;
        const companies = Array.isArray(app.companies) ? app.companies[0] : app.companies;
        return {
          id: app.id,
          name: app.name,
          status: app.status,
          updatedAt: app.updated_at,
          developerName: users?.name,
          companyName: companies?.name
        };
      });

      // Get recent apps
      const { data: recentApps } = await supabase
        .from('sdk_apps')
        .select(`
          id,
          name,
          status,
          updated_at,
          users!sdk_apps_developer_id_fkey(id, name),
          companies!sdk_apps_company_id_fkey(id, name)
        `)
        .order('updated_at', { ascending: false })
        .limit(12);

      const recentAppsList = (recentApps || []).map((app: any) => {
        const users = Array.isArray(app.users) ? app.users[0] : app.users;
        const companies = Array.isArray(app.companies) ? app.companies[0] : app.companies;
        return {
          id: app.id,
          name: app.name,
          status: app.status,
          updatedAt: app.updated_at,
          developerName: users?.name,
          companyName: companies?.name
        };
      });

      const systemStats = {
        uptime: 99.92,
        cpu: Math.min(95, Math.max(32, Math.round((sdkStats.requestsThisMonth / Math.max(1, sdkDevelopers)) * 0.8))),
        memory: Math.min(90, Math.max(28, projectStats.total + 30)),
        storage: Math.min(88, Math.max(24, tenantUsage.length * 6 + 28))
      };

      res.json({
        success: true,
        data: {
          totals,
          userStats,
          companyStats,
          projectStats,
          sdkStats,
          systemStats,
          tenantUsage,
          recentActivity,
          pendingApprovals,
          recentApps: recentAppsList
        }
      });
    } catch (error: any) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/users - List all users (Super Admin)
  router.get('/users', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { page = '1', limit = '50', search, company_id, role } = req.query as any;
      
      let query = supabase
        .from('users')
        .select(`
          *,
          companies!users_company_id_fkey(id, name)
        `, { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (company_id) {
        query = query.eq('company_id', company_id);
      }

      if (role) {
        query = query.eq('role', role);
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data: users, error, count } = await query;

      if (error) throw error;

      const transformedUsers = (users || []).map((u: any) => {
        const companies = Array.isArray(u.companies) ? u.companies[0] : u.companies;
        return {
          ...u,
          company_name: companies?.name || null
        };
      });

      res.json({
        success: true,
        data: transformedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('List users error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/admin/users - Create new user (Super Admin)
  router.post('/users', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { email, password, name, role, company_id } = req.body;

      if (!email || !password || !name || !role || !company_id) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if user exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .ilike('email', email)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);

      const { data: user, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          password_hash: passwordHash,
          name,
          role,
          company_id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      try {
        await supabase.from('activities').insert({
          user_id: (req as any).user.id,
          action: 'create',
          description: `Created user: ${email}`
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      console.error('Create user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/admin/users/:id - Update user (Super Admin)
  router.put('/users/:id', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, role, company_id, is_active, password } = req.body;

      const updates: any = {};

      if (name !== undefined) updates.name = name;
      if (role !== undefined) updates.role = role;
      if (company_id !== undefined) updates.company_id = company_id;
      if (is_active !== undefined) updates.is_active = is_active === true || is_active === 1;
      if (password) {
        updates.password_hash = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log activity
      try {
        await supabase.from('activities').insert({
          user_id: (req as any).user.id,
          action: 'update',
          description: `Updated user: ${id}`
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/admin/users/:id - Delete user (Super Admin)
  router.delete('/users/:id', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', id)
        .single();

      if (user && user.role === 'super_admin') {
        return res.status(403).json({ error: 'Cannot delete super admin' });
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log activity
      try {
        await supabase.from('activities').insert({
          user_id: (req as any).user.id,
          action: 'delete',
          description: `Deleted user: ${id}`
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/companies - List all companies (Super Admin)
  router.get('/companies', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      // Get counts for each company
      const companiesWithCounts = await Promise.all(
        (companies || []).map(async (company: any) => {
          const [usersResult, projectsResult] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
            supabase.from('projects').select('id', { count: 'exact', head: true }).eq('company_id', company.id)
          ]);

          return {
            ...company,
            user_count: usersResult.count || 0,
            project_count: projectsResult.count || 0
          };
        })
      );

      res.json({ success: true, data: companiesWithCounts });
    } catch (error: any) {
      console.error('List companies error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/admin/companies - Create new company (Super Admin)
  router.post('/companies', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        website,
        industry = 'construction',
        subscription_plan = 'free',
        max_users = 5,
        max_projects = 10
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Company name and email are required' });
      }

      const companyId = uuidv4();

      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          id: companyId,
          name,
          email,
          phone: phone || null,
          address: address || null,
          website: website || null,
          industry,
          subscription_plan,
          max_users,
          max_projects
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      try {
        await supabase.from('activities').insert({
          user_id: (req as any).user.id,
          action: 'create',
          description: `Created company: ${name}`
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      res.json({ success: true, data: company });
    } catch (error: any) {
      console.error('Create company error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/admin/companies/:id - Update company (Super Admin)
  router.put('/companies/:id', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, subscription_plan, max_users, max_projects, is_active } = req.body;

      const updates: any = {};

      if (name !== undefined) updates.name = name;
      if (subscription_plan !== undefined) updates.subscription_plan = subscription_plan;
      if (max_users !== undefined) updates.max_users = max_users;
      if (max_projects !== undefined) updates.max_projects = max_projects;
      if (is_active !== undefined) updates.is_active = is_active === true || is_active === 1;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const { data: company, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Log activity
      try {
        await supabase.from('activities').insert({
          user_id: (req as any).user.id,
          action: 'update',
          description: `Updated company: ${id}`
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      res.json({ success: true, data: company });
    } catch (error: any) {
      console.error('Update company error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/admin/companies/:id - Delete company (Super Admin)
  router.delete('/companies/:id', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if company has users
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', id);

      if (count && count > 0) {
        return res.status(400).json({
          error: `Cannot delete company with ${count} users. Please reassign or delete users first.`
        });
      }

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log activity
      try {
        await supabase.from('activities').insert({
          user_id: (req as any).user.id,
          action: 'delete',
          description: `Deleted company: ${id}`
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      res.json({ success: true, message: 'Company deleted successfully' });
    } catch (error: any) {
      console.error('Delete company error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/stats - System statistics (Super Admin) - Alias for dashboard
  router.get('/stats', requireSuperAdmin, (req: Request, res: Response) => {
    try {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const weekAgoIso = weekAgo.toISOString();
      const startOfMonthIso = startOfMonth.toISOString();

      const getCount = (query: string, ...params: any[]) => {
        try {
          const row = db.prepare(query).get(...params) as any;
          return row?.count ?? 0;
        } catch (error) {
          console.warn('[Admin stats] count query failed', query, error);
          return 0;
        }
      };

      const totalUsers = getCount('SELECT COUNT(*) as count FROM users');
      const activeUsers = getCount('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      const totalCompanies = getCount('SELECT COUNT(*) as count FROM companies');
      const totalProjects = getCount('SELECT COUNT(*) as count FROM projects');

      // Get API usage for last 24 hours
      const apiCalls24h = getCount('SELECT COUNT(*) as count FROM api_usage_logs WHERE created_at > datetime("now", "-1 day")');

      // Determine system health based on recent activity and errors
      let systemHealth = 'healthy';
      const recentErrors = getCount('SELECT COUNT(*) as count FROM activities WHERE action = "error" AND created_at > datetime("now", "-1 hour")');
      if (recentErrors > 5) {
        systemHealth = 'critical';
      } else if (recentErrors > 2) {
        systemHealth = 'warning';
      }

      const stats = {
        totalUsers: { count: totalUsers },
        activeUsers: { count: activeUsers },
        totalCompanies: { count: totalCompanies },
        totalProjects: { count: totalProjects },
        apiCalls24h: apiCalls24h,
        systemHealth: systemHealth
      };

      res.json({
        success: true,
        ...stats
      });
    } catch (error: any) {
      console.error('Stats error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/system-stats - System statistics (Super Admin)
  router.get('/system-stats', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      // Get record counts
      const [usersCount, companiesCount, projectsCount, clientsCount] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true })
      ]);

      const totalRecords = (usersCount.count || 0) + (companiesCount.count || 0) + (projectsCount.count || 0) + (clientsCount.count || 0);

      // Get activity counts
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [last24hResult, last7dResult] = await Promise.all([
        supabase.from('activities').select('id', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString()),
        supabase.from('activities').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString())
      ]);

      const stats = {
        database: {
          size: 'N/A (Supabase managed)',
          tables: 25, // Approximate
          records: totalRecords
        },
        performance: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        },
        activity: {
          last24h: last24hResult.count || 0,
          last7d: last7dResult.count || 0
        }
      };

      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('System stats error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/activity-logs - Get activity logs (Super Admin)
  router.get('/activity-logs', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { page = '1', limit = '20', user_id, action } = req.query as any;
      
      let query = supabase
        .from('activities')
        .select(`
          *,
          users!activities_user_id_fkey(id, name, email)
        `, { count: 'exact' });

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (action) {
        query = query.eq('action', action);
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data: logs, error, count } = await query;

      if (error) throw error;

      const transformedLogs = (logs || []).map((log: any) => {
        const users = Array.isArray(log.users) ? log.users[0] : log.users;
        return {
          ...log,
          user_name: users?.name || null,
          user_email: users?.email || null
        };
      });

      res.json({
        success: true,
        data: transformedLogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Activity logs error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/analytics - Platform analytics (Super Admin)
  router.get('/analytics', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { period = '30d' } = req.query as any;
      
      let daysBack = 30;
      if (period === '7d') daysBack = 7;
      if (period === '90d') daysBack = 90;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const startDateIso = startDate.toISOString();

      // Get growth data
      const [usersData, companiesData, projectsData] = await Promise.all([
        supabase.from('users').select('created_at').gte('created_at', startDateIso),
        supabase.from('companies').select('created_at').gte('created_at', startDateIso),
        supabase.from('projects').select('created_at').gte('created_at', startDateIso)
      ]);

      // Group by date
      const groupByDate = (items: any[]) => {
        const grouped: any = {};
        items.forEach((item: any) => {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          grouped[date] = (grouped[date] || 0) + 1;
        });
        return Object.entries(grouped)
          .map(([date, count]) => ({ date, count }))
          .sort((a: any, b: any) => b.date.localeCompare(a.date));
      };

      // Get top companies
      const { data: allCompanies } = await supabase
        .from('companies')
        .select('id, name, subscription_plan')
        .order('created_at', { ascending: false })
        .limit(10);

      const topCompanies = await Promise.all(
        (allCompanies || []).map(async (company: any) => {
          const [usersResult, projectsResult] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
            supabase.from('projects').select('id', { count: 'exact', head: true }).eq('company_id', company.id)
          ]);

          return {
            name: company.name,
            subscription_plan: company.subscription_plan,
            user_count: usersResult.count || 0,
            project_count: projectsResult.count || 0
          };
        })
      );

      topCompanies.sort((a: any, b: any) => b.user_count - a.user_count || b.project_count - a.project_count);

      // Get subscription distribution
      const { data: companiesForSubs } = await supabase
        .from('companies')
        .select('subscription_plan');

      const subscriptionDistribution = (companiesForSubs || []).reduce((acc: any, c: any) => {
        const plan = c.subscription_plan || 'free';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {});

      // Get role distribution
      const { data: usersForRoles } = await supabase
        .from('users')
        .select('role');

      const roleDistribution = (usersForRoles || []).reduce((acc: any, u: any) => {
        const role = u.role || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const analytics = {
        userGrowth: groupByDate(usersData.data || []),
        companyGrowth: groupByDate(companiesData.data || []),
        projectGrowth: groupByDate(projectsData.data || []),
        topCompanies,
        subscriptionDistribution: Object.entries(subscriptionDistribution).map(([plan, count]) => ({
          subscription_plan: plan,
          count
        })),
        roleDistribution: Object.entries(roleDistribution).map(([role, count]) => ({
          role,
          count
        }))
      };

      res.json({ success: true, data: analytics });
    } catch (error: any) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
