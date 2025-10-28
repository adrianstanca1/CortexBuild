-- ============================================================================
-- CORTEXBUILD - COMPLETE MARKETPLACE SCHEMA FOR SUPABASE
-- ============================================================================
-- Comprehensive marketplace system with categories, modules, reviews, and analytics
-- Version: 2.0.0
-- Date: 2025-10-26
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- MARKETPLACE CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || gen_random_uuid()::text),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT '📦',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_categories_slug ON marketplace_categories(slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_is_active ON marketplace_categories(is_active);

-- ============================================================================
-- MARKETPLACE MODULES/APPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_modules (
    id TEXT PRIMARY KEY DEFAULT ('module-' || gen_random_uuid()::text),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    long_description TEXT,
    version TEXT DEFAULT '1.0.0',
    category_id TEXT REFERENCES marketplace_categories(id),
    developer_id TEXT REFERENCES users(id),
    company_id TEXT REFERENCES companies(id),

    -- Pricing
    price DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    pricing_model TEXT DEFAULT 'one-time', -- one-time, monthly, yearly, free

    -- Status
    status TEXT DEFAULT 'draft', -- draft, pending_review, approved, rejected, published, archived
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,

    -- Media
    icon TEXT DEFAULT '📦',
    cover_image TEXT,
    screenshots JSONB DEFAULT '[]'::jsonb,
    demo_url TEXT,

    -- Metadata
    features JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,

    -- Stats
    downloads INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,

    -- Review process
    review_feedback TEXT,
    reviewed_by TEXT REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,

    -- Publishing
    published_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_modules_category ON marketplace_modules(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_developer ON marketplace_modules(developer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_status ON marketplace_modules(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_is_public ON marketplace_modules(is_public);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_is_featured ON marketplace_modules(is_featured);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_slug ON marketplace_modules(slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_rating ON marketplace_modules(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_downloads ON marketplace_modules(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_published_at ON marketplace_modules(published_at DESC);

-- ============================================================================
-- USER MODULE INSTALLATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_module_installations (
    id TEXT PRIMARY KEY DEFAULT ('install-' || gen_random_uuid()::text),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL REFERENCES marketplace_modules(id) ON DELETE CASCADE,

    -- Installation details
    version TEXT NOT NULL,
    installed_by TEXT REFERENCES users(id),
    installation_type TEXT DEFAULT 'user', -- user, company

    -- Status
    status TEXT DEFAULT 'active', -- active, inactive, uninstalled
    is_active BOOLEAN DEFAULT true,

    -- Configuration
    config JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    uninstalled_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_user_module_installations_user ON user_module_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_installations_module ON user_module_installations(module_id);
CREATE INDEX IF NOT EXISTS idx_user_module_installations_status ON user_module_installations(status);

-- ============================================================================
-- COMPANY MODULE INSTALLATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_module_installations (
    id TEXT PRIMARY KEY DEFAULT ('company-install-' || gen_random_uuid()::text),
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL REFERENCES marketplace_modules(id) ON DELETE CASCADE,

    -- Installation details
    version TEXT NOT NULL,
    installed_by TEXT REFERENCES users(id),

    -- Status
    status TEXT DEFAULT 'active', -- active, inactive, uninstalled
    is_active BOOLEAN DEFAULT true,

    -- Configuration
    config JSONB DEFAULT '{}'::jsonb,

    -- Billing
    license_type TEXT DEFAULT 'company', -- company, per-user
    max_users INTEGER,

    -- Timestamps
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    uninstalled_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(company_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_company_module_installations_company ON company_module_installations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_module_installations_module ON company_module_installations(module_id);
CREATE INDEX IF NOT EXISTS idx_company_module_installations_status ON company_module_installations(status);

-- ============================================================================
-- MODULE REVIEWS & RATINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS module_reviews (
    id TEXT PRIMARY KEY DEFAULT ('review-' || gen_random_uuid()::text),
    module_id TEXT NOT NULL REFERENCES marketplace_modules(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,

    -- Helpfulness
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,

    -- Status
    is_verified_purchase BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(module_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_module_reviews_module ON module_reviews(module_id);
CREATE INDEX IF NOT EXISTS idx_module_reviews_user ON module_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_module_reviews_rating ON module_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_module_reviews_created_at ON module_reviews(created_at DESC);

-- ============================================================================
-- MODULE REVIEW HISTORY (Admin Review Process)
-- ============================================================================

CREATE TABLE IF NOT EXISTS module_review_history (
    id TEXT PRIMARY KEY DEFAULT ('admin-review-' || gen_random_uuid()::text),
    module_id TEXT NOT NULL REFERENCES marketplace_modules(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL REFERENCES users(id),

    -- Review details
    previous_status TEXT,
    new_status TEXT NOT NULL,
    feedback TEXT,

    -- Checklist
    security_check BOOLEAN DEFAULT false,
    quality_check BOOLEAN DEFAULT false,
    documentation_check BOOLEAN DEFAULT false,

    -- Timestamp
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_module_review_history_module ON module_review_history(module_id);
CREATE INDEX IF NOT EXISTS idx_module_review_history_reviewer ON module_review_history(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_module_review_history_reviewed_at ON module_review_history(reviewed_at DESC);

-- ============================================================================
-- MODULE ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS module_analytics (
    id TEXT PRIMARY KEY DEFAULT ('analytics-' || gen_random_uuid()::text),
    module_id TEXT NOT NULL REFERENCES marketplace_modules(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    company_id TEXT REFERENCES companies(id),

    -- Event details
    event_type TEXT NOT NULL, -- view, install, uninstall, launch, purchase, review
    event_data JSONB DEFAULT '{}'::jsonb,

    -- Context
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_module_analytics_module ON module_analytics(module_id);
CREATE INDEX IF NOT EXISTS idx_module_analytics_event_type ON module_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_module_analytics_created_at ON module_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_module_analytics_user ON module_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_module_analytics_company ON module_analytics(company_id);

-- ============================================================================
-- MODULE VERSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS module_versions (
    id TEXT PRIMARY KEY DEFAULT ('version-' || gen_random_uuid()::text),
    module_id TEXT NOT NULL REFERENCES marketplace_modules(id) ON DELETE CASCADE,

    -- Version details
    version TEXT NOT NULL,
    changelog TEXT,
    download_url TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_stable BOOLEAN DEFAULT true,

    -- Requirements
    min_platform_version TEXT,
    max_platform_version TEXT,

    -- Stats
    downloads INTEGER DEFAULT 0,

    -- Timestamps
    released_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deprecated_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(module_id, version)
);

CREATE INDEX IF NOT EXISTS idx_module_versions_module ON module_versions(module_id);
CREATE INDEX IF NOT EXISTS idx_module_versions_is_active ON module_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_module_versions_released_at ON module_versions(released_at DESC);

-- ============================================================================
-- SEED DATA - Categories
-- ============================================================================

INSERT INTO marketplace_categories (id, name, slug, description, icon, display_order)
VALUES
    ('cat-proj-mgmt', 'Project Management', 'project-management', 'Tools for managing construction projects', '📋', 1),
    ('cat-financial', 'Financial', 'financial', 'Budgeting and expense management tools', '💰', 2),
    ('cat-collab', 'Collaboration', 'collaboration', 'Team communication and file sharing', '💬', 3),
    ('cat-analytics', 'Analytics', 'analytics', 'Data insights and reporting tools', '📊', 4),
    ('cat-mobile', 'Mobile', 'mobile', 'Mobile-first construction tools', '📱', 5),
    ('cat-safety', 'Safety', 'safety', 'Safety compliance and incident tracking', '🛡️', 6),
    ('cat-quality', 'Quality Control', 'quality', 'Quality assurance and inspection tools', '✅', 7),
    ('cat-scheduling', 'Scheduling', 'scheduling', 'Project scheduling and timeline management', '📅', 8),
    ('cat-productivity', 'Productivity', 'productivity', 'Productivity and efficiency tools', '⚡', 9),
    ('cat-communication', 'Communication', 'communication', 'Communication and messaging tools', '💬', 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED DATA - Sample Modules
-- ============================================================================

INSERT INTO marketplace_modules (
    id, name, slug, description, long_description, version, category_id,
    price, pricing_model, status, is_public, is_featured, icon,
    features, tags, downloads, rating_average, rating_count, published_at
)
VALUES
    (
        'module-proj-mgmt-1',
        'Project Management Pro',
        'project-management-pro',
        'Comprehensive project tracking and management',
        'Advanced project management tool with Gantt charts, resource allocation, and real-time collaboration features. Perfect for construction teams managing multiple projects.',
        '1.0.0',
        'cat-proj-mgmt',
        0,
        'free',
        'published',
        true,
        true,
        '📋',
        '["Task Management", "Progress Tracking", "Team Collaboration", "Gantt Charts", "Resource Allocation"]'::jsonb,
        '["project", "management", "tasks", "gantt"]'::jsonb,
        1250,
        4.8,
        89,
        NOW()
    ),
    (
        'module-financial-1',
        'Financial Tracking',
        'financial-tracking',
        'Advanced budgeting and expense management',
        'Complete financial management solution with budget tracking, expense reporting, invoice generation, and real-time financial insights.',
        '1.2.0',
        'cat-financial',
        29.99,
        'monthly',
        'published',
        true,
        true,
        '💰',
        '["Budget Management", "Expense Tracking", "Financial Reports", "Invoice Generation", "Cost Forecasting"]'::jsonb,
        '["finance", "budget", "expenses", "invoices"]'::jsonb,
        890,
        4.9,
        67,
        NOW()
    ),
    (
        'module-collab-1',
        'Team Collaboration Hub',
        'team-collaboration-hub',
        'Real-time communication and file sharing',
        'Integrated collaboration platform with instant messaging, video calls, file sharing, and team activity feeds.',
        '2.0.0',
        'cat-collab',
        19.99,
        'monthly',
        'published',
        true,
        false,
        '💬',
        '["Real-time Chat", "File Sharing", "Video Calls", "Activity Feed", "Notifications"]'::jsonb,
        '["collaboration", "chat", "video", "files"]'::jsonb,
        650,
        4.7,
        52,
        NOW()
    ),
    (
        'module-analytics-1',
        'Advanced Analytics',
        'advanced-analytics',
        'AI-powered insights and reporting',
        'Powerful analytics engine with AI-driven insights, custom dashboards, predictive analytics, and automated reporting.',
        '1.5.0',
        'cat-analytics',
        49.99,
        'monthly',
        'published',
        true,
        true,
        '📊',
        '["AI Insights", "Custom Reports", "Data Visualization", "Predictive Analytics", "Export Tools"]'::jsonb,
        '["analytics", "ai", "reports", "insights"]'::jsonb,
        420,
        4.6,
        38,
        NOW()
    ),
    (
        'module-mobile-1',
        'Mobile Field Manager',
        'mobile-field-manager',
        'Complete mobile solution for field teams',
        'Mobile-first application for field teams with offline support, GPS tracking, photo documentation, and real-time sync.',
        '1.0.0',
        'cat-mobile',
        0,
        'free',
        'published',
        true,
        false,
        '📱',
        '["Offline Support", "GPS Tracking", "Photo Documentation", "Real-time Sync", "Voice Notes"]'::jsonb,
        '["mobile", "field", "offline", "gps"]'::jsonb,
        312,
        4.5,
        28,
        NOW()
    ),
    (
        'module-safety-1',
        'Safety Compliance Suite',
        'safety-compliance-suite',
        'Comprehensive safety management system',
        'Complete safety management platform with incident tracking, safety inspections, compliance reporting, and training management.',
        '1.1.0',
        'cat-safety',
        39.99,
        'monthly',
        'published',
        true,
        true,
        '🛡️',
        '["Incident Tracking", "Safety Inspections", "Compliance Reports", "Training Management", "Risk Assessment"]'::jsonb,
        '["safety", "compliance", "incidents", "inspections"]'::jsonb,
        245,
        4.9,
        41,
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update module stats when a review is added
CREATE OR REPLACE FUNCTION update_module_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketplace_modules
    SET
        rating_average = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM module_reviews
            WHERE module_id = NEW.module_id AND is_public = true
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM module_reviews
            WHERE module_id = NEW.module_id AND is_public = true
        ),
        updated_at = NOW()
    WHERE id = NEW.module_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings when review is added/updated
DROP TRIGGER IF EXISTS trigger_update_module_rating ON module_reviews;
CREATE TRIGGER trigger_update_module_rating
    AFTER INSERT OR UPDATE ON module_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_module_rating();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_module_downloads()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketplace_modules
    SET downloads = downloads + 1,
        updated_at = NOW()
    WHERE id = NEW.module_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment downloads on installation
DROP TRIGGER IF EXISTS trigger_increment_downloads_user ON user_module_installations;
CREATE TRIGGER trigger_increment_downloads_user
    AFTER INSERT ON user_module_installations
    FOR EACH ROW
    EXECUTE FUNCTION increment_module_downloads();

DROP TRIGGER IF EXISTS trigger_increment_downloads_company ON company_module_installations;
CREATE TRIGGER trigger_increment_downloads_company
    AFTER INSERT ON company_module_installations
    FOR EACH ROW
    EXECUTE FUNCTION increment_module_downloads();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at columns
DROP TRIGGER IF EXISTS trigger_update_marketplace_categories ON marketplace_categories;
CREATE TRIGGER trigger_update_marketplace_categories
    BEFORE UPDATE ON marketplace_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_marketplace_modules ON marketplace_modules;
CREATE TRIGGER trigger_update_marketplace_modules
    BEFORE UPDATE ON marketplace_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_module_reviews ON module_reviews;
CREATE TRIGGER trigger_update_module_reviews
    BEFORE UPDATE ON module_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_module_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_versions ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Anyone can view active categories"
    ON marketplace_categories FOR SELECT
    USING (is_active = true);

-- Public read access for published modules
CREATE POLICY "Anyone can view published modules"
    ON marketplace_modules FOR SELECT
    USING (is_public = true AND status = 'published');

-- Developers can manage their own modules
CREATE POLICY "Developers can manage their modules"
    ON marketplace_modules FOR ALL
    USING (auth.uid()::text = developer_id);

-- Users can view their own installations
CREATE POLICY "Users can view their installations"
    ON user_module_installations FOR SELECT
    USING (auth.uid()::text = user_id);

-- Users can install modules
CREATE POLICY "Users can install modules"
    ON user_module_installations FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Public read access for reviews
CREATE POLICY "Anyone can view public reviews"
    ON module_reviews FOR SELECT
    USING (is_public = true);

-- Users can manage their own reviews
CREATE POLICY "Users can manage their reviews"
    ON module_reviews FOR ALL
    USING (auth.uid()::text = user_id);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for modules with category information
CREATE OR REPLACE VIEW marketplace_modules_with_details AS
SELECT
    m.*,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    u.name as developer_name,
    u.email as developer_email
FROM marketplace_modules m
LEFT JOIN marketplace_categories c ON m.category_id = c.id
LEFT JOIN users u ON m.developer_id = u.id;

-- View for featured modules
CREATE OR REPLACE VIEW marketplace_featured_modules AS
SELECT *
FROM marketplace_modules_with_details
WHERE is_featured = true AND is_public = true AND status = 'published'
ORDER BY rating_average DESC, downloads DESC;

-- View for popular modules
CREATE OR REPLACE VIEW marketplace_popular_modules AS
SELECT *
FROM marketplace_modules_with_details
WHERE is_public = true AND status = 'published'
ORDER BY downloads DESC, rating_average DESC
LIMIT 20;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
