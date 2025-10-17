-- ============================================================================
-- Multi-Tenant System with Invitations
-- ============================================================================

-- Drop existing notifications table if needed (we'll recreate it)
-- DROP TABLE IF EXISTS notifications;

-- Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  company_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('company_admin', 'project_manager', 'supervisor', 'developer', 'viewer')),
  invited_by TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  accepted BOOLEAN DEFAULT 0,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  company_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK(plan IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancel_at_period_end BOOLEAN DEFAULT 0,
  trial_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Subscription History (for tracking plan changes)
CREATE TABLE IF NOT EXISTS subscription_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  old_plan TEXT,
  new_plan TEXT NOT NULL,
  changed_by TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Usage Tracking (for metered billing)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL,
  metric TEXT NOT NULL, -- 'ai_generations', 'api_calls', 'storage_gb', 'users'
  value REAL NOT NULL,
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Company Features (feature flags per company)
CREATE TABLE IF NOT EXISTS company_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL,
  feature TEXT NOT NULL, -- 'ai_agents', 'uk_tender_assistant', 'advanced_analytics', etc.
  enabled BOOLEAN DEFAULT 1,
  limit_value INTEGER, -- e.g., max AI generations per month
  current_usage INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(company_id, feature)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_company ON invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_company ON usage_tracking(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_company_features_company ON company_features(company_id);

-- Seed default subscriptions for existing companies
INSERT OR IGNORE INTO subscriptions (id, company_id, plan, status, current_period_start, current_period_end)
SELECT
  'sub-' || id,
  id,
  'pro', -- Default to pro for existing companies
  'active',
  CURRENT_TIMESTAMP,
  datetime(CURRENT_TIMESTAMP, '+1 month')
FROM companies;

-- Seed default features for existing companies
INSERT OR IGNORE INTO company_features (company_id, feature, enabled, limit_value)
SELECT
  id,
  'ai_agents',
  1,
  500
FROM companies;

INSERT OR IGNORE INTO company_features (company_id, feature, enabled, limit_value)
SELECT
  id,
  'uk_tender_assistant',
  1,
  100
FROM companies;

-- Audit log for multi-tenant actions
CREATE TABLE IF NOT EXISTS tenant_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL, -- 'invite_sent', 'user_added', 'feature_toggled', etc.
  resource_type TEXT, -- 'invitation', 'user', 'subscription'
  resource_id TEXT,
  metadata TEXT, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tenant_audit_company ON tenant_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_action ON tenant_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_created ON tenant_audit_log(created_at);
