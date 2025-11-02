// CortexBuild - SDK API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../auth-supabase';
import { AICodeGenerator, createAICodeGenerator } from '../services/ai-code-generator';
import { v4 as uuidv4 } from 'uuid';

// Middleware to check if user is a developer
const requireDeveloper = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user || (user.role !== 'developer' && user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Developer access required' });
  }
  next();
};

// Initialize SDK tables (for Supabase, tables should already exist from migrations)
export const initSdkTables = async (supabase: SupabaseClient) => {
  // Note: In Supabase, tables are created via SQL migrations
  // This function is kept for compatibility but does nothing
  // Tables should exist: sdk_workflows, sdk_apps, ai_agents, sdk_profiles, api_usage_logs
  console.log('SDK tables should already exist in Supabase from migrations');
};

export const createSDKRouter = (supabase: SupabaseClient) => {
  const router = Router();

  // Apply authentication to all routes
  router.use(authenticateToken);
  router.use(requireDeveloper);

  // Get or create SDK profile
  router.get('/profile', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      let { data: profile, error } = await supabase
        .from('sdk_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const id = `sdk-profile-${Date.now()}`;
        const { data: newProfile, error: createError } = await supabase
          .from('sdk_profiles')
          .insert({
            id,
            user_id: user.id,
            subscription_tier: 'free',
            api_requests_limit: 100,
            api_requests_used: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      } else if (error) {
        throw error;
      }

      res.json({
        success: true,
        profile: {
          ...profile,
          apiRequestsUsed: profile.api_requests_used || 0,
          apiRequestsLimit: profile.api_requests_limit || 100,
          subscriptionTier: profile.subscription_tier || 'free'
        }
      });
    } catch (error: any) {
      console.error('Get SDK profile error:', error);
      res.status(500).json({ error: 'Failed to get SDK profile' });
    }
  });

  // Update subscription tier
  router.patch('/profile/subscription', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { tier } = req.body;

      const limits: Record<string, number> = {
        free: 100,
        starter: 1000,
        pro: 10000,
        enterprise: 100000
      };

      const limit = limits[tier] || 100;

      const { data: profile, error } = await supabase
        .from('sdk_profiles')
        .update({
          subscription_tier: tier,
          api_requests_limit: limit
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        profile: {
          ...profile,
          apiRequestsUsed: profile.api_requests_used || 0,
          apiRequestsLimit: profile.api_requests_limit || 100,
          subscriptionTier: profile.subscription_tier || 'free'
        }
      });
    } catch (error: any) {
      console.error('Update subscription error:', error);
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  });

  // Save API key
  router.post('/profile/api-key', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { provider, encryptedKey } = req.body;

      const updates: any = {};
      if (provider === 'gemini') {
        updates.gemini_api_key = encryptedKey;
      }

      const { error } = await supabase
        .from('sdk_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Save API key error:', error);
      res.status(500).json({ error: 'Failed to save API key' });
    }
  });

  // Get all workflows
  router.get('/workflows', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: workflows, error } = await supabase
        .from('sdk_workflows')
        .select('*')
        .eq('developer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        workflows: (workflows || []).map((w: any) => ({
          ...w,
          definition: w.definition ? (typeof w.definition === 'string' ? JSON.parse(w.definition) : w.definition) : {},
          isActive: w.is_active === true || w.is_active === 1,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
          developerId: w.developer_id,
          companyId: w.company_id
        }))
      });
    } catch (error: any) {
      console.error('Get workflows error:', error);
      res.status(500).json({ error: 'Failed to get workflows' });
    }
  });

  // Save workflow
  router.post('/workflows', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { name, definition, isActive, companyId } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const id = uuidv4();

      const { data: workflow, error } = await supabase
        .from('sdk_workflows')
        .insert({
          id,
          developer_id: user.id,
          company_id: companyId || null,
          name,
          definition: typeof definition === 'string' ? definition : JSON.stringify(definition || {}),
          is_active: isActive === true || isActive === 1
        })
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        workflow: {
          ...workflow,
          definition: workflow.definition ? (typeof workflow.definition === 'string' ? JSON.parse(workflow.definition) : workflow.definition) : {},
          isActive: workflow.is_active === true || workflow.is_active === 1,
          createdAt: workflow.created_at,
          updatedAt: workflow.updated_at,
          developerId: workflow.developer_id,
          companyId: workflow.company_id
        }
      });
    } catch (error: any) {
      console.error('Save workflow error:', error);
      res.status(500).json({ error: 'Failed to save workflow' });
    }
  });

  // Get all apps
  router.get('/apps', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: apps, error } = await supabase
        .from('sdk_apps')
        .select('*')
        .eq('developer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        apps: (apps || []).map((a: any) => ({
          ...a,
          developerId: a.developer_id,
          companyId: a.company_id,
          createdAt: a.created_at,
          updatedAt: a.updated_at
        }))
      });
    } catch (error: any) {
      console.error('Get apps error:', error);
      res.status(500).json({ error: 'Failed to get apps' });
    }
  });

  // Save app
  router.post('/apps', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { name, description, code, version, status, companyId } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const id = uuidv4();

      const { data: app, error } = await supabase
        .from('sdk_apps')
        .insert({
          id,
          developer_id: user.id,
          company_id: companyId || null,
          name,
          description: description || '',
          code: code || '',
          version: version || '1.0.0',
          status: status || 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        app: {
          ...app,
          developerId: app.developer_id,
          companyId: app.company_id,
          createdAt: app.created_at,
          updatedAt: app.updated_at
        }
      });
    } catch (error: any) {
      console.error('Save app error:', error);
      res.status(500).json({ error: 'Failed to save app' });
    }
  });

  // Update app status
  router.patch('/apps/:id/status', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { status } = req.body;

      const { data: app, error } = await supabase
        .from('sdk_apps')
        .update({ status })
        .eq('id', id)
        .eq('developer_id', user.id)
        .select()
        .single();

      if (error || !app) {
        return res.status(404).json({ error: 'App not found' });
      }

      res.json({
        success: true,
        app: {
          ...app,
          developerId: app.developer_id,
          companyId: app.company_id,
          createdAt: app.created_at,
          updatedAt: app.updated_at
        }
      });
    } catch (error: any) {
      console.error('Update app status error:', error);
      res.status(500).json({ error: 'Failed to update app status' });
    }
  });

  // Get all AI agents
  router.get('/agents', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: agents, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('developer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        agents: (agents || []).map((a: any) => ({
          ...a,
          developerId: a.developer_id,
          companyId: a.company_id,
          config: a.config ? (typeof a.config === 'string' ? JSON.parse(a.config) : a.config) : {},
          createdAt: a.created_at,
          updatedAt: a.updated_at
        }))
      });
    } catch (error: any) {
      console.error('Get agents error:', error);
      res.status(500).json({ error: 'Failed to get agents' });
    }
  });

  // Update agent status
  router.patch('/agents/:id/status', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { status } = req.body;

      const { data: agent, error } = await supabase
        .from('ai_agents')
        .update({ status })
        .eq('id', id)
        .eq('developer_id', user.id)
        .select()
        .single();

      if (error || !agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json({
        success: true,
        agent: {
          ...agent,
          developerId: agent.developer_id,
          companyId: agent.company_id,
          config: agent.config ? (typeof agent.config === 'string' ? JSON.parse(agent.config) : agent.config) : {},
          createdAt: agent.created_at,
          updatedAt: agent.updated_at
        }
      });
    } catch (error: any) {
      console.error('Update agent status error:', error);
      res.status(500).json({ error: 'Failed to update agent status' });
    }
  });

  // Get usage analytics
  router.get('/analytics/usage', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      // Get current month usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Note: Supabase doesn't support GROUP BY with aggregations directly in select
      // We'll need to fetch all and group in memory or use a database function
      const { data: logs, error } = await supabase
        .from('api_usage_logs')
        .select('provider, cost, total_tokens')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      // Group by provider
      const grouped = (logs || []).reduce((acc: any, log: any) => {
        const provider = log.provider || 'unknown';
        if (!acc[provider]) {
          acc[provider] = {
            provider,
            requestsThisMonth: 0,
            monthToDateCost: 0,
            totalTokens: 0
          };
        }
        acc[provider].requestsThisMonth += 1;
        acc[provider].monthToDateCost += log.cost || 0;
        acc[provider].totalTokens += log.total_tokens || 0;
        return acc;
      }, {});

      res.json({
        success: true,
        costSummary: Object.values(grouped)
      });
    } catch (error: any) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });

  // Log API usage
  router.post('/analytics/log', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { provider, model, promptTokens, completionTokens, cost } = req.body;

      const id = uuidv4();
      const totalTokens = (promptTokens || 0) + (completionTokens || 0);

      const { error: logError } = await supabase
        .from('api_usage_logs')
        .insert({
          id,
          user_id: user.id,
          provider,
          model: model || '',
          prompt_tokens: promptTokens || 0,
          completion_tokens: completionTokens || 0,
          total_tokens: totalTokens,
          cost: cost || 0
        });

      if (logError) throw logError;

      // Update profile usage count using RPC or direct increment
      const { data: profile } = await supabase
        .from('sdk_profiles')
        .select('api_requests_used')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('sdk_profiles')
          .update({
            api_requests_used: (profile.api_requests_used || 0) + 1
          })
          .eq('user_id', user.id);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Log usage error:', error);
      res.status(500).json({ error: 'Failed to log usage' });
    }
  });

  // Generate code with AI
  router.post('/generate', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { prompt, provider = 'openai', model } = req.body;

      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Check usage limits
      const { data: profile } = await supabase
        .from('sdk_profiles')
        .select('api_requests_used, api_requests_limit')
        .eq('user_id', user.id)
        .single();

      if (profile && (profile.api_requests_used || 0) >= (profile.api_requests_limit || 100)) {
        return res.status(429).json({
          error: 'API request limit reached. Please upgrade your subscription.'
        });
      }

      // Create AI generator
      const aiGenerator = createAICodeGenerator();

      // Generate code
      console.log(`🤖 Generating code with ${provider} for user ${user.email}...`);
      const result = await aiGenerator.generateCode(prompt, provider, model);

      // Log usage
      const logId = uuidv4();
      await supabase
        .from('api_usage_logs')
        .insert({
          id: logId,
          user_id: user.id,
          provider: result.provider,
          model: result.model,
          prompt_tokens: result.tokens.prompt,
          completion_tokens: result.tokens.completion,
          total_tokens: result.tokens.total,
          cost: result.cost
        });

      // Update profile usage count
      if (profile) {
        await supabase
          .from('sdk_profiles')
          .update({
            api_requests_used: (profile.api_requests_used || 0) + 1
          })
          .eq('user_id', user.id);
      }

      console.log(`✅ Code generated successfully (${result.tokens.total} tokens, $${result.cost.toFixed(4)})`);

      res.json({
        success: true,
        code: result.code,
        explanation: result.explanation,
        tokens: result.tokens,
        cost: result.cost,
        provider: result.provider,
        model: result.model
      });
    } catch (error: any) {
      console.error('Generate code error:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate code',
        details: error.toString()
      });
    }
  });

  // Get available AI models
  router.get('/models/:provider', (req: Request, res: Response) => {
    try {
      const { provider } = req.params;

      if (provider !== 'gemini' && provider !== 'openai') {
        return res.status(400).json({ error: 'Invalid provider. Use "gemini" or "openai"' });
      }

      const models = AICodeGenerator.getAvailableModels(provider);

      res.json({
        success: true,
        provider,
        models
      });
    } catch (error: any) {
      console.error('Get models error:', error);
      res.status(500).json({ error: 'Failed to get models' });
    }
  });

  return router;
};

export default createSDKRouter;
