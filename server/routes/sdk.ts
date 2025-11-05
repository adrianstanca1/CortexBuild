// CortexBuild - SDK API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../auth-supabase';
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

  // Add missing columns to existing sdk_profiles table if they don't exist
  try {
    db.exec(`ALTER TABLE sdk_profiles ADD COLUMN subscription_status TEXT DEFAULT 'active'`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_profiles ADD COLUMN stripe_customer_id TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_profiles ADD COLUMN current_period_start DATETIME`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_profiles ADD COLUMN current_period_end DATETIME`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_profiles ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_profiles ADD COLUMN trial_ends_at DATETIME`);
  } catch (error) {
    // Column already exists, ignore
  }

  // Add missing columns to sdk_workflows table
  try {
    db.exec(`ALTER TABLE sdk_workflows ADD COLUMN is_public INTEGER DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_workflows ADD COLUMN tags TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_workflows ADD COLUMN category TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_workflows ADD COLUMN downloads INTEGER DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_workflows ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_workflows ADD COLUMN reviews_count INTEGER DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  // Add missing columns to sdk_apps table
  try {
    db.exec(`ALTER TABLE sdk_apps ADD COLUMN repository_url TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_apps ADD COLUMN documentation_url TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_apps ADD COLUMN demo_url TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_apps ADD COLUMN price DECIMAL(10, 2) DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_apps ADD COLUMN is_free BOOLEAN DEFAULT 1`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_apps ADD COLUMN downloads INTEGER DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_apps ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_apps ADD COLUMN reviews_count INTEGER DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE sdk_apps ADD COLUMN published_at DATETIME`);
  } catch (error) {
    // Column already exists, ignore
  }

  // Add missing columns to ai_agents table
  try {
    db.exec(`ALTER TABLE ai_agents ADD COLUMN last_activity DATETIME`);
  } catch (error) {
    // Column already exists, ignore
  }

  // Add missing columns to api_usage_logs table
  try {
    db.exec(`ALTER TABLE api_usage_logs ADD COLUMN session_id TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE api_usage_logs ADD COLUMN operation TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE api_usage_logs ADD COLUMN duration_ms INTEGER DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE api_usage_logs ADD COLUMN success BOOLEAN DEFAULT 1`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE api_usage_logs ADD COLUMN error_message TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE api_usage_logs ADD COLUMN metadata TEXT`);
  } catch (error) {
    // Column already exists, ignore
  }

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

// Get or create SDK profile (available to all authenticated users)
router.get('/profile', authenticateToken, requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;

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

      // TODO: Implement API key saving logic
      res.json({ success: true, message: 'API key saved successfully' });
    } catch (error: any) {
      console.error('Save API key error:', error);
      res.status(500).json({ error: 'Failed to save API key' });
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

      if (error) throw error;

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

    res.json({ success: true, app });
  } catch (error: any) {
    console.error('Error updating app status:', error);
    res.status(500).json({ error: error.message || 'Failed to update app status' });
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

    // TODO: Implement AI code generation
    res.json({ 
      success: true, 
      code: '// AI-generated code will appear here', 
      message: 'AI code generation coming soon' 
    });
  } catch (error: any) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: error.message || 'Failed to generate code' });
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

// Get available AI models (available to all authenticated users)
router.get('/models/:provider', authenticateToken, requireAuth, (req: Request, res: Response) => {
try {
  const { provider } = req.params;

  if (provider !== 'gemini' && provider !== 'openai') {
    return res.status(400).json({ error: 'Invalid provider. Use "gemini" or "openai"' });
  }

  const models = AICodeGenerator.getAvailableModels(provider);
  res.json({ success: true, models });
} catch (error: any) {
  console.error('Get models error:', error);
  res.status(500).json({ error: error.message || 'Failed to get models' });
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
