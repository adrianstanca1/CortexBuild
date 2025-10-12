import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { authenticateToken } from '../auth';
import { AICodeGenerator, createAICodeGenerator } from '../services/ai-code-generator';
import { createWorkspaceManager, WorkspaceManager } from '../services/workspace-manager';
import { createCollaborationService, CollaborationService } from '../services/collaboration-service';

// Middleware to check if user is a developer
const requireDeveloper = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Allow developers, super admins, and company admins to access SDK
  if (!['developer', 'super_admin', 'company_admin'].includes(user.role)) {
    return res.status(403).json({ error: 'Developer or admin access required' });
  }
  next();
};

// Middleware for basic SDK access (any authenticated user)
const requireAuth = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Initialize SDK tables
export const initSdkTables = (db: Database.Database) => {
  // SDK Profiles table (Enhanced with subscription management)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sdk_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
      api_requests_used INTEGER DEFAULT 0,
      api_requests_limit INTEGER DEFAULT 100,
      gemini_api_key TEXT,
      stripe_customer_id TEXT,
      subscription_status TEXT DEFAULT 'active' CHECK(subscription_status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
      current_period_start DATETIME,
      current_period_end DATETIME,
      cancel_at_period_end BOOLEAN DEFAULT 0,
      trial_ends_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Subscription History table (Audit trail)
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscription_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      old_tier TEXT,
      new_tier TEXT NOT NULL,
      change_reason TEXT,
      changed_by TEXT,
      stripe_event_id TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // SDK Workflows table (Enhanced)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sdk_workflows (
      id TEXT PRIMARY KEY,
      developer_id TEXT NOT NULL,
      company_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      definition TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 0,
      tags TEXT,
      category TEXT,
      downloads INTEGER DEFAULT 0,
      rating DECIMAL(3, 2) DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // SDK Apps table (Enhanced)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sdk_apps (
      id TEXT PRIMARY KEY,
      developer_id TEXT NOT NULL,
      company_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      version TEXT DEFAULT '1.0.0',
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending_review', 'approved', 'rejected', 'published')),
      code TEXT,
      repository_url TEXT,
      documentation_url TEXT,
      demo_url TEXT,
      price DECIMAL(10, 2) DEFAULT 0,
      is_free BOOLEAN DEFAULT 1,
      downloads INTEGER DEFAULT 0,
      rating DECIMAL(3, 2) DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // AI Agents table (Enhanced)
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_agents (
      id TEXT PRIMARY KEY,
      developer_id TEXT NOT NULL,
      company_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'stopped' CHECK(status IN ('running', 'paused', 'stopped', 'error')),
      config TEXT,
      last_activity DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // API Usage Logs table (Enhanced analytics)
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_usage_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT,
      provider TEXT NOT NULL,
      model TEXT,
      operation TEXT,
      prompt_tokens INTEGER DEFAULT 0,
      completion_tokens INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      duration_ms INTEGER DEFAULT 0,
      success BOOLEAN DEFAULT 1,
      error_message TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // SDK Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sdk_reviews (
      id TEXT PRIMARY KEY,
      app_id TEXT,
      workflow_id TEXT,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review TEXT,
      helpful_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (app_id) REFERENCES sdk_apps(id) ON DELETE CASCADE,
      FOREIGN KEY (workflow_id) REFERENCES sdk_workflows(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (app_id IS NOT NULL OR workflow_id IS NOT NULL)
    )
  `);

  // Subscription Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscription_notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('usage_warning', 'limit_reached', 'payment_failed', 'subscription_canceled', 'trial_ending', 'upgrade_available')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      is_read BOOLEAN DEFAULT 0,
      action_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Initialize workspace and collaboration tables
  WorkspaceManager.initTables(db);
  CollaborationService.initTables(db);

  // Create indexes for performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_profiles_user ON sdk_profiles(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_profiles_tier ON sdk_profiles(subscription_tier)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_profiles_status ON sdk_profiles(subscription_status)');

  db.exec('CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_subscription_history_date ON subscription_history(created_at)');

  db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_workflows_developer ON sdk_workflows(developer_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_workflows_public ON sdk_workflows(is_public)');

  db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_apps_developer ON sdk_apps(developer_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_apps_status ON sdk_apps(status)');

  db.exec('CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage_logs(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage_logs(created_at)');

  db.exec('CREATE INDEX IF NOT EXISTS idx_subscription_notifications_user ON subscription_notifications(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_subscription_notifications_unread ON subscription_notifications(is_read)');
};

export const createSDKRouter = (db: Database.Database) => {
  const router = Router();

  // Attach db to request
  router.use((req, res, next) => {
    (req as any).db = db;
    next();
  });

// Get or create SDK profile (available to all authenticated users)
router.get('/profile', authenticateToken, requireAuth, (req: Request, res: Response) => {
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

// Update subscription tier (Enhanced with history tracking)
router.patch('/profile/subscription', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { tier, paymentMethodId } = req.body;

    // Get current profile
    const currentProfile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(user.id);

    const limits: Record<string, number> = {
      free: 100,
      starter: 1000,
      pro: 10000,
      enterprise: 100000
    };

    const limit = limits[tier] || 100;
    const now = new Date().toISOString();

    // Update subscription
    db.prepare(`
      UPDATE sdk_profiles
      SET subscription_tier = ?, api_requests_limit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(tier, limit, user.id);

    // Record subscription history
    const historyId = `sub-history-${Date.now()}`;
    db.prepare(`
      INSERT INTO subscription_history (id, user_id, old_tier, new_tier, change_reason, changed_by, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      historyId,
      user.id,
      currentProfile?.subscription_tier || 'free',
      tier,
      'User requested tier change',
      user.id,
      JSON.stringify({ paymentMethodId, timestamp: now })
    );

    // Create notification for user
    const notificationId = `notif-${Date.now()}`;
    db.prepare(`
      INSERT INTO subscription_notifications (id, user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      notificationId,
      user.id,
      'subscription_change',
      'Subscription Updated',
      `Your subscription has been updated to ${tier} tier`,
      JSON.stringify({ oldTier: currentProfile?.subscription_tier, newTier: tier })
    );

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

// Get subscription history
router.get('/profile/subscription/history', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { limit = 10 } = req.query;

    const history = db.prepare(`
      SELECT * FROM subscription_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(user.id, Number(limit));

    res.json({
      success: true,
      history: history.map((h: any) => ({
        ...h,
        metadata: h.metadata ? JSON.parse(h.metadata) : {}
      }))
    });
  } catch (error: any) {
    console.error('Get subscription history error:', error);
    res.status(500).json({ error: 'Failed to get subscription history' });
  }
});

// Get subscription notifications
router.get('/notifications', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { unreadOnly = false } = req.query;

    let query = `
      SELECT * FROM subscription_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    if (unreadOnly === 'true') {
      query += ' AND is_read = 0';
    }

    const notifications = db.prepare(query).all(user.id);

    res.json({
      success: true,
      notifications: notifications.map((n: any) => ({
        ...n,
        data: n.data ? JSON.parse(n.data) : {}
      }))
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const db = (req as any).db;

    db.prepare(`
      UPDATE subscription_notifications
      SET is_read = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(id, user.id);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Enhanced usage validation middleware
const validateUsageLimits = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  const db = (req as any).db;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const profile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(user.id);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Check if subscription is active
  if (profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing') {
    return res.status(403).json({
      error: 'Subscription is not active',
      subscriptionStatus: profile.subscription_status
    });
  }

  // Check usage limits
  if (profile.api_requests_used >= profile.api_requests_limit) {
    // Create notification for user
    const notificationId = `notif-${Date.now()}`;
    db.prepare(`
      INSERT INTO subscription_notifications (id, user_id, type, title, message, action_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      notificationId,
      user.id,
      'limit_reached',
      'Usage Limit Reached',
      `You have reached your ${profile.subscription_tier} plan limit of ${profile.api_requests_limit} requests.`,
      '/settings?tab=subscription'
    );

    return res.status(429).json({
      error: 'API request limit reached. Please upgrade your subscription.',
      limit: profile.api_requests_limit,
      used: profile.api_requests_used,
      subscriptionTier: profile.subscription_tier
    });
  }

  // Add usage info to request
  (req as any).usageInfo = {
    used: profile.api_requests_used,
    limit: profile.api_requests_limit,
    tier: profile.subscription_tier
  };

  next();
};

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

// Enhanced usage analytics
router.get('/analytics/detailed', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { period = '30d', groupBy = 'day' } = req.query;

    // Calculate date range
    const now = new Date();
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get detailed usage data
    const usage = db.prepare(`
      SELECT
        DATE(created_at) as date,
        provider,
        model,
        COUNT(*) as requests,
        SUM(total_tokens) as total_tokens,
        SUM(cost) as total_cost,
        AVG(duration_ms) as avg_duration_ms
      FROM api_usage_logs
      WHERE user_id = ? AND created_at >= ?
      GROUP BY DATE(created_at), provider, model
      ORDER BY date DESC, provider, model
    `).all(user.id, startDate.toISOString());

    // Get subscription tier changes
    const tierChanges = db.prepare(`
      SELECT * FROM subscription_history
      WHERE user_id = ? AND created_at >= ?
      ORDER BY created_at DESC
    `).all(user.id, startDate.toISOString());

    // Get current subscription status
    const profile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(user.id);

    res.json({
      success: true,
      analytics: {
        usage,
        tierChanges,
        currentTier: profile?.subscription_tier,
        currentLimit: profile?.api_requests_limit,
        currentUsage: profile?.api_requests_used,
        subscriptionStatus: profile?.subscription_status
      }
    });
  } catch (error: any) {
    console.error('Get detailed analytics error:', error);
    res.status(500).json({ error: 'Failed to get detailed analytics' });
  }
});

// Admin: Get all subscriptions (Super admin only)
router.get('/admin/subscriptions', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;

    // Check if user is super admin
    if (user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const subscriptions = db.prepare(`
      SELECT
        sp.*,
        u.email,
        u.name,
        c.name as company_name
      FROM sdk_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN companies c ON u.company_id = c.id
      ORDER BY sp.updated_at DESC
    `).all();

    res.json({
      success: true,
      subscriptions: subscriptions.map((s: any) => ({
        ...s,
        apiRequestsUsed: s.api_requests_used,
        apiRequestsLimit: s.api_requests_limit,
        subscriptionTier: s.subscription_tier,
        companyName: s.company_name
      }))
    });
  } catch (error: any) {
    console.error('Get admin subscriptions error:', error);
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
});

// Admin: Update user subscription (Super admin only)
router.patch('/admin/subscriptions/:userId', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { userId } = req.params;
    const { tier, status, reason } = req.body;

    // Check if user is super admin
    if (user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    // Get current profile
    const currentProfile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(userId);

    if (!currentProfile) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const limits: Record<string, number> = {
      free: 100,
      starter: 1000,
      pro: 10000,
      enterprise: 100000
    };

    const limit = limits[tier] || currentProfile.api_requests_limit;
    const now = new Date().toISOString();

    // Update subscription
    db.prepare(`
      UPDATE sdk_profiles
      SET subscription_tier = ?, api_requests_limit = ?, subscription_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(tier, limit, status, userId);

    // Record admin change in history
    const historyId = `admin-history-${Date.now()}`;
    db.prepare(`
      INSERT INTO subscription_history (id, user_id, old_tier, new_tier, change_reason, changed_by, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      historyId,
      userId,
      currentProfile.subscription_tier,
      tier,
      reason || 'Admin adjustment',
      user.id,
      JSON.stringify({ adminChange: true, timestamp: now })
    );

    // Create notification for user
    const notificationId = `admin-notif-${Date.now()}`;
    db.prepare(`
      INSERT INTO subscription_notifications (id, user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      notificationId,
      userId,
      'subscription_change',
      'Subscription Updated',
      `Your subscription has been updated by an administrator to ${tier} tier`,
      JSON.stringify({ adminChange: true, changedBy: user.name })
    );

    const updatedProfile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(userId);

    res.json({
      success: true,
      profile: {
        ...updatedProfile,
        apiRequestsUsed: updatedProfile.api_requests_used,
        apiRequestsLimit: updatedProfile.api_requests_limit,
        subscriptionTier: updatedProfile.subscription_tier
      }
    });
  } catch (error: any) {
    console.error('Admin update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Usage warning system (creates notifications when approaching limits)
router.post('/check-usage-limits', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;

    const profile = db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const usagePercent = (profile.api_requests_used / profile.api_requests_limit) * 100;
    const notifications = [];

    // Check for warning thresholds
    if (usagePercent >= 80 && usagePercent < 100) {
      // Check if we've already sent a warning recently
      const recentWarning = db.prepare(`
        SELECT id FROM subscription_notifications
        WHERE user_id = ? AND type = 'usage_warning' AND created_at > datetime('now', '-24 hours')
      `).get(user.id);

      if (!recentWarning) {
        const notificationId = `warning-${Date.now()}`;
        db.prepare(`
          INSERT INTO subscription_notifications (id, user_id, type, title, message, action_url)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          notificationId,
          user.id,
          'usage_warning',
          'Usage Warning',
          `You have used ${Math.round(usagePercent)}% of your ${profile.subscription_tier} plan limit.`,
          '/settings?tab=subscription'
        );
        notifications.push('usage_warning');
      }
    }

    res.json({
      success: true,
      usagePercent: Math.round(usagePercent),
      notifications
    });
  } catch (error: any) {
    console.error('Check usage limits error:', error);
    res.status(500).json({ error: 'Failed to check usage limits' });
  }
});

// Generate code with AI (Enhanced with better validation)
router.post('/generate', authenticateToken, requireDeveloper, validateUsageLimits, async (req: Request, res: Response) => {
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

// Get available AI models (available to all authenticated users)
router.get('/models/:provider', authenticateToken, requireAuth, (req: Request, res: Response) => {
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

// ==========================================
// WORKSPACE MANAGEMENT ROUTES
// ==========================================

// Create workspace
router.post('/workspaces', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { name, description, isPublic, settings } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const workspaceManager = createWorkspaceManager(db);
    const workspace = workspaceManager.createWorkspace(
      name.trim(),
      description || '',
      user.id,
      isPublic || false,
      settings || {}
    );

    // Add creator as owner
    workspaceManager.addWorkspaceMember(workspace.id, user.id, 'owner', ['read', 'write', 'admin']);

    res.json({
      success: true,
      workspace: {
        ...workspace,
        members: workspaceManager.getWorkspaceMembers(workspace.id)
      }
    });
  } catch (error: any) {
    console.error('Create workspace error:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Get user workspaces
router.get('/workspaces', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;

    const workspaceManager = createWorkspaceManager(db);

    // Get workspaces where user is a member
    const workspaces = db.prepare(`
      SELECT w.* FROM workspaces w
      INNER JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE wm.user_id = ?
      ORDER BY w.created_at DESC
    `).all(user.id) as any[];

    const workspacesWithMembers = workspaces.map(workspace => ({
      ...workspace,
      is_public: Boolean(workspace.is_public),
      settings: JSON.parse(workspace.settings || '{}'),
      members: workspaceManager.getWorkspaceMembers(workspace.id)
    }));

    res.json({
      success: true,
      workspaces: workspacesWithMembers
    });
  } catch (error: any) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ error: 'Failed to get workspaces' });
  }
});

// Get workspace details
router.get('/workspaces/:id', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = (req as any).db;

    const workspaceManager = createWorkspaceManager(db);
    const workspace = workspaceManager.getWorkspace(id);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json({
      success: true,
      workspace: {
        ...workspace,
        members: workspaceManager.getWorkspaceMembers(id)
      }
    });
  } catch (error: any) {
    console.error('Get workspace error:', error);
    res.status(500).json({ error: 'Failed to get workspace' });
  }
});

// Add workspace member
router.post('/workspaces/:id/members', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, role = 'member', permissions = [] } = req.body;
    const db = (req as any).db;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const workspaceManager = createWorkspaceManager(db);
    const member = workspaceManager.addWorkspaceMember(id, userId, role, permissions);

    res.json({
      success: true,
      member
    });
  } catch (error: any) {
    console.error('Add workspace member error:', error);
    res.status(500).json({ error: 'Failed to add workspace member' });
  }
});

