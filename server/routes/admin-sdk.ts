// CortexBuild - Admin SDK Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken, getCurrentUserByToken } from '../auth-supabase';

export function createAdminSDKRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // Middleware to check if user is super admin
  const checkSuperAdmin = async (req: Request, res: Response, next: Function) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await getCurrentUserByToken(token);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      (req as any).user = user;
      next();
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Unauthorized' });
    }
  };

  // Apply authentication to all routes
  router.use(authenticateToken);
  router.use(checkSuperAdmin);

  // ============================================
  // USER ACCESS CONTROL
  // ============================================

  // PATCH /api/admin/sdk/users/:id/access - Update user SDK access
  router.patch('/users/:id/access', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { sdk_access } = req.body;

      // Check if profile exists
      const { data: existing } = await supabase
        .from('sdk_profiles')
        .select('id')
        .eq('user_id', id)
        .single();

      if (existing) {
        // Note: SDK access field might not exist in sdk_profiles
        // This would need to be added to the schema or handled differently
        await supabase
          .from('sdk_profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('user_id', id);
      } else {
        // Create new profile
        const { error } = await supabase
          .from('sdk_profiles')
          .insert({
            user_id: id,
            subscription_tier: 'free',
            api_requests_limit: 10,
            api_requests_used: 0
          });

        if (error) throw error;
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update SDK access error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/admin/sdk/users/:id/tier - Update user SDK tier
  router.patch('/users/:id/tier', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tier } = req.body;

      const limits: Record<string, number> = {
        free: 10,
        starter: 100,
        pro: 1000,
        enterprise: -1
      };

      const limit = limits[tier] || 10;

      const { data: existing } = await supabase
        .from('sdk_profiles')
        .select('id')
        .eq('user_id', id)
        .single();

      if (existing) {
        await supabase
          .from('sdk_profiles')
          .update({
            subscription_tier: tier,
            api_requests_limit: limit
          })
          .eq('user_id', id);
      } else {
        await supabase
          .from('sdk_profiles')
          .insert({
            user_id: id,
            subscription_tier: tier,
            api_requests_limit: limit,
            api_requests_used: 0
          });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update SDK tier error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // USAGE MONITORING
  // ============================================

  // GET /api/admin/sdk/usage - Get overall usage statistics
  router.get('/usage', async (req: Request, res: Response) => {
    try {
      const { range = '7d' } = req.query as any;
      
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      if (range === '24h') startDate.setHours(now.getHours() - 24);
      else if (range === '7d') startDate.setDate(now.getDate() - 7);
      else if (range === '30d') startDate.setDate(now.getDate() - 30);
      else if (range === '90d') startDate.setDate(now.getDate() - 90);

      const startTimestamp = startDate.toISOString();

      // Get data from ai_requests
      const { data: requests } = await supabase
        .from('ai_requests')
        .select('tokens_used, cost, created_at')
        .gte('created_at', startTimestamp);

      const totalRequests = requests?.length || 0;
      const totalCost = (requests || []).reduce((sum, r) => sum + (r.cost || 0), 0);
      const totalTokens = (requests || []).reduce((sum, r) => sum + (r.tokens_used || 0), 0);

      // Get active users
      const { data: uniqueUsers } = await supabase
        .from('ai_requests')
        .select('user_id')
        .gte('created_at', startTimestamp);

      const activeUsers = new Set((uniqueUsers || []).map((u: any) => u.user_id)).size;

      // Get today's stats
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todayRequests } = await supabase
        .from('ai_requests')
        .select('cost')
        .gte('created_at', todayStart.toISOString());

      const requestsToday = todayRequests?.length || 0;
      const costToday = (todayRequests || []).reduce((sum, r) => sum + (r.cost || 0), 0);

      // Get this month's stats
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: monthRequests } = await supabase
        .from('ai_requests')
        .select('cost')
        .gte('created_at', monthStart.toISOString());

      const requestsThisMonth = monthRequests?.length || 0;
      const costThisMonth = (monthRequests || []).reduce((sum, r) => sum + (r.cost || 0), 0);

      res.json({
        success: true,
        data: {
          total_requests: totalRequests,
          total_cost: totalCost,
          total_tokens: totalTokens,
          active_users: activeUsers,
          requests_today: requestsToday,
          cost_today: costToday,
          requests_this_month: requestsThisMonth,
          cost_this_month: costThisMonth,
          avg_response_time: 245, // Mock for now
          success_rate: 0.95 // Mock for now
        }
      });
    } catch (error: any) {
      console.error('Get usage stats error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/sdk/usage/by-user - Get usage by user
  router.get('/usage/by-user', async (req: Request, res: Response) => {
    try {
      // Get all users with SDK access
      const { data: profiles } = await supabase
        .from('sdk_profiles')
        .select('user_id');

      const userIds = (profiles || []).map((p: any) => p.user_id);

      if (userIds.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Get usage data
      const { data: requests } = await supabase
        .from('ai_requests')
        .select(`
          user_id,
          cost,
          tokens_used,
          created_at
        `)
        .in('user_id', userIds);

      // Get user details
      const { data: users } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          company_id,
          companies!users_company_id_fkey(id, name)
        `)
        .in('id', userIds);

      // Get profile details
      const { data: profileDetails } = await supabase
        .from('sdk_profiles')
        .select('user_id, subscription_tier')
        .in('user_id', userIds);

      // Aggregate usage by user
      const userUsageMap: any = {};
      (requests || []).forEach((req: any) => {
        const userId = req.user_id;
        if (!userUsageMap[userId]) {
          userUsageMap[userId] = {
            total_requests: 0,
            total_cost: 0,
            total_tokens: 0,
            last_request: null
          };
        }
        userUsageMap[userId].total_requests += 1;
        userUsageMap[userId].total_cost += req.cost || 0;
        userUsageMap[userId].total_tokens += req.tokens_used || 0;
        if (!userUsageMap[userId].last_request || req.created_at > userUsageMap[userId].last_request) {
          userUsageMap[userId].last_request = req.created_at;
        }
      });

      // Combine with user details
      const userUsage = (users || []).map((user: any) => {
        const usage = userUsageMap[user.id] || {
          total_requests: 0,
          total_cost: 0,
          total_tokens: 0,
          last_request: null
        };
        const profile = (profileDetails || []).find((p: any) => p.user_id === user.id);
        const companies = Array.isArray(user.companies) ? user.companies[0] : user.companies;

        return {
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          company_name: companies?.name || null,
          tier: profile?.subscription_tier || 'free',
          total_requests: usage.total_requests,
          total_cost: usage.total_cost,
          total_tokens: usage.total_tokens,
          last_request: usage.last_request
        };
      });

      userUsage.sort((a: any, b: any) => b.total_requests - a.total_requests);

      res.json({ success: true, data: userUsage });
    } catch (error: any) {
      console.error('Get user usage error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/sdk/usage/recent - Get recent requests
  router.get('/usage/recent', async (req: Request, res: Response) => {
    try {
      const { data: requests, error } = await supabase
        .from('ai_requests')
        .select(`
          id,
          user_id,
          prompt,
          response,
          tokens_used,
          cost,
          created_at,
          users!ai_requests_user_id_fkey(id, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const recentRequests = (requests || []).map((req: any) => {
        const users = Array.isArray(req.users) ? req.users[0] : req.users;
        return {
          id: req.id,
          user_email: users?.email || null,
          request_type: 'chat', // Default
          tokens_used: req.tokens_used || 0,
          cost: req.cost || 0,
          timestamp: req.created_at,
          success: true
        };
      });

      res.json({ success: true, data: recentRequests });
    } catch (error: any) {
      console.error('Get recent requests error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/sdk/usage/export - Export usage report
  router.get('/usage/export', async (req: Request, res: Response) => {
    try {
      const { range = '7d' } = req.query as any;
      
      const now = new Date();
      let startDate = new Date();
      if (range === '24h') startDate.setHours(now.getHours() - 24);
      else if (range === '7d') startDate.setDate(now.getDate() - 7);
      else if (range === '30d') startDate.setDate(now.getDate() - 30);
      else if (range === '90d') startDate.setDate(now.getDate() - 90);

      const { data: requests } = await supabase
        .from('ai_requests')
        .select(`
          created_at,
          tokens_used,
          cost,
          users!ai_requests_user_id_fkey(id, email, name),
          companies!users_company_id_fkey(id, name)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      // Transform data for CSV
      const csvRows = (requests || []).map((req: any) => {
        const users = Array.isArray(req.users) ? req.users[0] : req.users;
        const companies = Array.isArray(req.companies) ? req.companies[0] : req.companies;
        return [
          req.created_at,
          users?.email || '',
          users?.name || '',
          companies?.name || '',
          'chat', // request_type
          req.tokens_used || 0,
          req.cost || 0,
          'Yes'
        ].join(',');
      });

      const headers = ['Timestamp', 'User Email', 'User Name', 'Company', 'Request Type', 'Tokens', 'Cost', 'Success'];
      const csv = [headers.join(','), ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=usage-report-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error: any) {
      console.error('Export usage error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // DATABASE CAPABILITY MANAGEMENT
  // ============================================

  // GET /api/admin/sdk/database-stats - Get database statistics
  router.get('/database-stats', async (req: Request, res: Response) => {
    try {
      // Note: Supabase doesn't expose direct database size information
      // We'll provide approximate stats based on record counts
      const tables = [
        'users', 'companies', 'projects', 'clients', 'tasks', 'sdk_apps',
        'sdk_workflows', 'sdk_profiles', 'api_usage_logs', 'activities'
      ];

      const tableCounts = await Promise.all(
        tables.map(async (table) => {
          const { count } = await supabase
            .from(table)
            .select('id', { count: 'exact', head: true });
          return {
            name: table,
            row_count: count || 0,
            size_mb: ((count || 0) * 1024) / 1024 / 1024 // Rough estimate
          };
        })
      );

      const totalRecords = tableCounts.reduce((sum, t) => sum + t.row_count, 0);
      const largestTables = tableCounts
        .sort((a, b) => b.size_mb - a.size_mb)
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          total_size_mb: 'N/A (Supabase managed)',
          table_count: tables.length,
          total_records: totalRecords,
          largest_tables: largestTables
        }
      });
    } catch (error: any) {
      console.error('Get database stats error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/sdk/company-quotas - Get company quotas
  router.get('/company-quotas', async (req: Request, res: Response) => {
    try {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name');

      const quotas = await Promise.all(
        (companies || []).map(async (company: any) => {
          const [projectsResult, usersResult] = await Promise.all([
            supabase.from('projects').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('company_id', company.id)
          ]);

          return {
            company_id: company.id,
            company_name: company.name,
            storage_used_mb: 0,
            storage_limit_mb: 1000,
            record_count: projectsResult.count || 0,
            record_limit: 10000,
            user_count: usersResult.count || 0,
            user_limit: 50
          };
        })
      );

      res.json({ success: true, data: quotas });
    } catch (error: any) {
      console.error('Get company quotas error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/sdk/user-quotas - Get user quotas
  router.get('/user-quotas', async (req: Request, res: Response) => {
    try {
      const { data: profiles } = await supabase
        .from('sdk_profiles')
        .select('user_id, api_requests_used, api_requests_limit');

      const userIds = (profiles || []).map((p: any) => p.user_id);

      if (userIds.length === 0) {
        return res.json({ success: true, data: [] });
      }

      const { data: users } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          company_id,
          companies!users_company_id_fkey(id, name)
        `)
        .in('id', userIds);

      const quotas = (users || []).map((user: any) => {
        const profile = (profiles || []).find((p: any) => p.user_id === user.id);
        const companies = Array.isArray(user.companies) ? user.companies[0] : user.companies;

        return {
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          company_name: companies?.name || null,
          storage_used_mb: 0,
          storage_limit_mb: 100,
          api_requests_used: profile?.api_requests_used || 0,
          api_requests_limit: profile?.api_requests_limit || 100
        };
      });

      res.json({ success: true, data: quotas });
    } catch (error: any) {
      console.error('Get user quotas error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // DEVELOPER DASHBOARD ENDPOINTS
  // ============================================

  // GET /api/admin/sdk/stats - Get comprehensive SDK statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const [totalDevelopersResult, totalAppsResult, totalWorkflowsResult, totalAgentsResult] = await Promise.all([
        supabase.from('sdk_profiles').select('user_id', { count: 'exact', head: true }),
        supabase.from('sdk_apps').select('id', { count: 'exact', head: true }),
        supabase.from('sdk_workflows').select('id', { count: 'exact', head: true }),
        supabase.from('ai_agents').select('id', { count: 'exact', head: true })
      ]);

      // Get active developers (used API in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeDevelopersData } = await supabase
        .from('api_usage_logs')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const activeDevelopers = new Set((activeDevelopersData || []).map((d: any) => d.user_id)).size;

      // Get today's requests
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todayRequests } = await supabase
        .from('api_usage_logs')
        .select('id')
        .gte('created_at', todayStart.toISOString());

      // Get this month's requests and cost
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: monthRequests } = await supabase
        .from('api_usage_logs')
        .select('cost')
        .gte('created_at', monthStart.toISOString());

      const apiRequestsToday = todayRequests?.length || 0;
      const apiRequestsMonth = monthRequests?.length || 0;
      const totalCost = (monthRequests || []).reduce((sum, r) => sum + (r.cost || 0), 0);

      const stats = {
        totalDevelopers: totalDevelopersResult.count || 0,
        activeDevelopers,
        totalApps: totalAppsResult.count || 0,
        totalWorkflows: totalWorkflowsResult.count || 0,
        totalAgents: totalAgentsResult.count || 0,
        apiRequestsToday,
        apiRequestsMonth,
        totalCost,
        avgResponseTime: 245
      };

      res.json({ success: true, stats });
    } catch (error: any) {
      console.error('Get SDK stats error:', error);
      res.status(500).json({ error: 'Failed to get SDK stats' });
    }
  });

  // GET /api/admin/sdk/developers - Get all developer profiles
  router.get('/developers', async (req: Request, res: Response) => {
    try {
      const { data: profiles, error } = await supabase
        .from('sdk_profiles')
        .select(`
          *,
          users!sdk_profiles_user_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const developers = (profiles || []).map((profile: any) => {
        const users = Array.isArray(profile.users) ? profile.users[0] : profile.users;
        return {
          ...profile,
          userName: users?.name || null,
          userEmail: users?.email || null
        };
      });

      res.json({ success: true, developers });
    } catch (error: any) {
      console.error('Get developers error:', error);
      res.status(500).json({ error: 'Failed to get developers' });
    }
  });

  // GET /api/admin/sdk/usage-logs - Get API usage logs
  router.get('/usage-logs', async (req: Request, res: Response) => {
    try {
      const limit = parseInt((req.query.limit as string) || '50', 10);

      const { data: logs, error } = await supabase
        .from('api_usage_logs')
        .select(`
          *,
          users!api_usage_logs_user_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const transformedLogs = (logs || []).map((log: any) => {
        const users = Array.isArray(log.users) ? log.users[0] : log.users;
        return {
          ...log,
          userName: users?.name || null,
          userEmail: users?.email || null
        };
      });

      res.json({ success: true, logs: transformedLogs });
    } catch (error: any) {
      console.error('Get usage logs error:', error);
      res.status(500).json({ error: 'Failed to get usage logs' });
    }
  });

  // GET /api/admin/sdk/apps - Get all SDK apps
  router.get('/apps', async (req: Request, res: Response) => {
    try {
      const { data: apps, error } = await supabase
        .from('sdk_apps')
        .select(`
          *,
          users!sdk_apps_developer_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedApps = (apps || []).map((app: any) => {
        const users = Array.isArray(app.users) ? app.users[0] : app.users;
        return {
          ...app,
          developer_name: users?.name || null,
          developer_email: users?.email || null
        };
      });

      res.json({ success: true, apps: transformedApps });
    } catch (error: any) {
      console.error('Get SDK apps error:', error);
      res.status(500).json({ error: 'Failed to get SDK apps' });
    }
  });

  return router;
}

export default function (supabase: SupabaseClient) {
  return createAdminSDKRouter(supabase);
}
