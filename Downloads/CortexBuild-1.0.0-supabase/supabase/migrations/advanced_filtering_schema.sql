-- ============================================================================
-- ADVANCED FILTERING & SEARCH SCHEMA
-- ============================================================================
-- Adds support for filter presets, search history, and bulk operations
-- Version: 1.0.0
-- Date: 2025-10-26
-- ============================================================================

-- ============================================================================
-- FILTER PRESETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS filter_presets (
    id TEXT PRIMARY KEY DEFAULT ('preset-' || gen_random_uuid()::text),
    name TEXT NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL, -- FilterCriteria object
    entity_type TEXT NOT NULL CHECK (entity_type IN ('tasks', 'projects', 'rfis', 'documents', 'users')),
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    created_by TEXT REFERENCES users(id) ON DELETE CASCADE,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure only one default preset per user per entity type
    UNIQUE(created_by, entity_type, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for filter presets
CREATE INDEX IF NOT EXISTS idx_filter_presets_created_by ON filter_presets(created_by);
CREATE INDEX IF NOT EXISTS idx_filter_presets_company_id ON filter_presets(company_id);
CREATE INDEX IF NOT EXISTS idx_filter_presets_entity_type ON filter_presets(entity_type);
CREATE INDEX IF NOT EXISTS idx_filter_presets_is_default ON filter_presets(is_default);
CREATE INDEX IF NOT EXISTS idx_filter_presets_is_shared ON filter_presets(is_shared);

-- ============================================================================
-- SEARCH HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS search_history (
    id TEXT PRIMARY KEY DEFAULT ('search-' || gen_random_uuid()::text),
    query TEXT NOT NULL,
    filters JSONB, -- FilterCriteria object
    entity_type TEXT NOT NULL CHECK (entity_type IN ('tasks', 'projects', 'rfis', 'documents', 'users')),
    result_count INTEGER DEFAULT 0,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for search history
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_company_id ON search_history(company_id);
CREATE INDEX IF NOT EXISTS idx_search_history_entity_type ON search_history(entity_type);
CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON search_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history USING gin(to_tsvector('english', query));

-- ============================================================================
-- BULK OPERATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bulk_operations (
    id TEXT PRIMARY KEY DEFAULT ('bulk-' || gen_random_uuid()::text),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('tasks', 'projects', 'rfis', 'documents', 'users')),
    operation TEXT NOT NULL CHECK (operation IN ('update', 'delete', 'move', 'assign', 'status_change')),
    selected_ids JSONB NOT NULL, -- Array of entity IDs
    changes JSONB, -- Changes to apply
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    created_by TEXT REFERENCES users(id) ON DELETE CASCADE,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for bulk operations
CREATE INDEX IF NOT EXISTS idx_bulk_operations_created_by ON bulk_operations(created_by);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_company_id ON bulk_operations(company_id);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_entity_type ON bulk_operations(entity_type);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_status ON bulk_operations(status);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_created_at ON bulk_operations(created_at DESC);

-- ============================================================================
-- AI SEARCH SUGGESTIONS CACHE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_search_cache (
    id TEXT PRIMARY KEY DEFAULT ('cache-' || gen_random_uuid()::text),
    query TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('tasks', 'projects', 'rfis', 'documents', 'users')),
    suggestions JSONB NOT NULL, -- Array of suggestion strings
    context_data JSONB, -- Additional context for AI processing
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),

    UNIQUE(query, entity_type, company_id)
);

-- Indexes for AI search cache
CREATE INDEX IF NOT EXISTS idx_ai_search_cache_query ON ai_search_cache(query);
CREATE INDEX IF NOT EXISTS idx_ai_search_cache_entity_type ON ai_search_cache(entity_type);
CREATE INDEX IF NOT EXISTS idx_ai_search_cache_company_id ON ai_search_cache(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_cache_expires_at ON ai_search_cache(expires_at);

-- ============================================================================
-- SMART FILTERS CACHE
-- ============================================================================

CREATE TABLE IF NOT EXISTS smart_filters_cache (
    id TEXT PRIMARY KEY DEFAULT ('smart-' || gen_random_uuid()::text),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('tasks', 'projects', 'rfis', 'documents', 'users')),
    filters JSONB NOT NULL, -- FilterCriteria object
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),

    UNIQUE(entity_type, company_id)
);

