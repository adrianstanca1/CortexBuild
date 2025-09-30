-- Enterprise Database Schema Evolution
-- Advanced features for construction management platform

-- Enable foreign key constraints and WAL mode for better performance
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;

-- ========================================
-- ENTERPRISE SECURITY & MULTI-TENANCY
-- ========================================

-- Tenants table for multi-tenancy
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    subscription_type TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_type IN ('basic', 'professional', 'enterprise')),
    max_users INTEGER DEFAULT 10,
    max_projects INTEGER DEFAULT 50,
    storage_limit_gb INTEGER DEFAULT 10,
    features JSON DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced companies table with tenant support
ALTER TABLE companies ADD COLUMN tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE companies ADD COLUMN subscription_expires DATETIME;
ALTER TABLE companies ADD COLUMN compliance_certifications JSON DEFAULT '[]';
ALTER TABLE companies ADD COLUMN industry_codes JSON DEFAULT '[]';
ALTER TABLE companies ADD COLUMN tax_id TEXT;
ALTER TABLE companies ADD COLUMN insurance_info JSON DEFAULT '{}';

-- Role definitions with granular permissions
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    permissions JSON NOT NULL DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, name)
);

-- User roles assignment (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    assigned_by TEXT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- Enhanced users table
ALTER TABLE users ADD COLUMN tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN last_login DATETIME;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until DATETIME;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_expires DATETIME;
ALTER TABLE users ADD COLUMN preferences JSON DEFAULT '{}';

-- ========================================
-- DOCUMENT MANAGEMENT & WORKFLOW
-- ========================================

-- Document categories and templates
CREATE TABLE IF NOT EXISTS document_categories (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_id TEXT,
    workflow_template_id TEXT,
    retention_policy JSON DEFAULT '{}',
    access_level TEXT DEFAULT 'private' CHECK (access_level IN ('private', 'team', 'project', 'company')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES document_categories(id) ON DELETE SET NULL
);

-- Enhanced documents table
ALTER TABLE documents ADD COLUMN tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE documents ADD COLUMN category_id TEXT REFERENCES document_categories(id);
ALTER TABLE documents ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE documents ADD COLUMN parent_document_id TEXT REFERENCES documents(id);
ALTER TABLE documents ADD COLUMN workflow_status TEXT DEFAULT 'draft';
ALTER TABLE documents ADD COLUMN workflow_step INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN approval_required BOOLEAN DEFAULT 0;
ALTER TABLE documents ADD COLUMN approved_by TEXT REFERENCES users(id);
ALTER TABLE documents ADD COLUMN approved_at DATETIME;
ALTER TABLE documents ADD COLUMN expires_at DATETIME;
ALTER TABLE documents ADD COLUMN tags JSON DEFAULT '[]';
ALTER TABLE documents ADD COLUMN metadata JSON DEFAULT '{}';
ALTER TABLE documents ADD COLUMN checksum TEXT;
ALTER TABLE documents ADD COLUMN access_level TEXT DEFAULT 'private' CHECK (access_level IN ('private', 'team', 'project', 'company', 'public'));

-- Document permissions
CREATE TABLE IF NOT EXISTS document_permissions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    user_id TEXT,
    role_id TEXT,
    permission_type TEXT NOT NULL CHECK (permission_type IN ('read', 'write', 'delete', 'approve')),
    granted_by TEXT NOT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id)
);

