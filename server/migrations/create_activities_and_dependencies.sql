-- ============================================
-- CortexBuild Platform - Activities & Dependencies
-- Create all necessary tables for the 3 dashboards
-- ============================================

-- 1. Activities Table (for all user actions across platform)
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  company_id TEXT,
  action TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_company ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- 2. Developer Metrics Table (for Developer Dashboard)
CREATE TABLE IF NOT EXISTS developer_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  developer_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  metric_date DATE NOT NULL,
  api_calls INTEGER DEFAULT 0,
  ai_requests INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_incurred REAL DEFAULT 0.0,
  modules_created INTEGER DEFAULT 0,
  workflows_executed INTEGER DEFAULT 0,
  sandbox_runs INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(developer_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_dev_metrics_developer ON developer_metrics(developer_id);
CREATE INDEX IF NOT EXISTS idx_dev_metrics_date ON developer_metrics(metric_date DESC);

-- 3. Company Admin Metrics (for Company Admin Dashboard)
CREATE TABLE IF NOT EXISTS company_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL,
  metric_date DATE NOT NULL,
  active_projects INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0.0,
  expenses REAL DEFAULT 0.0,
  safety_incidents INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(company_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_company_metrics_company ON company_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_company_metrics_date ON company_metrics(metric_date DESC);

-- 4. Developer Projects (SDK modules, apps, integrations)
CREATE TABLE IF NOT EXISTS developer_projects (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'module', 'workflow', 'integration', 'agent'
  status TEXT DEFAULT 'draft', -- 'draft', 'testing', 'published', 'archived'
  version TEXT DEFAULT '1.0.0',
  code TEXT,
  config TEXT,
  install_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dev_projects_developer ON developer_projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_dev_projects_status ON developer_projects(status);
CREATE INDEX IF NOT EXISTS idx_dev_projects_type ON developer_projects(type);

-- 5. Sandbox Sessions (for Developer Dashboard)
CREATE TABLE IF NOT EXISTS sandbox_sessions (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'stopped', 'failed'
  code TEXT,
  output TEXT,
  error TEXT,
  execution_time INTEGER,
  memory_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sandbox_developer ON sandbox_sessions(developer_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_status ON sandbox_sessions(status);

-- 6. Company Tasks (for Company Admin Dashboard)
CREATE TABLE IF NOT EXISTS company_tasks_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL,
  project_id TEXT,
  status TEXT NOT NULL,
  priority TEXT,
  count INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_company_tasks_company ON company_tasks_summary(company_id);
CREATE INDEX IF NOT EXISTS idx_company_tasks_project ON company_tasks_summary(project_id);

-- 7. Financial Summary (for Company Admin Dashboard)
CREATE TABLE IF NOT EXISTS financial_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue REAL DEFAULT 0.0,
  total_expenses REAL DEFAULT 0.0,
  outstanding_invoices REAL DEFAULT 0.0,
  profit_margin REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(company_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_financial_company ON financial_summary(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_period ON financial_summary(period_start DESC);

-- 8. Team Performance (for Company Admin Dashboard)
CREATE TABLE IF NOT EXISTS team_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  metric_date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  hours_logged REAL DEFAULT 0.0,
  projects_active INTEGER DEFAULT 0,
  performance_score REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_team_perf_company ON team_performance(company_id);
CREATE INDEX IF NOT EXISTS idx_team_perf_user ON team_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_team_perf_date ON team_performance(metric_date DESC);

-- 9. Platform Statistics (for Super Admin Dashboard)
CREATE TABLE IF NOT EXISTS platform_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  total_companies INTEGER DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  storage_used INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_platform_stats_date ON platform_statistics(metric_date DESC);

-- 10. API Usage Logs (already exists, but ensure it has proper indexes)
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_company ON api_usage_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_logs(created_at DESC);

-- 11. Add missing columns to existing tables if they don't exist
-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS, 
-- so we need to check manually in the application code

-- Add is_active to users table if missing
-- This will be handled in the migration script

-- ============================================
-- Insert Initial Data for Testing
-- ============================================

-- Insert a sample activity for super admin
INSERT OR IGNORE INTO activities (user_id, action, description, entity_type, created_at)
VALUES ('super-admin-1', 'login', 'Super Admin logged in', 'user', CURRENT_TIMESTAMP);

-- Insert sample platform statistics for today
INSERT OR IGNORE INTO platform_statistics (
  metric_date,
  total_users,
  total_companies,
  total_projects,
  active_users,
  api_calls,
  storage_used,
  revenue
) VALUES (
  DATE('now'),
  (SELECT COUNT(*) FROM users),
  (SELECT COUNT(*) FROM companies),
  (SELECT COUNT(*) FROM projects),
  (SELECT COUNT(*) FROM users WHERE role IS NOT NULL),
  0,
  0,
  0.0
);
