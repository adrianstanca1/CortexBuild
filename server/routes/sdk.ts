import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { authenticateToken } from '../auth';
import { AICodeGenerator, createAICodeGenerator } from '../services/ai-code-generator';

// Middleware to check if user is a developer
const requireDeveloper = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user || (user.role !== 'developer' && user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Developer access required' });
  }
  next();
};

// Initialize SDK tables
export const initSdkTables = (db: Database.Database) => {
  // SDK Workflows table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sdk_workflows (
      id TEXT PRIMARY KEY,
      developer_id TEXT NOT NULL,
      company_id TEXT,
      name TEXT NOT NULL,
      definition TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES users(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // SDK Apps table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sdk_apps (
      id TEXT PRIMARY KEY,
      developer_id TEXT NOT NULL,
      company_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      version TEXT DEFAULT '1.0.0',
      status TEXT DEFAULT 'draft',
      code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES users(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // AI Agents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_agents (
      id TEXT PRIMARY KEY,
      developer_id TEXT NOT NULL,
      company_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'stopped',
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES users(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // SDK Profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sdk_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      subscription_tier TEXT DEFAULT 'free',
      api_requests_used INTEGER DEFAULT 0,
      api_requests_limit INTEGER DEFAULT 100,
      gemini_api_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // API Usage Logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_usage_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT,
      prompt_tokens INTEGER DEFAULT 0,
      completion_tokens INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
};

export const createSDKRouter = (db: Database.Database) => {
  const router = Router();

  // Attach db to request
  router.use((req, res, next) => {
    (req as any).db = db;
    next();
  });

// Get or create SDK profile
router.get('/profile', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;

    let profile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(user.id);

    if (!profile) {
      // Create default profile
      const id = `sdk-profile-${Date.now()}`;
      db.prepare(`
        INSERT INTO sdk_profiles (id, user_id, subscription_tier, api_requests_limit)
        VALUES (?, ?, ?, ?)
      `).run(id, user.id, 'free', 100);

      profile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(user.id);
    }

    res.json({
      success: true,
      profile: {
        ...profile,
        apiRequestsUsed: profile.api_requests_used,
        apiRequestsLimit: profile.api_requests_limit,
        subscriptionTier: profile.subscription_tier
      }
    });
  } catch (error: any) {
    console.error('Get SDK profile error:', error);
    res.status(500).json({ error: 'Failed to get SDK profile' });
  }
});

// Update subscription tier
router.patch('/profile/subscription', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { tier } = req.body;

    const limits: Record<string, number> = {
      free: 100,
      starter: 1000,
      pro: 10000,
      enterprise: 100000
    };

    const limit = limits[tier] || 100;

    db.prepare(`
      UPDATE sdk_profiles 
      SET subscription_tier = ?, api_requests_limit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(tier, limit, user.id);

    const profile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(user.id);

    res.json({
      success: true,
      profile: {
        ...profile,
        apiRequestsUsed: profile.api_requests_used,
        apiRequestsLimit: profile.api_requests_limit,
        subscriptionTier: profile.subscription_tier
      }
    });
  } catch (error: any) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Save API key
router.post('/profile/api-key', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { provider, encryptedKey } = req.body;

    db.prepare(`
      UPDATE sdk_profiles 
      SET gemini_api_key = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(encryptedKey, user.id);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Save API key error:', error);
    res.status(500).json({ error: 'Failed to save API key' });
  }
});

// Get all workflows
router.get('/workflows', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;

    const workflows = db.prepare(`
      SELECT * FROM sdk_workflows 
      WHERE developer_id = ? 
      ORDER BY created_at DESC
    `).all(user.id);

    res.json({
      success: true,
      workflows: workflows.map((w: any) => ({
        ...w,
        definition: JSON.parse(w.definition),
        isActive: w.is_active === 1,
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
router.post('/workflows', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { name, definition, isActive, companyId } = req.body;

    const id = `workflow-${Date.now()}`;

    db.prepare(`
      INSERT INTO sdk_workflows (id, developer_id, company_id, name, definition, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, user.id, companyId || null, name, JSON.stringify(definition), isActive ? 1 : 0);

    const workflow = db.prepare('SELECT * FROM sdk_workflows WHERE id = ?').get(id);

    res.json({
      success: true,
      workflow: {
        ...workflow,
        definition: JSON.parse(workflow.definition),
        isActive: workflow.is_active === 1,
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
router.get('/apps', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;

    const apps = db.prepare(`
      SELECT * FROM sdk_apps 
      WHERE developer_id = ? 
      ORDER BY created_at DESC
    `).all(user.id);

    res.json({
      success: true,
      apps: apps.map((a: any) => ({
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
router.post('/apps', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { name, description, code, version, status, companyId } = req.body;

    const id = `app-${Date.now()}`;

    db.prepare(`
      INSERT INTO sdk_apps (id, developer_id, company_id, name, description, code, version, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, user.id, companyId || null, name, description || '', code || '', version || '1.0.0', status || 'draft');

    const app = db.prepare('SELECT * FROM sdk_apps WHERE id = ?').get(id);

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
router.patch('/apps/:id/status', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { id } = req.params;
    const { status } = req.body;

    db.prepare(`
      UPDATE sdk_apps 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND developer_id = ?
    `).run(status, id, user.id);

    const app = db.prepare('SELECT * FROM sdk_apps WHERE id = ?').get(id);

    if (!app) {
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
router.get('/agents', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;

    const agents = db.prepare(`
      SELECT * FROM ai_agents
      WHERE developer_id = ?
      ORDER BY created_at DESC
    `).all(user.id);

    res.json({
      success: true,
      agents: agents.map((a: any) => ({
        ...a,
        developerId: a.developer_id,
        companyId: a.company_id,
        config: a.config ? JSON.parse(a.config) : {},
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
router.patch('/agents/:id/status', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { id } = req.params;
    const { status } = req.body;

    db.prepare(`
      UPDATE ai_agents
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND developer_id = ?
    `).run(status, id, user.id);

    const agent = db.prepare('SELECT * FROM ai_agents WHERE id = ?').get(id);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      success: true,
      agent: {
        ...agent,
        developerId: agent.developer_id,
        companyId: agent.company_id,
        config: agent.config ? JSON.parse(agent.config) : {},
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
router.get('/analytics/usage', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;

    // Get current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = db.prepare(`
      SELECT
        provider,
        COUNT(*) as requests_this_month,
        SUM(cost) as month_to_date_cost,
        SUM(total_tokens) as total_tokens
      FROM api_usage_logs
      WHERE user_id = ? AND created_at >= ?
      GROUP BY provider
    `).all(user.id, startOfMonth.toISOString());

    res.json({
      success: true,
      costSummary: usage.map((u: any) => ({
        provider: u.provider,
        requestsThisMonth: u.requests_this_month,
        monthToDateCost: u.month_to_date_cost || 0,
        totalTokens: u.total_tokens || 0
      }))
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Log API usage
router.post('/analytics/log', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { provider, model, promptTokens, completionTokens, cost } = req.body;

    const id = `log-${Date.now()}`;
    const totalTokens = (promptTokens || 0) + (completionTokens || 0);

    db.prepare(`
      INSERT INTO api_usage_logs (id, user_id, provider, model, prompt_tokens, completion_tokens, total_tokens, cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, user.id, provider, model || '', promptTokens || 0, completionTokens || 0, totalTokens, cost || 0);

    // Update profile usage count
    db.prepare(`
      UPDATE sdk_profiles
      SET api_requests_used = api_requests_used + 1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(user.id);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Log usage error:', error);
    res.status(500).json({ error: 'Failed to log usage' });
  }
});

// Generate code with AI
router.post('/generate', authenticateToken, requireDeveloper, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { prompt, provider = 'openai', model } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check usage limits
    const profile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(user.id);

    if (profile && profile.api_requests_used >= profile.api_requests_limit) {
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
    const logId = `log-${Date.now()}`;
    db.prepare(`
      INSERT INTO api_usage_logs (id, user_id, provider, model, prompt_tokens, completion_tokens, total_tokens, cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      user.id,
      result.provider,
      result.model,
      result.tokens.prompt,
      result.tokens.completion,
      result.tokens.total,
      result.cost
    );

    // Update profile usage count
    db.prepare(`
      UPDATE sdk_profiles
      SET api_requests_used = api_requests_used + 1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(user.id);

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
router.get('/models/:provider', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
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