// ==========================================
// COLLABORATION ROUTES
// ==========================================

// Create collaboration session
router.post('/collaboration/sessions', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { workspaceId, name, description, settings } = req.body;

    if (!workspaceId || !name) {
      return res.status(400).json({ error: 'Workspace ID and name are required' });
    }

    const collaborationService = createCollaborationService(db);
    const session = collaborationService.createSession(
      workspaceId,
      name,
      description || '',
      user.id,
      settings || {}
    );

    res.json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error('Create collaboration session error:', error);
    res.status(500).json({ error: 'Failed to create collaboration session' });
  }
});

// Join collaboration session
router.post('/collaboration/sessions/:id/join', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const db = (req as any).db;

    const collaborationService = createCollaborationService(db);
    const session = collaborationService.joinSession(id, user.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found or inactive' });
    }

    res.json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

// Leave collaboration session
router.post('/collaboration/sessions/:id/leave', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const db = (req as any).db;

    const collaborationService = createCollaborationService(db);
    const success = collaborationService.leaveSession(id, user.id);

    if (!success) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Leave session error:', error);
    res.status(500).json({ error: 'Failed to leave session' });
  }
});

// Get session events
router.get('/collaboration/sessions/:id/events', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;
    const db = (req as any).db;

    const collaborationService = createCollaborationService(db);
    const events = collaborationService.getSessionEvents(id, Number(limit));

    res.json({
      success: true,
      events
    });
  } catch (error: any) {
    console.error('Get session events error:', error);
    res.status(500).json({ error: 'Failed to get session events' });
  }
});

