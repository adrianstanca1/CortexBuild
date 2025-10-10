import { v4 as uuidv4 } from 'uuid';
import { Router } from 'express';
import Database from 'better-sqlite3';
import {
  getCapabilitiesForRole,
  enforceSandboxRunQuota,
  getSandboxUsageCounts,
  buildRoleExperience
} from '../utils/capabilities';

export function createDeveloperRoutes(db: Database.Database) {
  const router = Router();

  // Middleware to check sandbox access privileges
  const requireSandboxAccess = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as any;
    if (!session) {
      return res.status(401).json({ success: false, error: 'Invalid session' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const capabilities = getCapabilitiesForRole(user.role);

    // Allow developer, super admin, or company admin with sandbox capabilities
    if (!capabilities.canAccessSandbox) {
      return res.status(403).json({ success: false, error: 'Sandbox access restricted for this role' });
    }

    req.user = user;
    req.capabilities = capabilities;
    next();
  };

  // Apply developer check to all routes
  router.use(requireSandboxAccess);

  const ensureSandboxRunsTable = () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS sandbox_runs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT,
        name TEXT NOT NULL,
        definition TEXT,
        result TEXT,
        status TEXT DEFAULT 'completed',
        duration_ms INTEGER DEFAULT 0,
        input_payload TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    const columns = db.prepare(`PRAGMA table_info(sandbox_runs)`).all() as Array<{ name: string }>;
    const hasInput = columns.some(column => column.name === 'input_payload');
    if (!hasInput) {
      db.exec(`ALTER TABLE sandbox_runs ADD COLUMN input_payload TEXT`);
    }
  };

  const ensureBuilderModulesTable = () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS builder_modules (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT DEFAULT '1.0.0',
        status TEXT DEFAULT 'draft',
        manifest TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  };

  const logDeveloperEvent = (user: any, eventType: string, payload: Record<string, unknown>) => {
    try {
      db.prepare(
        `INSERT INTO developer_console_events (id, user_id, company_id, event_type, payload)
         VALUES (?, ?, ?, ?, ?)`
      ).run(
        `dev-${uuidv4()}`,
        user.id,
        user.company_id ?? null,
        eventType,
        JSON.stringify(payload ?? {})
      );
    } catch (error) {
      console.error('[Developer] log event failed', error);
    }
  };

  const ensureSdkProfile = (userId: string) => {
    let profile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(userId);
    if (!profile) {
      const id = `sdk-profile-${Date.now()}`;
      db.prepare(`
        INSERT INTO sdk_profiles (id, user_id, subscription_tier, api_requests_limit)
        VALUES (?, ?, ?, ?)
      `).run(id, userId, 'free', 100);
      profile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(userId);
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
    definition: row.definition ? JSON.parse(row.definition) : { nodes: [], connections: [] },
    isActive: row.is_active === 1,
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
    config: row.config ? JSON.parse(row.config) : {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });

  const mapBuilderModuleRow = (row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    version: row.version,
    status: row.status,
    manifest: row.manifest ? JSON.parse(row.manifest) : { nodes: [], connections: [] },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });

  router.get('/dashboard/summary', (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      const profileRow = ensureSdkProfile(user.id);
      ensureSandboxRunsTable();
      ensureBuilderModulesTable();
      const usageCounts = getSandboxUsageCounts(db, user.id);

      const apps = db
        .prepare(`
          SELECT * FROM sdk_apps
          WHERE developer_id = ?
          ORDER BY updated_at DESC
        `)
        .all(user.id)
        .map(mapAppRow);

      const workflows = db
        .prepare(`
          SELECT * FROM sdk_workflows
          WHERE developer_id = ?
          ORDER BY updated_at DESC
        `)
        .all(user.id)
        .map(mapWorkflowRow);

      const webhooks = db
        .prepare(`
          SELECT * FROM webhooks
          WHERE user_id = ?
          ORDER BY updated_at DESC
        `)
        .all(user.id);

      const agents = db
        .prepare(`
          SELECT * FROM ai_agents
          WHERE developer_id = ?
          ORDER BY updated_at DESC
        `)
        .all(user.id)
        .map(mapAgentRow);

      const builderModules = db
        .prepare(`
          SELECT * FROM builder_modules
          WHERE user_id = ?
          ORDER BY updated_at DESC
        `)
        .all(user.id)
        .map(mapBuilderModuleRow);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const usageSummary = db
        .prepare(`
          SELECT
            provider,
            COUNT(*) as requests_this_month,
            SUM(cost) as month_to_date_cost,
            SUM(total_tokens) as total_tokens
          FROM api_usage_logs
          WHERE user_id = ? AND created_at >= ?
          GROUP BY provider
        `)
        .all(user.id, startOfMonth.toISOString())
        .map((row: any) => ({
          provider: row.provider,
          requestsThisMonth: Number(row.requests_this_month || 0),
          monthToDateCost: Number(row.month_to_date_cost || 0),
          totalTokens: Number(row.total_tokens || 0)
        }));

      const profile = {
        id: profileRow.id,
        userId: profileRow.user_id,
        subscriptionTier: profileRow.subscription_tier,
        apiRequestsUsed: profileRow.api_requests_used ?? 0,
        apiRequestsLimit: profileRow.api_requests_limit ?? 0,
        geminiApiKey: profileRow.gemini_api_key
      };

      const stats = {
        totalApps: apps.length,
        activeApps: apps.filter((app) => app.status === 'approved').length,
        pendingApps: apps.filter((app) => app.status === 'pending_review').length,
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter((wf) => wf.isActive).length,
        totalWebhooks: webhooks.length,
        activeWebhooks: webhooks.filter((hook: any) => hook.is_active === 1).length,
        totalAgents: agents.length,
        runningAgents: agents.filter((agent) => agent.status === 'running').length,
        totalRequestsThisMonth: usageSummary.reduce((sum, item) => sum + item.requestsThisMonth, 0),
        totalCostThisMonth: usageSummary.reduce((sum, item) => sum + item.monthToDateCost, 0),
        totalTokensThisMonth: usageSummary.reduce((sum, item) => sum + item.totalTokens, 0)
      };

      const sandboxRuns = db
        .prepare(
          `SELECT id,
                  name,
                  definition,
                  result,
                  status,
                  duration_ms,
                  created_at
           FROM sandbox_runs
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 15`
        )
        .all(user.id)
        .map((row: any) => ({
          id: row.id,
          name: row.name,
          definition: row.definition ? JSON.parse(row.definition) : null,
          result: row.result ? JSON.parse(row.result) : null,
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
        usageSummary,
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

  router.get('/modules/community', (req, res) => {
    try {
      const user = (req as any).user;
      const rows = db
        .prepare(
          `SELECT sa.id,
                  sa.name,
                  sa.description,
                  sa.status,
                  sa.version,
                  sa.updated_at,
                  u.name AS developer_name,
                  c.name AS company_name
           FROM sdk_apps sa
           LEFT JOIN users u ON u.id = sa.developer_id
           LEFT JOIN companies c ON c.id = sa.company_id
           WHERE sa.status = 'approved' AND sa.developer_id != ?
           ORDER BY sa.updated_at DESC
           LIMIT 12`
        )
        .all(user.id)
        .map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          status: row.status,
          version: row.version,
          updatedAt: row.updated_at,
          developerName: row.developer_name ?? 'Unknown developer',
          companyName: row.company_name ?? 'Independent'
        }));

      res.json({ success: true, modules: rows });
    } catch (error: any) {
      console.error('[Developer] community modules failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/capabilities', (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      const usage = getSandboxUsageCounts(db, user.id);

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

  router.post('/sandbox/run', (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      enforceSandboxRunQuota(db, user, capabilities);
      ensureSandboxRunsTable();
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

      const runId = `sandbox-run-${Date.now()}`;
      db.prepare(
        `INSERT INTO sandbox_runs (id, user_id, company_id, name, definition, result, status, duration_ms, input_payload)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        runId,
        user.id,
        user.company_id ?? null,
        appId ? `App Simulation: ${appId}` : workflowId ? `Workflow Simulation: ${workflowId}` : 'Sandbox Simulation',
        JSON.stringify({ appId, workflowId }),
        JSON.stringify(simulationOutput),
        'completed',
        Date.now() - startedAt,
        JSON.stringify(payload ?? {})
      );

      logDeveloperEvent(user, 'sandbox.run', simulationOutput);

      res.json({ success: true, simulation: simulationOutput });
    } catch (error: any) {
      console.error('[Developer] sandbox run failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/modules/:id/publish', (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      if (!capabilities.canPublishModules) {
        return res.status(403).json({ success: false, error: 'Publishing not permitted for this role' });
      }
      const { id } = req.params;
      const { targetStatus = 'pending_review' } = req.body ?? {};

      const app = db
        .prepare('SELECT * FROM sdk_apps WHERE id = ? AND developer_id = ?')
        .get(id, user.id);

      if (!app) {
        return res.status(404).json({ success: false, error: 'Module not found' });
      }

      db.prepare('UPDATE sdk_apps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(targetStatus, id);

      logDeveloperEvent(user, 'modules.publish', { appId: id, newStatus: targetStatus });

      const updated = db.prepare('SELECT * FROM sdk_apps WHERE id = ?').get(id);

      res.json({ success: true, app: mapAppRow(updated) });
    } catch (error: any) {
      console.error('[Developer] module publish failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/builder/run', (req, res) => {
    try {
      const user = (req as any).user;
      const capabilities = (req as any).capabilities ?? getCapabilitiesForRole(user.role);
      ensureSandboxRunsTable();
      enforceSandboxRunQuota(db, user, capabilities);

      const {
        name = 'BuilderKit Simulation',
        definition = { nodes: [], connections: [] },
        description,
        payload = {}
      } = req.body ?? {};

      const runId = `sandbox-run-${Date.now()}`;
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

      db.prepare(
        `INSERT INTO sandbox_runs (id, user_id, company_id, name, definition, result, status, duration_ms, input_payload)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        runId,
        user.id,
        user.company_id ?? null,
        name,
        JSON.stringify(definition),
        JSON.stringify(result),
        'completed',
        Date.now() - startedAt,
        JSON.stringify(payload)
      );

      logDeveloperEvent(user, 'builder.run', { runId, name, nodes: steps.length });

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

  router.get('/builder/runs', (req, res) => {
    try {
      const user = (req as any).user;
      ensureSandboxRunsTable();

      const runs = db
        .prepare(
          `SELECT id, name, definition, result, status, duration_ms, created_at
           FROM sandbox_runs
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 25`
        )
        .all(user.id)
        .map((row: any) => ({
          id: row.id,
          name: row.name,
          definition: row.definition ? JSON.parse(row.definition) : null,
          result: row.result ? JSON.parse(row.result) : null,
          status: row.status,
          durationMs: row.duration_ms ?? 0,
          createdAt: row.created_at
        }));

      res.json({ success: true, runs });
    } catch (error: any) {
      console.error('[Developer] list builder runs failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/builder/modules', (req, res) => {
    try {
      const user = (req as any).user;
      ensureBuilderModulesTable();
      const modules = db
        .prepare(`
          SELECT * FROM builder_modules
          WHERE user_id = ?
          ORDER BY updated_at DESC
        `)
        .all(user.id)
        .map(mapBuilderModuleRow);

      res.json({ success: true, modules });
    } catch (error: any) {
      console.error('[Developer] list builder modules failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/builder/modules', (req, res) => {
    try {
      const user = (req as any).user;
      ensureBuilderModulesTable();

      const { id, name, description, version = '1.0.0', status = 'draft', manifest } = req.body ?? {};
      if (!name || !manifest) {
        return res.status(400).json({ success: false, error: 'Name and manifest are required' });
      }

      if (!manifest.nodes || !Array.isArray(manifest.nodes)) {
        return res.status(400).json({ success: false, error: 'Manifest must include nodes array' });
      }

      const moduleId = id ?? `builder-${Date.now()}`;
      const now = new Date().toISOString();

      const exists = db.prepare('SELECT id FROM builder_modules WHERE id = ? AND user_id = ?').get(moduleId, user.id);
      if (exists) {
        db.prepare(
          `UPDATE builder_modules
           SET name = ?, description = ?, version = ?, status = ?, manifest = ?, updated_at = ?
           WHERE id = ? AND user_id = ?`
        ).run(name, description ?? '', version, status, JSON.stringify(manifest), now, moduleId, user.id);
      } else {
        db.prepare(
          `INSERT INTO builder_modules (id, user_id, company_id, name, description, version, status, manifest, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          moduleId,
          user.id,
          user.company_id ?? null,
          name,
          description ?? '',
          version,
          status,
          JSON.stringify(manifest),
          now,
          now
        );
      }

      const saved = db.prepare('SELECT * FROM builder_modules WHERE id = ?').get(moduleId);

      logDeveloperEvent(user, 'builder.save', { moduleId, name, nodeCount: manifest.nodes.length });

      res.json({ success: true, module: mapBuilderModuleRow(saved) });
    } catch (error: any) {
      console.error('[Developer] save builder module failed', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });


  // Get developer stats
  router.get('/stats', (req, res) => {
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
  router.get('/endpoints', (req, res) => {
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
  router.post('/console/execute', (req, res) => {
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

      logDeveloperEvent(user, 'console.execute', { command, output });
      res.json({ success: true, output });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Run code snippet
  router.post('/code/run', (req, res) => {
    try {
      const { code, language } = req.body;
      const user = (req as any).user;
      
      // In production, this would use a sandboxed execution environment
      // For now, return simulated output
      const output = `Code executed successfully\nLanguage: ${language}\nOutput: Hello from CortexBuild!`;
      
      logDeveloperEvent(user, 'code.run', { language, output });
      res.json({ success: true, output });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute database query
  router.post('/database/query', (req, res) => {
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

      const results = db.prepare(query).all();
      logDeveloperEvent(user, 'database.query', { query, rows: results.length });
      res.json({ success: true, results, changes: results.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get database tables
  router.get('/database/tables', (req, res) => {
    try {
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `).all().map((row: any) => row.name);
      
      res.json({ success: true, tables });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get table schema
  router.get('/database/schema/:table', (req, res) => {
    try {
      const { table } = req.params;
      const schema = db.prepare(`PRAGMA table_info(${table})`).all();
      res.json({ success: true, schema });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/events', (req, res) => {
    try {
      const user = (req as any).user;
      const limit = parseInt((req.query.limit as string) ?? '50', 10);
      const rows = db.prepare(`
        SELECT * FROM developer_console_events
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `).all(user.id, limit);

      res.json({
        success: true,
        events: rows.map((row: any) => ({
          id: row.id,
          eventType: row.event_type,
          payload: row.payload ? JSON.parse(row.payload) : {},
          createdAt: row.created_at
        }))
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get analytics data
  router.get('/analytics', (req, res) => {
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
  router.get('/files', (req, res) => {
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
  router.get('/api-keys', (req, res) => {
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
  router.get('/git/status', (req, res) => {
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
  router.get('/modules', (req, res) => {
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
  router.post('/build', (req, res) => {
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
