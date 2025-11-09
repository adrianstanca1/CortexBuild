-- Missing tables for Developer Platform (safe to re-run)

-- API Usage Logs (already exists, skip)
-- CREATE TABLE IF NOT EXISTS api_usage_logs...

-- Webhooks (already exists, skip)
-- CREATE TABLE IF NOT EXISTS webhooks...

-- Sandbox Runs (already exists, skip)
-- CREATE TABLE IF NOT EXISTS sandbox_runs...

-- Builder Modules (already exists, skip)
-- CREATE TABLE IF NOT EXISTS builder_modules...

-- Webhook Delivery Logs
CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
  id TEXT PRIMARY KEY,
  webhook_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  response_status INTEGER,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  company_id TEXT,
  provider TEXT NOT NULL,
  credentials TEXT,
  config TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes (safe to re-run)
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_runs_user ON sandbox_runs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_builder_modules_user ON builder_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_webhook ON webhook_delivery_logs(webhook_id, created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations(user_id, company_id);