// Update live cursor
router.post('/collaboration/cursor', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { sessionId, filePath, lineNumber, column, color } = req.body;

    if (!sessionId || !filePath || lineNumber === undefined || column === undefined) {
      return res.status(400).json({ error: 'Session ID, file path, line number, and column are required' });
    }

    const collaborationService = createCollaborationService(db);
    const cursor = collaborationService.updateLiveCursor(
      sessionId,
      user.id,
      filePath,
      lineNumber,
      column,
      color || '#3B82F6',
      user.name || 'Unknown User'
    );

    // Get all cursors for this session
    const allCursors = collaborationService.getLiveCursors(sessionId);

    res.json({
      success: true,
      cursor,
      allCursors
    });
  } catch (error: any) {
    console.error('Update cursor error:', error);
    res.status(500).json({ error: 'Failed to update cursor' });
  }
});

// Add code comment
router.post('/collaboration/comments', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { sessionId, filePath, lineNumber, columnStart, columnEnd, content } = req.body;

    if (!sessionId || !filePath || !content) {
      return res.status(400).json({ error: 'Session ID, file path, and content are required' });
    }

    const collaborationService = createCollaborationService(db);
    const comment = collaborationService.addCodeComment(
      sessionId,
      filePath,
      lineNumber || 0,
      columnStart || 0,
      columnEnd || 0,
      content,
      user.id
    );

    res.json({
      success: true,
      comment
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get file comments
router.get('/collaboration/sessions/:id/comments/:filePath', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const { id, filePath } = req.params;
    const db = (req as any).db;

    const collaborationService = createCollaborationService(db);
    const comments = collaborationService.getFileComments(id, decodeURIComponent(filePath));

    res.json({
      success: true,
      comments
    });
  } catch (error: any) {
    console.error('Get file comments error:', error);
    res.status(500).json({ error: 'Failed to get file comments' });
  }
});

// ==========================================
// PROJECT TEMPLATES
// ==========================================

// Get project templates
router.get('/templates', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const db = (req as any).db;

    const workspaceManager = createWorkspaceManager(db);
    const templates = workspaceManager.getProjectTemplates(category as string);

    res.json({
      success: true,
      templates
    });
  } catch (error: any) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Create project template
router.post('/templates', authenticateToken, requireDeveloper, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { name, description, category, templateData, isPublic } = req.body;

    if (!name || !category || !templateData) {
      return res.status(400).json({ error: 'Name, category, and template data are required' });
    }

    const workspaceManager = createWorkspaceManager(db);
    const template = workspaceManager.createProjectTemplate(
      name,
      description || '',
      category,
      templateData,
      user.id,
      isPublic || false
    );

    res.json({
      success: true,
      template
    });
  } catch (error: any) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

  return router;
};

export default createSDKRouter;

