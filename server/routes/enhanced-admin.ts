// CortexBuild - Enhanced Admin Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { authenticateToken, getCurrentUserByToken } from '../auth-supabase';
import { v4 as uuidv4 } from 'uuid';

export function createEnhancedAdminRoutes(supabase: SupabaseClient) {
  const router = Router();

  // Middleware to check super admin access
  const requireSuperAdmin = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await getCurrentUserByToken(token);
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Super admin access required' });
      }

      req.user = user;
      next();
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message || 'Unauthorized' });
    }
  };

  // Apply authentication to all routes
  router.use(authenticateToken);
  router.use(requireSuperAdmin);

  // ============================================================================
  // DASHBOARD ANALYTICS
  // ============================================================================

  // GET /api/admin/enhanced/analytics/overview - Complete dashboard overview
  router.get('/analytics/overview', async (req, res) => {
    try {
      // Get user statistics
      const [totalUsersResult, usersWithLogin, newUsersWeek] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).not('last_login', 'is', null),
        (async () => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
        })()
      ]);

      const userStats = {
        total: totalUsersResult.count || 0,
        active: usersWithLogin.count || 0,
        new_this_week: (await newUsersWeek).count || 0
      };

      // Get company statistics
      const [totalCompaniesResult] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact', head: true })
      ]);

      const companyStats = {
        total: totalCompaniesResult.count || 0,
        active: totalCompaniesResult.count || 0
      };

      // Get project statistics
      const [totalProjectsResult, activeProjectsResult] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      const projectStats = {
        total: totalProjectsResult.count || 0,
        active: activeProjectsResult.count || 0
      };

      // Get SDK statistics
      const { data: requests } = await supabase
        .from('ai_requests')
        .select('user_id, tokens_used, cost');

      const uniqueDevelopers = new Set((requests || []).map((r: any) => r.user_id)).size;
      const totalTokens = (requests || []).reduce((sum, r) => sum + (r.tokens_used || 0), 0);
      const totalCost = (requests || []).reduce((sum, r) => sum + (r.cost || 0), 0);

      const sdkStats = {
        developers: uniqueDevelopers,
        total_requests: requests?.length || 0,
        total_tokens: totalTokens,
        total_cost: totalCost
      };

      // Revenue calculation (mock for now - integrate with payment system)
      const revenue = {
        total: 125000,
        monthly: 15000,
        growth: 12.5
      };

      // System health (mock - integrate with actual monitoring)
      const system = {
        uptime: 99.9,
        cpu: Math.floor(Math.random() * 30) + 30, // 30-60%
        memory: Math.floor(Math.random() * 30) + 50, // 50-80%
        storage: Math.floor(Math.random() * 20) + 30 // 30-50%
      };

      res.json({
        success: true,
        data: {
          users: userStats,
          companies: companyStats,
          projects: projectStats,
          sdk: sdkStats,
          revenue,
          system
        }
      });
    } catch (error: any) {
      console.error('Analytics overview error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  // GET /api/admin/enhanced/users/detailed - Get detailed user list with stats
  router.get('/users/detailed', async (req, res) => {
    try {
      const { data: users } = await supabase
        .from('users')
        .select(`
          id,
          email,
          name,
          role,
          company_id,
          created_at,
          last_login,
          companies!users_company_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false });

      // Get stats for each user
      const usersWithStats = await Promise.all(
        (users || []).map(async (user: any) => {
          const [projectsResult, requestsResult] = await Promise.all([
            supabase.from('projects').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
            supabase.from('ai_requests').select('cost').eq('user_id', user.id)
          ]);

          const companies = Array.isArray(user.companies) ? user.companies[0] : user.companies;
          const requests = requestsResult.data || [];
          const totalCost = requests.reduce((sum, r) => sum + (r.cost || 0), 0);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            company_id: user.company_id,
            company_name: companies?.name || null,
            created_at: user.created_at,
            last_login: user.last_login,
            project_count: projectsResult.count || 0,
            api_requests: requests.length,
            total_cost: totalCost
          };
        })
      );

      res.json({ success: true, data: usersWithStats });
    } catch (error: any) {
      console.error('Get detailed users error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/admin/enhanced/users/create - Create new user
  router.post('/users/create', async (req, res) => {
    try {
      const { email, name, password, role, company_id } = req.body;

      // Validate required fields
      if (!email || !name || !password || !role) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userId = uuidv4();
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          name,
          password_hash: hashedPassword,
          role,
          company_id: company_id || null
        })
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    } catch (error: any) {
      console.error('Create user error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PATCH /api/admin/enhanced/users/:id - Update user
  router.patch('/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, company_id, active } = req.body;

      const updates: any = {};

      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;
      if (role !== undefined) updates.role = role;
      if (company_id !== undefined) updates.company_id = company_id;
      if (active !== undefined) updates.is_active = active === true || active === 1;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'User updated successfully' });
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/admin/enhanced/users/:id - Delete user
  router.delete('/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Don't allow deleting yourself
      if (user.id === id) {
        return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // COMPANY MANAGEMENT
  // ============================================================================

  // GET /api/admin/enhanced/companies/detailed - Get detailed company list
  router.get('/companies/detailed', async (req, res) => {
    try {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, created_at')
        .order('created_at', { ascending: false });

      // Get stats for each company
      const companiesWithStats = await Promise.all(
        (companies || []).map(async (company: any) => {
          const [usersResult, projectsResult, activeUsersResult] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
            supabase.from('projects').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
            (async () => {
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              const { data: users } = await supabase
                .from('users')
                .select('id, last_login')
                .eq('company_id', company.id);
              const active = (users || []).filter((u: any) => 
                u.last_login && new Date(u.last_login) > thirtyDaysAgo
              ).length;
              return active;
            })()
          ]);

          return {
            id: company.id,
            name: company.name,
            created_at: company.created_at,
            user_count: usersResult.count || 0,
            project_count: projectsResult.count || 0,
            active_users: await activeUsersResult
          };
        })
      );

      res.json({ success: true, data: companiesWithStats });
    } catch (error: any) {
      console.error('Get detailed companies error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/admin/enhanced/companies/create - Create new company
  router.post('/companies/create', async (req, res) => {
    try {
      const { name, industry, size } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Company name is required' });
      }

      const companyId = uuidv4();
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          id: companyId,
          name
        })
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: { id: company.id, name: company.name }
      });
    } catch (error: any) {
      console.error('Create company error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // SDK PLATFORM MANAGEMENT
  // ============================================================================

  // GET /api/admin/enhanced/sdk/detailed-usage - Detailed SDK usage analytics
  router.get('/sdk/detailed-usage', async (req, res) => {
    try {
      const { timeRange = '30d' } = req.query as any;

      let daysBack = 30;
      if (timeRange === '7d') daysBack = 7;
      if (timeRange === '24h') daysBack = 1;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const startDateIso = startDate.toISOString();

      // Get usage data
      const { data: requests } = await supabase
        .from('ai_requests')
        .select('user_id, model, tokens_used, cost, created_at')
        .gte('created_at', startDateIso);

      // Get user details
      const userIds = [...new Set((requests || []).map((r: any) => r.user_id))];
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);

      // Group usage by user and model
      const userUsageMap: any = {};
      (requests || []).forEach((req: any) => {
        const key = `${req.user_id}_${req.model || 'unknown'}`;
        if (!userUsageMap[key]) {
          userUsageMap[key] = {
            id: req.user_id,
            model: req.model || 'unknown',
            request_count: 0,
            total_tokens: 0,
            total_cost: 0,
            last_request: null
          };
        }
        userUsageMap[key].request_count += 1;
        userUsageMap[key].total_tokens += req.tokens_used || 0;
        userUsageMap[key].total_cost += req.cost || 0;
        if (!userUsageMap[key].last_request || req.created_at > userUsageMap[key].last_request) {
          userUsageMap[key].last_request = req.created_at;
        }
      });

      // Combine with user details
      const userUsage = Object.values(userUsageMap).map((usage: any) => {
        const user = (users || []).find((u: any) => u.id === usage.id);
        return {
          id: usage.id,
          name: user?.name || null,
          email: user?.email || null,
          request_count: usage.request_count,
          total_tokens: usage.total_tokens,
          total_cost: usage.total_cost,
          model: usage.model,
          last_request: usage.last_request
        };
      });

      userUsage.sort((a: any, b: any) => b.total_cost - a.total_cost);

      // Group usage by model
      const modelUsageMap: any = {};
      (requests || []).forEach((req: any) => {
        const model = req.model || 'unknown';
        if (!modelUsageMap[model]) {
          modelUsageMap[model] = {
            model,
            request_count: 0,
            total_tokens: 0,
            total_cost: 0
          };
        }
        modelUsageMap[model].request_count += 1;
        modelUsageMap[model].total_tokens += req.tokens_used || 0;
        modelUsageMap[model].total_cost += req.cost || 0;
      });

      const modelUsage = Object.values(modelUsageMap).map((usage: any) => ({
        model: usage.model,
        request_count: usage.request_count,
        total_tokens: usage.total_tokens,
        total_cost: usage.total_cost,
        avg_cost: usage.total_cost / usage.request_count
      }));

      modelUsage.sort((a: any, b: any) => b.total_cost - a.total_cost);

      // Group by date
      const dailyTrendMap: any = {};
      (requests || []).forEach((req: any) => {
        const date = new Date(req.created_at).toISOString().split('T')[0];
        if (!dailyTrendMap[date]) {
          dailyTrendMap[date] = {
            date,
            requests: 0,
            tokens: 0,
            cost: 0
          };
        }
        dailyTrendMap[date].requests += 1;
        dailyTrendMap[date].tokens += req.tokens_used || 0;
        dailyTrendMap[date].cost += req.cost || 0;
      });

      const dailyTrend = Object.values(dailyTrendMap)
        .sort((a: any, b: any) => b.date.localeCompare(a.date));

      res.json({
        success: true,
        data: {
          userUsage: userUsage.slice(0, 50),
          modelUsage,
          dailyTrend
        }
      });
    } catch (error: any) {
      console.error('SDK detailed usage error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/admin/enhanced/sdk/grant-access - Grant SDK access to user
  router.post('/sdk/grant-access', async (req, res) => {
    try {
      const { userId, tier } = req.body;

      if (!userId || !tier) {
        return res.status(400).json({ success: false, error: 'User ID and tier are required' });
      }

      // Check if user exists
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Check if profile exists
      const { data: existing } = await supabase
        .from('sdk_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const limits: Record<string, number> = {
          free: 10,
          starter: 100,
          pro: 1000,
          enterprise: -1
        };
        const limit = limits[tier] || 10;

        await supabase
          .from('sdk_profiles')
          .update({
            subscription_tier: tier,
            api_requests_limit: limit
          })
          .eq('user_id', userId);
      } else {
        const limits: Record<string, number> = {
          free: 10,
          starter: 100,
          pro: 1000,
          enterprise: -1
        };
        const limit = limits[tier] || 10;

        await supabase
          .from('sdk_profiles')
          .insert({
            user_id: userId,
            subscription_tier: tier,
            api_requests_limit: limit,
            api_requests_used: 0
          });
      }

      res.json({ success: true, message: 'SDK access granted successfully' });
    } catch (error: any) {
      console.error('Grant SDK access error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // SYSTEM MONITORING
  // ============================================================================

  // GET /api/admin/enhanced/system/health - System health check
  router.get('/system/health', async (req, res) => {
    try {
      // Note: Supabase doesn't expose direct database size information
      // We'll provide approximate stats
      const { count: tableCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      res.json({
        success: true,
        data: {
          database: {
            size: 'N/A (Supabase managed)',
            tables: 25, // Approximate
            healthy: true
          },
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('System health error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