-- Document workflows
CREATE TABLE IF NOT EXISTS workflow_templates (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    steps JSON NOT NULL DEFAULT '[]',
    auto_assign_rules JSON DEFAULT '{}',
    notification_settings JSON DEFAULT '{}',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Document workflow instances
CREATE TABLE IF NOT EXISTS document_workflows (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    workflow_template_id TEXT NOT NULL,
    current_step INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'cancelled')),
    assigned_to TEXT,
    due_date DATETIME,
    completed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_template_id) REFERENCES workflow_templates(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- ========================================
-- PROJECT MANAGEMENT ENHANCEMENTS
-- ========================================

-- Enhanced projects table
ALTER TABLE projects ADD COLUMN tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE projects ADD COLUMN project_code TEXT;
ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'commercial' CHECK (project_type IN ('residential', 'commercial', 'industrial', 'infrastructure'));
ALTER TABLE projects ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE projects ADD COLUMN progress_percentage DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE projects ADD COLUMN budget_approved DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN budget_spent DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE projects ADD COLUMN risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high'));
ALTER TABLE projects ADD COLUMN weather_dependent BOOLEAN DEFAULT 1;
ALTER TABLE projects ADD COLUMN permits_required JSON DEFAULT '[]';
ALTER TABLE projects ADD COLUMN milestones JSON DEFAULT '[]';
ALTER TABLE projects ADD COLUMN custom_fields JSON DEFAULT '{}';
ALTER TABLE projects ADD COLUMN archived_at DATETIME;

-- Project templates
CREATE TABLE IF NOT EXISTS project_templates (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT NOT NULL,
    default_duration_days INTEGER,
    task_templates JSON DEFAULT '[]',
    milestone_templates JSON DEFAULT '[]',
    required_roles JSON DEFAULT '[]',
    document_categories JSON DEFAULT '[]',
    custom_fields_schema JSON DEFAULT '{}',
    is_public BOOLEAN DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Enhanced tasks table
ALTER TABLE tasks ADD COLUMN tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE tasks ADD COLUMN task_code TEXT;
ALTER TABLE tasks ADD COLUMN parent_task_id TEXT REFERENCES tasks(id);
ALTER TABLE tasks ADD COLUMN task_type TEXT DEFAULT 'standard' CHECK (task_type IN ('standard', 'milestone', 'inspection', 'approval'));
ALTER TABLE tasks ADD COLUMN estimated_hours DECIMAL(8,2);
ALTER TABLE tasks ADD COLUMN actual_hours DECIMAL(8,2) DEFAULT 0.00;
ALTER TABLE tasks ADD COLUMN progress_percentage DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE tasks ADD COLUMN dependencies JSON DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN prerequisites JSON DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN weather_dependent BOOLEAN DEFAULT 0;
ALTER TABLE tasks ADD COLUMN location_coordinates TEXT;
ALTER TABLE tasks ADD COLUMN safety_requirements JSON DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN quality_checkpoints JSON DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN custom_fields JSON DEFAULT '{}';

-- Task dependencies
CREATE TABLE IF NOT EXISTS task_dependencies (
    id TEXT PRIMARY KEY,
    predecessor_task_id TEXT NOT NULL,
    successor_task_id TEXT NOT NULL,
    dependency_type TEXT DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    lag_days INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (predecessor_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (successor_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(predecessor_task_id, successor_task_id)
);

-- ========================================
-- QUALITY MANAGEMENT
-- ========================================

-- Quality control checklists
CREATE TABLE IF NOT EXISTS quality_checklists (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT,
    task_type TEXT,
    checklist_items JSON NOT NULL DEFAULT '[]',
    is_mandatory BOOLEAN DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Quality inspections
CREATE TABLE IF NOT EXISTS quality_inspections (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    task_id TEXT,
    checklist_id TEXT NOT NULL,
    inspector_id TEXT NOT NULL,
    inspection_date DATETIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'conditional')),
    score DECIMAL(5,2),
    checklist_responses JSON DEFAULT '{}',
    issues_found JSON DEFAULT '[]',
    corrective_actions JSON DEFAULT '[]',
    photos JSON DEFAULT '[]',
    notes TEXT,
    approved_by TEXT,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (checklist_id) REFERENCES quality_checklists(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ========================================
-- FINANCIAL MANAGEMENT ENHANCEMENTS
-- ========================================

-- Enhanced expenses table
ALTER TABLE expenses ADD COLUMN tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE expenses ADD COLUMN expense_code TEXT;
ALTER TABLE expenses ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE expenses ADD COLUMN approved_by TEXT REFERENCES users(id);
ALTER TABLE expenses ADD COLUMN approved_at DATETIME;
ALTER TABLE expenses ADD COLUMN budget_line_item TEXT;
ALTER TABLE expenses ADD COLUMN purchase_order_number TEXT;
ALTER TABLE expenses ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE expenses ADD COLUMN currency TEXT DEFAULT 'USD';
ALTER TABLE expenses ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.000000;
ALTER TABLE expenses ADD COLUMN payment_method TEXT;
ALTER TABLE expenses ADD COLUMN payment_reference TEXT;

-- Budget tracking
CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    category TEXT NOT NULL,
    allocated_amount DECIMAL(12,2) NOT NULL,
    spent_amount DECIMAL(12,2) DEFAULT 0.00,
    committed_amount DECIMAL(12,2) DEFAULT 0.00,
    remaining_amount DECIMAL(12,2) GENERATED ALWAYS AS (allocated_amount - spent_amount - committed_amount) STORED,
    fiscal_year INTEGER,
    quarter INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(project_id, category, fiscal_year, quarter)
);

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    project_id TEXT,
    po_number TEXT NOT NULL,
    vendor_id TEXT,
    vendor_name TEXT NOT NULL,
    vendor_contact TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'received', 'cancelled')),
    total_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    payment_terms TEXT,
    delivery_date DATE,
    delivery_address TEXT,
    notes TEXT,
    approved_by TEXT,
    approved_at DATETIME,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(tenant_id, po_number)
);

-- Purchase order items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id TEXT PRIMARY KEY,
    purchase_order_id TEXT NOT NULL,
    item_description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    unit_of_measure TEXT DEFAULT 'each',
    delivery_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

-- ========================================
-- REPORTING & ANALYTICS
-- ========================================

-- Report templates
CREATE TABLE IF NOT EXISTS report_templates (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL CHECK (report_type IN ('project_status', 'financial', 'safety', 'quality', 'resource_utilization', 'custom')),
    query_config JSON NOT NULL DEFAULT '{}',
    chart_config JSON DEFAULT '{}',
    filters_schema JSON DEFAULT '{}',
    schedule_config JSON DEFAULT '{}',
    recipients JSON DEFAULT '[]',
    is_public BOOLEAN DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Report instances
CREATE TABLE IF NOT EXISTS report_instances (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    parameters JSON DEFAULT '{}',
    data JSON,
    file_url TEXT,
    status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (template_id) REFERENCES report_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- ========================================
-- COMMUNICATION & COLLABORATION
-- ========================================

-- Discussion threads
CREATE TABLE IF NOT EXISTS discussions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    project_id TEXT,
    task_id TEXT,
    document_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Discussion messages
CREATE TABLE IF NOT EXISTS discussion_messages (
    id TEXT PRIMARY KEY,
    discussion_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    attachments JSON DEFAULT '[]',
    reply_to_id TEXT,
    edited_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (reply_to_id) REFERENCES discussion_messages(id) ON DELETE SET NULL
);

-- ========================================
-- SYSTEM CONFIGURATION
-- ========================================

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSON,
    description TEXT,
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, category, key)
);

-- API tokens for integrations
CREATE TABLE IF NOT EXISTS api_tokens (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    permissions JSON DEFAULT '[]',
    expires_at DATETIME,
    last_used_at DATETIME,
    is_active BOOLEAN DEFAULT 1,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ========================================
-- ENHANCED INDEXES FOR PERFORMANCE
-- ========================================

-- Tenant-based indexes
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);

-- Role and permission indexes
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Document workflow indexes
CREATE INDEX IF NOT EXISTS idx_document_workflows_document_id ON document_workflows(document_id);
CREATE INDEX IF NOT EXISTS idx_document_workflows_status ON document_workflows(status);
CREATE INDEX IF NOT EXISTS idx_document_workflows_assigned_to ON document_workflows(assigned_to);

-- Quality management indexes
CREATE INDEX IF NOT EXISTS idx_quality_inspections_project_id ON quality_inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_status ON quality_inspections(status);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_inspector_id ON quality_inspections(inspector_id);

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_budgets_project_id ON budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id ON purchase_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_project_id ON purchase_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

-- Communication indexes
CREATE INDEX IF NOT EXISTS idx_discussions_project_id ON discussions(project_id);
CREATE INDEX IF NOT EXISTS idx_discussions_status ON discussions(status);
CREATE INDEX IF NOT EXISTS idx_discussion_messages_discussion_id ON discussion_messages(discussion_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_progress_percentage ON projects(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_tasks_progress_percentage ON tasks(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_documents_expires_at ON documents(expires_at);

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- Project dashboard view
CREATE VIEW IF NOT EXISTS project_dashboard AS
SELECT 
    p.id,
    p.name,
    p.status,
    p.progress_percentage,
    p.budget_approved,
    p.budget_spent,
    p.start_date,
    p.end_date,
    p.manager_id,
    u.first_name || ' ' || u.last_name as manager_name,
    c.name as client_name,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
    (SELECT COUNT(*) FROM safety_incidents WHERE project_id = p.id AND status = 'open') as open_incidents
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN companies c ON p.client_id = c.id;

-- Task progress view
CREATE VIEW IF NOT EXISTS task_progress AS
SELECT 
    t.id,
    t.title,
    t.status,
    t.progress_percentage,
    t.estimated_hours,
    t.actual_hours,
    t.project_id,
    p.name as project_name,
    t.assigned_to,
    u.first_name || ' ' || u.last_name as assignee_name,
    (SELECT SUM(hours_worked) FROM time_entries WHERE task_id = t.id) as logged_hours
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN users u ON t.assigned_to = u.id;

-- Financial summary view
CREATE VIEW IF NOT EXISTS financial_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.budget_approved,
    COALESCE(SUM(e.amount), 0) as total_expenses,
    p.budget_approved - COALESCE(SUM(e.amount), 0) as remaining_budget,
    COUNT(e.id) as expense_count
FROM projects p
LEFT JOIN expenses e ON p.id = e.project_id
GROUP BY p.id, p.name, p.budget_approved;