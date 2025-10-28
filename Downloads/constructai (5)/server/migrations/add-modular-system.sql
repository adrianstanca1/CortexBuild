-- CortexBuild Modular System Migration
-- Adds tables for widget-based dashboard, module installations, and marketplace

-- 1. Module Installations (per company)
CREATE TABLE IF NOT EXISTS module_installations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    config TEXT, -- JSON configuration
    is_active INTEGER DEFAULT 1,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE(company_id, module_id)
);

-- 2. User Dashboards (custom layouts per user)
CREATE TABLE IF NOT EXISTS user_dashboards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'My Dashboard',
    layout TEXT NOT NULL, -- JSON grid layout
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Dashboard Widgets (individual widgets on dashboards)
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dashboard_id INTEGER NOT NULL,
    widget_type TEXT NOT NULL, -- 'stats', 'chart', 'table', 'form', 'custom'
    module_id INTEGER, -- NULL for core widgets
    title TEXT NOT NULL,
    config TEXT, -- JSON widget configuration
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 4,
    height INTEGER NOT NULL DEFAULT 2,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dashboard_id) REFERENCES user_dashboards(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL
);

-- 4. Module Permissions (role-based access)
CREATE TABLE IF NOT EXISTS module_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    role TEXT NOT NULL, -- 'super_admin', 'admin', 'manager', 'user'
    can_install INTEGER DEFAULT 0,
    can_configure INTEGER DEFAULT 0,
    can_use INTEGER DEFAULT 1,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE(module_id, role)
);

-- 5. Module Dependencies
CREATE TABLE IF NOT EXISTS module_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    depends_on_module_id INTEGER NOT NULL,
    min_version TEXT,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE(module_id, depends_on_module_id)
);

-- 6. Smart Tools (automation & workflows)
CREATE TABLE IF NOT EXISTS smart_tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    module_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    tool_type TEXT NOT NULL, -- 'scheduled', 'webhook', 'workflow'
    config TEXT NOT NULL, -- JSON configuration
    schedule TEXT, -- Cron expression for scheduled tools
    is_active INTEGER DEFAULT 1,
    last_run_at DATETIME,
    next_run_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL
);

-- 7. Smart Tool Executions (log of tool runs)
CREATE TABLE IF NOT EXISTS smart_tool_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'success', 'failed', 'running'
    input_data TEXT, -- JSON input
    output_data TEXT, -- JSON output
    error_message TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (tool_id) REFERENCES smart_tools(id) ON DELETE CASCADE
);

-- 8. Module Marketplace Categories
CREATE TABLE IF NOT EXISTS module_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Insert default categories
INSERT OR IGNORE INTO module_categories (name, slug, description, icon, sort_order) VALUES
('Analytics', 'analytics', 'Data visualization and reporting tools', 'BarChart3', 1),
('Automation', 'automation', 'Workflow automation and smart tools', 'Zap', 2),
('Communication', 'communication', 'Team collaboration and messaging', 'MessageSquare', 3),
('Finance', 'finance', 'Invoicing, payments, and accounting', 'DollarSign', 4),
('Project Management', 'project-management', 'Task tracking and project tools', 'FolderOpen', 5),
('Integrations', 'integrations', 'Third-party service connections', 'Link', 6),
('Utilities', 'utilities', 'Helper tools and widgets', 'Tool', 7),
('Custom', 'custom', 'Custom company-specific modules', 'Code', 8);

-- 9. Widget Templates (reusable widget configurations)
CREATE TABLE IF NOT EXISTS widget_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    widget_type TEXT NOT NULL,
    description TEXT,
    config TEXT NOT NULL, -- JSON default configuration
    preview_image TEXT,
    is_public INTEGER DEFAULT 1,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default widget templates
INSERT OR IGNORE INTO widget_templates (name, widget_type, description, config) VALUES
('Revenue Chart', 'chart', 'Monthly revenue line chart', '{"chartType":"line","dataSource":"invoices","metric":"total_amount","groupBy":"month"}'),
('Active Projects', 'stats', 'Count of active projects', '{"dataSource":"projects","metric":"count","filter":"is_active=1"}'),
('Recent Clients', 'table', 'List of recently added clients', '{"dataSource":"clients","columns":["name","email","created_at"],"limit":10,"orderBy":"created_at DESC"}'),
('Quick Invoice', 'form', 'Create invoice quickly', '{"formType":"invoice","fields":["client_id","amount","due_date"]}');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_installations_company ON module_installations(company_id);
CREATE INDEX IF NOT EXISTS idx_module_installations_module ON module_installations(module_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboards_user ON user_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_smart_tools_company ON smart_tools(company_id);
CREATE INDEX IF NOT EXISTS idx_smart_tools_next_run ON smart_tools(next_run_at) WHERE is_active = 1;
CREATE INDEX IF NOT EXISTS idx_module_permissions_module ON module_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_module_dependencies_module ON module_dependencies(module_id);

