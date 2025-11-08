// CortexBuild - Developer Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { v4 as uuidv4 } from 'uuid';
import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../auth-supabase';
import {
  getCapabilitiesForRole,
  enforceSandboxRunQuota,
  getSandboxUsageCounts,
  buildRoleExperience
} from '../utils/capabilities';

export function createDeveloperRoutes(supabase: SupabaseClient) {
  const router = Router();

  // Middleware to check sandbox access privileges
  const requireSandboxAccess = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await (await import('../auth-supabase')).getCurrentUserByToken(token);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid session' });
      }

      const capabilities = getCapabilitiesForRole(user.role);

      // Allow developer, super admin, or company admin with sandbox capabilities
      if (!capabilities.canAccessSandbox) {
        return res.status(403).json({ success: false, error: 'Sandbox access restricted for this role' });
      }

      req.user = user;
      req.capabilities = capabilities;
      next();
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message || 'Unauthorized' });
    }
  };

  // Apply authentication and developer check to all routes
  router.use(authenticateToken);
  router.use(requireSandboxAccess);

  const logDeveloperEvent = async (user: any, eventType: string, payload: Record<string, unknown>) => {
    try {
      await supabase
        .from('developer_console_events')
        .insert({
          id: `dev-${uuidv4()}`,
          user_id: user.id,
          company_id: user.company_id || user.companyId || null,
          event_type: eventType,
          payload: JSON.stringify(payload ?? {})
        });
    } catch (error) {
      console.error('[Developer] log event failed', error);
    }
  };

  const ensureSdkProfile = async (userId: string) => {
    let { data: profile } = await supabase
      .from('sdk_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      const id = `sdk-profile-${Date.now()}`;
      const { data: newProfile } = await supabase
        .from('sdk_profiles')
        .insert({
          id,
          user_id: userId,
          subscription_tier: 'free',
          api_requests_limit: 100
        })
        .select()
        .single();
      profile = newProfile;
    }
    return profile;
  };

  const mapAppRow = (row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    version: row.version,
    developerId: row.developer_id,
    companyId: row.company_id,
    code: row.code,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });

  const mapWorkflowRow = (row: any) => ({
    id: row.id,
    name: row.name,
    developerId: row.developer_id,
    companyId: row.company_id,
    definition: row.definition ? (typeof row.definition === 'string' ? JSON.parse(row.definition) : row.definition) : { nodes: [], connections: [] },
    isActive: row.is_active === true || row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });

  const mapAgentRow = (row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    developerId: row.developer_id,
    companyId: row.company_id,
    config: row.config ? (typeof row.config === 'string' ? JSON.parse(row.config) : row.config) : {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });

  const mapBuilderModuleRow = (row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    version: row.version,
    status: row.status,
    manifest: row.manifest ? (typeof row.manifest === 'string' ? JSON.parse(row.manifest) : row.manifest) : { nodes: [], connections: [] },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });

  router.get('/dashboard/summary', async (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      const profileRow = await ensureSdkProfile(user.id);
      const usageCounts = await getSandboxUsageCounts(supabase, user.id);

      // Get all data in parallel
      const [appsResult, workflowsResult, webhooksResult, agentsResult, builderModulesResult, usageSummaryResult, sandboxRunsResult] = await Promise.all([
        supabase
          .from('sdk_apps')
          .select('*')
          .eq('developer_id', user.id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('sdk_workflows')
          .select('*')
          .eq('developer_id', user.id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('webhooks')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('ai_agents')
          .select('*')
          .eq('developer_id', user.id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('builder_modules')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        (async () => {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          const { data } = await supabase
            .from('api_usage_logs')
            .select('provider, cost, total_tokens')
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString());
          return data || [];
        })(),
        supabase
          .from('sandbox_runs')
          .select('id, name, definition, result, status, duration_ms, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(15)
      ]);

      const apps = (appsResult.data || []).map(mapAppRow);
      const workflows = (workflowsResult.data || []).map(mapWorkflowRow);
      const webhooks = webhooksResult.data || [];
      const agents = (agentsResult.data || []).map(mapAgentRow);
      const builderModules = (builderModulesResult.data || []).map(mapBuilderModuleRow);

      // Group usage by provider
      const usageSummary = (usageSummaryResult || []).reduce((acc: any, log: any) => {
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

      const profile = {
        id: profileRow?.id,
        userId: profileRow?.user_id,
        subscriptionTier: profileRow?.subscription_tier || 'free',
        apiRequestsUsed: profileRow?.api_requests_used ?? 0,
        apiRequestsLimit: profileRow?.api_requests_limit ?? 0,
        geminiApiKey: profileRow?.gemini_api_key
      };

      const stats = {
        totalApps: apps.length,
        activeApps: apps.filter((app) => app.status === 'approved').length,
        pendingApps: apps.filter((app) => app.status === 'pending_review').length,
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter((wf) => wf.isActive).length,
        totalWebhooks: webhooks.length,
        activeWebhooks: webhooks.filter((hook: any) => hook.is_active === true || hook.is_active === 1).length,
        totalAgents: agents.length,
        runningAgents: agents.filter((agent) => agent.status === 'running').length,
        totalRequestsThisMonth: Object.values(usageSummary).reduce((sum: number, item: any) => sum + item.requestsThisMonth, 0),
        totalCostThisMonth: Object.values(usageSummary).reduce((sum: number, item: any) => sum + item.monthToDateCost, 0),
        totalTokensThisMonth: Object.values(usageSummary).reduce((sum: number, item: any) => sum + item.totalTokens, 0)
      };

      const sandboxRuns = (sandboxRunsResult.data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        definition: row.definition ? (typeof row.definition === 'string' ? JSON.parse(row.definition) : row.definition) : null,
        result: row.result ? (typeof row.result === 'string' ? JSON.parse(row.result) : row.result) : null,
        status: row.status,
        durationMs: row.duration_ms ?? 0,
        createdAt: row.created_at
      }));

      res.json({
        success: true,
        tenant: {
          userId: user.id,
          companyId: user.company_id ?? null
        },
        profile,
        apps,
        workflows,
        webhooks,
        usageSummary: Object.values(usageSummary),
        agents,
        stats,
        sandboxRuns,
        capabilities: {
          role: user.role,
          ...capabilities,
          usage: usageCounts
        },
        roleExperience: buildRoleExperience(user.role, capabilities, usageCounts),
        builderModules
      });
    } catch (error: any) {
      console.error('[Developer] dashboard summary failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/modules/community', async (req, res) => {
    try {
      const user = (req as any).user;
      const { data: rows, error } = await supabase
        .from('sdk_apps')
        .select(`
          id,
          name,
          description,
          status,
          version,
          updated_at,
          users!sdk_apps_developer_id_fkey(id, name),
          companies!sdk_apps_company_id_fkey(id, name)
        `)
        .eq('status', 'approved')
        .neq('developer_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(12);

      if (error) throw error;

      const modules = (rows || []).map((row: any) => {
        const users = Array.isArray(row.users) ? row.users[0] : row.users;
        const companies = Array.isArray(row.companies) ? row.companies[0] : row.companies;
        return {
          id: row.id,
          name: row.name,
          description: row.description,
          status: row.status,
          version: row.version,
          updatedAt: row.updated_at,
          developerName: users?.name ?? 'Unknown developer',
          companyName: companies?.name ?? 'Independent'
        };
      });

      res.json({ success: true, modules });
    } catch (error: any) {
      console.error('[Developer] community modules failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/capabilities', async (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      const usage = await getSandboxUsageCounts(supabase, user.id);

      res.json({
        success: true,
        capabilities: {
          role: user.role,
          ...capabilities,
          usage
        },
        roleExperience: buildRoleExperience(user.role, capabilities, usage)
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/builder/templates', (_req, res) => {
    const templates = [
      {
        id: 'template-safety-daily',
        name: 'Daily Safety Digest',
        summary: 'Summarise daily inspections and notify site leads.',
        nodes: [
          { id: 'trigger', type: 'trigger', name: 'Start of Day', config: { schedule: '06:00' } },
          { id: 'aggregate', type: 'action', name: 'Aggregate Inspections', config: { module: 'inspections' } },
          { id: 'notify', type: 'action', name: 'Send Summary', config: { channel: 'safety-leads' } }
        ],
        connections: [
          { id: 'c1', source: 'trigger', target: 'aggregate' },
          { id: 'c2', source: 'aggregate', target: 'notify' }
        ]
      },
      {
        id: 'template-invoice-approval',
        name: 'Invoice Approval Ladder',
        summary: 'Escalate invoices through PM and finance before posting.',
        nodes: [
          { id: 'start', type: 'trigger', name: 'Invoice Submitted', config: { event: 'invoice.created' } },
          { id: 'pm', type: 'action', name: 'Notify Project Manager', config: { role: 'project_manager' } },
          { id: 'finance', type: 'action', name: 'Finance Review', config: { role: 'finance' } },
          { id: 'post', type: 'action', name: 'Post to ERP', config: { system: 'erp' } }
        ],
        connections: [
          { id: 'c1', source: 'start', target: 'pm' },
          { id: 'c2', source: 'pm', target: 'finance' },
          { id: 'c3', source: 'finance', target: 'post' }
        ]
      },
      {
        id: 'template-rfi-agent',
        name: 'AI RFI Assistant',
        summary: 'Draft RFI responses with AI and push updates to the team.',
        nodes: [
          { id: 'trigger', type: 'trigger', name: 'RFI Created', config: { event: 'rfi.created' } },
          { id: 'ai', type: 'action', name: 'Generate Draft Response', config: { provider: 'openai', model: 'gpt-4o-mini' } },
          { id: 'notify', type: 'action', name: 'Notify RFI Owner', config: { channel: 'email' } }
        ],
        connections: [
          { id: 'c1', source: 'trigger', target: 'ai' },
          { id: 'c2', source: 'ai', target: 'notify' }
        ]
      }
    ];

    res.json({ success: true, templates });
  });

  router.post('/sandbox/run', async (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      await enforceSandboxRunQuota(supabase, user, capabilities);

      const startedAt = Date.now();
      const { appId, workflowId, payload } = req.body ?? {};
      const timestamp = new Date().toISOString();

      const simulationOutput = {
        executedAt: timestamp,
        appId: appId ?? null,
        workflowId: workflowId ?? null,
        payload: payload ?? {},
        result: 'Simulation completed successfully',
        logs: [
          '⏱️ Sandbox environment initialised',
          '🔌 External services mocked',
          '✅ Validation complete'
        ]
      };

      const runId = uuidv4();
      await supabase
        .from('sandbox_runs')
        .insert({
          id: runId,
          user_id: user.id,
          company_id: user.company_id ?? null,
          name: appId ? `App Simulation: ${appId}` : workflowId ? `Workflow Simulation: ${workflowId}` : 'Sandbox Simulation',
          definition: JSON.stringify({ appId, workflowId }),
          result: JSON.stringify(simulationOutput),
          status: 'completed',
          duration_ms: Date.now() - startedAt,
          input_payload: JSON.stringify(payload ?? {})
        });

      await logDeveloperEvent(user, 'sandbox.run', simulationOutput);

      res.json({ success: true, simulation: simulationOutput });
    } catch (error: any) {
      console.error('[Developer] sandbox run failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/modules/:id/publish', async (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      if (!capabilities.canPublishModules) {
        return res.status(403).json({ success: false, error: 'Publishing not permitted for this role' });
      }
      const { id } = req.params;
      const { targetStatus = 'pending_review' } = req.body ?? {};

      const { data: app } = await supabase
        .from('sdk_apps')
        .select('*')
        .eq('id', id)
        .eq('developer_id', user.id)
        .single();

      if (!app) {
        return res.status(404).json({ success: false, error: 'Module not found' });
      }

      await supabase
        .from('sdk_apps')
        .update({ status: targetStatus })
        .eq('id', id);

      await logDeveloperEvent(user, 'modules.publish', { appId: id, newStatus: targetStatus });

      const { data: updated } = await supabase
        .from('sdk_apps')
        .select('*')
        .eq('id', id)
        .single();

      res.json({ success: true, app: mapAppRow(updated) });
    } catch (error: any) {
      console.error('[Developer] module publish failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/builder/run', async (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      await enforceSandboxRunQuota(supabase, user, capabilities);

      const {
        name = 'BuilderKit Simulation',
        definition = { nodes: [], connections: [] },
        description,
        payload = {}
      } = req.body ?? {};

      const runId = uuidv4();
      const startedAt = Date.now();

      const nodes = definition?.nodes ?? [];
      const steps = nodes.map((node: any, index: number) => ({
        index,
        nodeId: node.id,
        name: node.name,
        type: node.type,
        status: 'completed'
      }));

      const result = {
        executedAt: new Date(startedAt).toISOString(),
        description: description ?? 'Automation simulation executed in the sandbox.',
        nodesVisited: steps.length,
        output: {
          message: 'Automation processed successfully',
          payload,
          auditTrail: steps
        }
      };

      await supabase
        .from('sandbox_runs')
        .insert({
          id: runId,
          user_id: user.id,
          company_id: user.company_id ?? null,
          name,
          definition: JSON.stringify(definition),
          result: JSON.stringify(result),
          status: 'completed',
          duration_ms: Date.now() - startedAt,
          input_payload: JSON.stringify(payload)
        });

      await logDeveloperEvent(user, 'builder.run', { runId, name, nodes: steps.length });

      res.json({
        success: true,
        run: {
          id: runId,
          name,
          definition,
          result,
          status: 'completed',
          durationMs: Date.now() - startedAt,
          createdAt: result.executedAt
        }
      });
    } catch (error: any) {
      console.error('[Developer] builder run failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/builder/runs', async (req, res) => {
    try {
      const user = (req as any).user;

      const { data: runs, error } = await supabase
        .from('sandbox_runs')
        .select('id, name, definition, result, status, duration_ms, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) throw error;

      res.json({
        success: true,
        runs: (runs || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          definition: row.definition ? (typeof row.definition === 'string' ? JSON.parse(row.definition) : row.definition) : null,
          result: row.result ? (typeof row.result === 'string' ? JSON.parse(row.result) : row.result) : null,
          status: row.status,
          durationMs: row.duration_ms ?? 0,
          createdAt: row.created_at
        }))
      });
    } catch (error: any) {
      console.error('[Developer] list builder runs failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/builder/modules', async (req, res) => {
    try {
      const user = (req as any).user;
      const { data: modules, error } = await supabase
        .from('builder_modules')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      res.json({ success: true, modules: (modules || []).map(mapBuilderModuleRow) });
    } catch (error: any) {
      console.error('[Developer] list builder modules failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/builder/modules', async (req, res) => {
    try {
      const user = (req as any).user;

      const { id, name, description, version = '1.0.0', status = 'draft', manifest } = req.body ?? {};
      if (!name || !manifest) {
        return res.status(400).json({ success: false, error: 'Name and manifest are required' });
      }

      if (!manifest.nodes || !Array.isArray(manifest.nodes)) {
        return res.status(400).json({ success: false, error: 'Manifest must include nodes array' });
      }

      const moduleId = id ?? uuidv4();
      const now = new Date().toISOString();

      const { data: existing } = await supabase
        .from('builder_modules')
        .select('id')
        .eq('id', moduleId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        const { data: updated } = await supabase
          .from('builder_modules')
          .update({
            name,
            description: description ?? '',
            version,
            status,
            manifest: JSON.stringify(manifest),
            updated_at: now
          })
          .eq('id', moduleId)
          .eq('user_id', user.id)
          .select()
          .single();

        await logDeveloperEvent(user, 'builder.save', { moduleId, name, nodeCount: manifest.nodes.length });
        res.json({ success: true, module: mapBuilderModuleRow(updated) });
      } else {
        const { data: inserted } = await supabase
          .from('builder_modules')
          .insert({
            id: moduleId,
            user_id: user.id,
            company_id: user.company_id ?? null,
            name,
            description: description ?? '',
            version,
            status,
            manifest: JSON.stringify(manifest),
            created_at: now,
            updated_at: now
          })
          .select()
          .single();

        await logDeveloperEvent(user, 'builder.save', { moduleId, name, nodeCount: manifest.nodes.length });
        res.json({ success: true, module: mapBuilderModuleRow(inserted) });
      }
    } catch (error: any) {
      console.error('[Developer] save builder module failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get developer stats
  router.get('/stats', (_req, res) => {
    try {
      const stats = {
        apiCalls24h: 15234,
        activeProjects: 8,
        deployments: 42,
        errorRate: 0.3
      };
      res.json({ success: true, stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get API endpoints list
  router.get('/endpoints', (_req, res) => {
    try {
      const endpoints = [
        { method: 'GET', path: '/api/projects', description: 'Get all projects' },
        { method: 'POST', path: '/api/projects', description: 'Create new project' },
        { method: 'GET', path: '/api/projects/:id', description: 'Get project by ID' },
        { method: 'PUT', path: '/api/projects/:id', description: 'Update project' },
        { method: 'DELETE', path: '/api/projects/:id', description: 'Delete project' },
        { method: 'GET', path: '/api/users', description: 'Get all users' },
        { method: 'POST', path: '/api/users', description: 'Create new user' },
        { method: 'GET', path: '/api/companies', description: 'Get all companies' },
        { method: 'POST', path: '/api/companies', description: 'Create new company' },
        { method: 'POST', path: '/api/auth/login', description: 'User login' },
        { method: 'POST', path: '/api/auth/register', description: 'User registration' },
        { method: 'GET', path: '/api/developer/stats', description: 'Get developer stats' },
        { method: 'GET', path: '/api/developer/endpoints', description: 'List all API endpoints' },
        { method: 'POST', path: '/api/developer/console/execute', description: 'Execute console command' },
        { method: 'POST', path: '/api/developer/code/run', description: 'Run code snippet' },
        { method: 'POST', path: '/api/developer/database/query', description: 'Execute database query' },
        { method: 'GET', path: '/api/developer/database/tables', description: 'List database tables' },
        { method: 'GET', path: '/api/admin/stats', description: 'Get admin statistics' }
      ];
      res.json({ success: true, endpoints });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute console command
  router.post('/console/execute', async (req, res) => {
    try {
      const { command } = req.body;
      const user = (req as any).user;
      
      // Simulate command execution
      let output = '';
      
      if (command.startsWith('npm ')) {
        output = `npm command executed: ${command}\n✓ Success`;
      } else if (command.startsWith('git ')) {
        output = `git command executed: ${command}\n✓ Success`;
      } else {
        output = `Command executed: ${command}\n✓ Success`;
      }

      await logDeveloperEvent(user, 'console.execute', { command, output });
      res.json({ success: true, output });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Run code snippet
  router.post('/code/run', async (req, res) => {
    try {
      const { code, language } = req.body;
      const user = (req as any).user;
      
      // In production, this would use a sandboxed execution environment
      // For now, return simulated output
      const output = `Code executed successfully\nLanguage: ${language}\nOutput: Hello from CortexBuild!`;
      
      await logDeveloperEvent(user, 'code.run', { language, output });
      res.json({ success: true, output });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute database query
  router.post('/database/query', async (req, res) => {
    try {
      const { query } = req.body;
      const user = (req as any).user;
      
      // Security: Only allow SELECT queries for safety
      if (!query.trim().toUpperCase().startsWith('SELECT')) {
        return res.status(403).json({ 
          success: false, 
          error: 'Only SELECT queries are allowed for safety. Use database manager for modifications.' 
        });
      }

      // Note: Supabase doesn't allow arbitrary SQL execution for security
      // This would need to be implemented using Supabase's query builder or RPC functions
      // For now, return an error indicating this needs to be implemented differently
      res.status(501).json({ 
        success: false, 
        error: 'Direct SQL queries are not supported in Supabase. Use the Supabase query builder or RPC functions instead.' 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get database tables (PostgreSQL equivalent)
  router.get('/database/tables', async (_req, res) => {
    try {
      // Note: Supabase doesn't expose direct access to information_schema for security
      // This would need to be implemented using a database function or RPC
      // For now, return a list of known tables
      const tables = [
        'companies', 'users', 'projects', 'tasks', 'clients', 'rfis', 'invoices',
        'purchase_orders', 'time_entries', 'documents', 'activities', 'milestones',
        'subcontractors', 'sdk_apps', 'sdk_workflows', 'sdk_profiles', 'ai_agents',
        'webhooks', 'integrations', 'workflows', 'automations', 'gantt_tasks',
        'wbs_items', 'budgets', 'contracts', 'change_orders', 'payment_applications'
      ];
      
      res.json({ success: true, tables });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get table schema (PostgreSQL equivalent)
  router.get('/database/schema/:table', async (req, res) => {
    try {
      const { table } = req.params;
      
      // Note: Supabase doesn't expose direct access to information_schema for security
      // This would need to be implemented using a database function or RPC
      res.status(501).json({ 
        success: false, 
        error: 'Table schema queries are not directly supported in Supabase. Use the Supabase dashboard or database functions instead.' 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/events', async (req, res) => {
    try {
      const user = (req as any).user;
      const limit = parseInt((req.query.limit as string) ?? '50', 10);
      
      const { data: rows, error } = await supabase
        .from('developer_console_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      res.json({
        success: true,
        events: (rows || []).map((row: any) => ({
          id: row.id,
          eventType: row.event_type,
          payload: row.payload ? (typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload) : {},
          createdAt: row.created_at
        }))
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get analytics data
  router.get('/analytics', (_req, res) => {
    try {
      const analytics = {
        apiCalls: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          count: Math.floor(Math.random() * 1000) + 500
        })),
        errorRate: 0.3,
        avgResponseTime: 45,
        activeUsers: 12,
        dbConnections: 8,
        cacheHitRate: 87.5
      };
      res.json({ success: true, analytics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // File operations
  router.get('/files', (_req, res) => {
    try {
      const files = [
        { id: '1', name: 'index.ts', type: 'file', content: '// Your code here' },
        { id: '2', name: 'api.ts', type: 'file', content: 'export const api = {};' }
      ];
      res.json({ success: true, files });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/files', (req, res) => {
    try {
      const { path, content } = req.body;
      // In production, this would save to file system
      res.json({ success: true, message: 'File saved successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API key management
  router.get('/api-keys', (_req, res) => {
    try {
      const keys = [
        { id: '1', name: 'Production Key', key: 'sk_prod_***', created: new Date() },
        { id: '2', name: 'Development Key', key: 'sk_dev_***', created: new Date() }
      ];
      res.json({ success: true, keys });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/api-keys', (req, res) => {
    try {
      const { name } = req.body;
      const newKey = {
        id: Date.now().toString(),
        name,
        key: `sk_${Math.random().toString(36).substring(7)}`,
        created: new Date()
      };
      res.json({ success: true, key: newKey });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.delete('/api-keys/:id', (req, res) => {
    try {
      const { id } = req.params;
      res.json({ success: true, message: 'API key deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Git operations
  router.get('/git/status', (_req, res) => {
    try {
      const status = {
        branch: 'main',
        ahead: 0,
        behind: 0,
        modified: [],
        staged: [],
        untracked: []
      };
      res.json({ success: true, status });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/git/commit', (req, res) => {
    try {
      const { message } = req.body;
      res.json({ success: true, message: 'Changes committed successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Module/SDK management
  router.get('/modules', (_req, res) => {
    try {
      const modules = [
        { id: '1', name: '@cortexbuild/core', version: '1.0.0', installed: true },
        { id: '2', name: '@cortexbuild/ui', version: '1.2.1', installed: true },
        { id: '3', name: '@cortexbuild/api', version: '2.0.0', installed: false }
      ];
      res.json({ success: true, modules });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/modules/install', (req, res) => {
    try {
      const { moduleId } = req.body;
      res.json({ success: true, message: 'Module installed successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.delete('/modules/:id', (req, res) => {
    try {
      const { id } = req.params;
      res.json({ success: true, message: 'Module uninstalled successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Build and deploy
  router.post('/build', (_req, res) => {
    try {
      res.json({ success: true, message: 'Build started', buildId: Date.now().toString() });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/deploy', (req, res) => {
    try {
      const { environment } = req.body;
      res.json({ success: true, message: `Deployment to ${environment} started` });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
