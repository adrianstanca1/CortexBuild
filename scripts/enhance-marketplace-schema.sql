-- ============================================================================
-- MARKETPLACE ENHANCEMENT SCHEMA
-- Complete global marketplace system with publishing workflow
-- ============================================================================

-- 1. Add status tracking to sdk_apps for publishing workflow
-- Status: draft, pending_review, approved, rejected, published
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we use PRAGMA to check first

-- Check if columns exist and add them
-- These will fail silently if columns already exist (handled by try-catch in application)
ALTER TABLE sdk_apps ADD COLUMN review_status TEXT DEFAULT 'draft';
ALTER TABLE sdk_apps ADD COLUMN review_feedback TEXT;
ALTER TABLE sdk_apps ADD COLUMN reviewed_by TEXT;
ALTER TABLE sdk_apps ADD COLUMN reviewed_at DATETIME;
ALTER TABLE sdk_apps ADD COLUMN published_at DATETIME;
ALTER TABLE sdk_apps ADD COLUMN icon TEXT DEFAULT '📦';
ALTER TABLE sdk_apps ADD COLUMN category TEXT DEFAULT 'general';
ALTER TABLE sdk_apps ADD COLUMN is_public INTEGER DEFAULT 0;

-- 2. Create user_app_installations table for individual installations
CREATE TABLE IF NOT EXISTS user_app_installations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    app_id TEXT NOT NULL,
    installation_type TEXT NOT NULL, -- 'individual' or 'company'
    installed_by TEXT NOT NULL,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    config TEXT, -- JSON configuration
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES sdk_apps(id) ON DELETE CASCADE,
    FOREIGN KEY (installed_by) REFERENCES users(id),
    UNIQUE(user_id, app_id)
);

-- 3. Create company_app_installations table for company-wide installations
CREATE TABLE IF NOT EXISTS company_app_installations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    app_id TEXT NOT NULL,
    installed_by TEXT NOT NULL,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    config TEXT, -- JSON configuration
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES sdk_apps(id) ON DELETE CASCADE,
    FOREIGN KEY (installed_by) REFERENCES users(id),
    UNIQUE(company_id, app_id)
);

-- 4. Create app_review_history table for tracking review process
CREATE TABLE IF NOT EXISTS app_review_history (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    feedback TEXT,
    reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES sdk_apps(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- 5. Create app_analytics table for tracking usage
CREATE TABLE IF NOT EXISTS app_analytics (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'view', 'install', 'uninstall', 'launch'
    user_id TEXT,
    company_id TEXT,
    metadata TEXT, -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES sdk_apps(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sdk_apps_review_status ON sdk_apps(review_status);
CREATE INDEX IF NOT EXISTS idx_sdk_apps_is_public ON sdk_apps(is_public);
CREATE INDEX IF NOT EXISTS idx_sdk_apps_published_at ON sdk_apps(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_app_installations_user ON user_app_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_installations_app ON user_app_installations(app_id);
CREATE INDEX IF NOT EXISTS idx_company_app_installations_company ON company_app_installations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_app_installations_app ON company_app_installations(app_id);
CREATE INDEX IF NOT EXISTS idx_app_review_history_app ON app_review_history(app_id);
CREATE INDEX IF NOT EXISTS idx_app_analytics_app ON app_analytics(app_id);
CREATE INDEX IF NOT EXISTS idx_app_analytics_event ON app_analytics(event_type);

-- 7. Update existing apps to have proper status
UPDATE sdk_apps SET review_status = 'draft' WHERE review_status IS NULL;
UPDATE sdk_apps SET is_public = 0 WHERE is_public IS NULL;

-- 8. Sample data for testing (optional - can be removed in production)
-- This creates a few sample published apps for testing

INSERT OR IGNORE INTO sdk_apps (
    id, developer_id, company_id, name, description, version, 
    status, review_status, is_public, icon, category, published_at
) VALUES 
(
    'app-sample-1',
    'user-1',
    'company-1',
    'Project Dashboard',
    'Real-time project monitoring and analytics dashboard',
    '1.0.0',
    'published',
    'approved',
    1,
    '📊',
    'analytics',
    CURRENT_TIMESTAMP
),
(
    'app-sample-2',
    'user-1',
    'company-1',
    'Team Chat',
    'Instant messaging and collaboration tool for teams',
    '1.0.0',
    'published',
    'approved',
    1,
    '💬',
    'communication',
    CURRENT_TIMESTAMP
),
(
    'app-sample-3',
    'user-1',
    'company-1',
    'Time Tracker',
    'Track time spent on projects and tasks',
    '1.0.0',
    'published',
    'approved',
    1,
    '⏱️',
    'productivity',
    CURRENT_TIMESTAMP
);

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