-- Indexes for smart filters cache
CREATE INDEX IF NOT EXISTS idx_smart_filters_cache_entity_type ON smart_filters_cache(entity_type);
CREATE INDEX IF NOT EXISTS idx_smart_filters_cache_company_id ON smart_filters_cache(company_id);
CREATE INDEX IF NOT EXISTS idx_smart_filters_cache_expires_at ON smart_filters_cache(expires_at);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE filter_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_filters_cache ENABLE ROW LEVEL SECURITY;

-- Filter presets: Users can see their own presets and shared presets from their company
CREATE POLICY filter_presets_access ON filter_presets
    FOR ALL
    USING (
        created_by = current_setting('app.current_user_id', true)::text
        OR (is_shared = true AND company_id = current_setting('app.current_company_id', true)::text)
    );

-- Search history: Users can only see their own search history
CREATE POLICY search_history_access ON search_history
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::text);

-- Bulk operations: Users can see operations they created
CREATE POLICY bulk_operations_access ON bulk_operations
    FOR ALL
    USING (created_by = current_setting('app.current_user_id', true)::text);

-- AI search cache: Company-level access
CREATE POLICY ai_search_cache_access ON ai_search_cache
    FOR ALL
    USING (company_id = current_setting('app.current_company_id', true)::text);

-- Smart filters cache: Company-level access
CREATE POLICY smart_filters_cache_access ON smart_filters_cache
    FOR ALL
    USING (company_id = current_setting('app.current_company_id', true)::text);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ai_search_cache WHERE expires_at < NOW();
    DELETE FROM smart_filters_cache WHERE expires_at < NOW();
END;
$$;

-- Function to ensure only one default preset per user per entity type
CREATE OR REPLACE FUNCTION ensure_single_default_preset()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE filter_presets
        SET is_default = false
        WHERE created_by = NEW.created_by
          AND entity_type = NEW.entity_type
          AND id != NEW.id
          AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger for default preset constraint
CREATE TRIGGER ensure_single_default_preset_trigger
    BEFORE INSERT OR UPDATE ON filter_presets
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_preset();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger for filter_presets updated_at
CREATE TRIGGER update_filter_presets_updated_at
    BEFORE UPDATE ON filter_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert some default filter presets for common use cases
INSERT INTO filter_presets (id, name, description, criteria, entity_type, is_default, is_shared, created_by, company_id)
VALUES
    ('preset-default-tasks-open', 'Open Tasks', 'Show all open tasks', '{"status": ["To Do", "In Progress"]}', 'tasks', true, true, 'user-1', 'company-1'),
    ('preset-default-projects-active', 'Active Projects', 'Show active projects', '{"status": ["active"]}', 'projects', true, true, 'user-1', 'company-1'),
    ('preset-shared-high-priority', 'High Priority', 'High priority items only', '{"priority": ["High", "urgent"]}', 'tasks', false, true, 'user-1', 'company-1'),
    ('preset-shared-overdue', 'Overdue Items', 'Items past their due date', '{"dateRange": {"start": "", "end": ""}}', 'tasks', false, true, 'user-1', 'company-1')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Create partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_filter_presets_active_defaults
    ON filter_presets(created_by, entity_type)
    WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_search_history_recent
    ON search_history(user_id, timestamp DESC)
    WHERE timestamp > NOW() - INTERVAL '30 days';

CREATE INDEX IF NOT EXISTS idx_bulk_operations_active
    ON bulk_operations(created_by, status)
    WHERE status IN ('pending', 'processing');

-- ============================================================================
-- COMPLETE!
-- ============================================================================

-- Migration completed successfully!
-- Next steps:
-- 1. Run this migration on your Supabase database
-- 2. Update your application code to use the new tables
-- 3. Test the filtering functionality