-- CortexBuild Platform - Complete Database Schema
-- Version: 1.0.0 GOLDEN
-- Last Updated: 2025-10-08

-- ============================================
-- CORE TABLES
-- ============================================

-- Users Table (Compatible with database.ts)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL,
    company_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    email_verified BOOLEAN DEFAULT 0,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    industry TEXT,
    size TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    phone TEXT,
    website TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table (Compatible with database.ts)
-- NOTE: This table is created by database.ts, schema kept for reference
-- CREATE TABLE IF NOT EXISTS sessions (
--     id TEXT PRIMARY KEY,
--     user_id TEXT NOT NULL,
--     token TEXT UNIQUE NOT NULL,
--     expires_at DATETIME NOT NULL,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- ============================================
-- PROJECT MANAGEMENT
-- ============================================

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    project_number TEXT UNIQUE,
    status TEXT DEFAULT 'planning' CHECK(status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2) DEFAULT 0,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    client_id INTEGER,
    project_manager_id INTEGER,
    progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
    is_archived BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (project_manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK(status IN ('todo', 'in-progress', 'review', 'completed', 'blocked')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to INTEGER,
    due_date DATE,
    estimated_hours DECIMAL(8, 2),
    actual_hours DECIMAL(8, 2) DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
    parent_task_id INTEGER,
    order_index INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed', 'delayed')),
    progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS project_team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    hourly_rate DECIMAL(10, 2),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(project_id, user_id)
);

-- ============================================
-- CLIENT MANAGEMENT
-- ============================================

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    website TEXT,
    tax_id TEXT,
    payment_terms INTEGER DEFAULT 30,
    credit_limit DECIMAL(15, 2),
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ============================================
-- RFI MANAGEMENT
-- ============================================

-- RFIs Table
CREATE TABLE IF NOT EXISTS rfis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    rfi_number TEXT NOT NULL,
    subject TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'answered', 'closed', 'void')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    submitted_by INTEGER NOT NULL,
    assigned_to INTEGER,
    due_date DATE,
    answered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(project_id, rfi_number)
);

-- ============================================
-- FINANCIAL MANAGEMENT
-- ============================================

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER,
    client_id INTEGER NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    balance DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    terms TEXT,
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Invoice Line Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ============================================
-- TIME TRACKING
-- ============================================

-- Time Entries Table
CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    task_id INTEGER,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration_minutes INTEGER,
    is_billable BOOLEAN DEFAULT 1,
    hourly_rate DECIMAL(10, 2),
    amount DECIMAL(15, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- ============================================
-- SUBCONTRACTOR MANAGEMENT
-- ============================================

-- Subcontractors Table
CREATE TABLE IF NOT EXISTS subcontractors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    trade TEXT,
    license_number TEXT,
    insurance_expiry DATE,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Project Subcontractors (Many-to-Many)
CREATE TABLE IF NOT EXISTS project_subcontractors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    subcontractor_id INTEGER NOT NULL,
    contract_amount DECIMAL(15, 2),
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'terminated')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(id) ON DELETE CASCADE,
    UNIQUE(project_id, subcontractor_id)
);

-- ============================================
-- PURCHASE ORDERS
-- ============================================

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER,
    vendor_id INTEGER,
    po_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'approved', 'received', 'cancelled')),
    issue_date DATE NOT NULL,
    delivery_date DATE,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by INTEGER,
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES subcontractors(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

-- ============================================
-- DOCUMENT MANAGEMENT
-- ============================================

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    project_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    category TEXT CHECK(category IN ('contract', 'drawing', 'photo', 'report', 'invoice', 'other')),
    uploaded_by INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT 0,
    version INTEGER DEFAULT 1,
    parent_document_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_document_id) REFERENCES documents(id) ON DELETE SET NULL
);

-- ============================================
-- ACTIVITY LOG
-- ============================================

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================
-- DEVELOPER PLATFORM
-- ============================================

-- Modules Table (Developer Platform)
CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    developer_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    version TEXT NOT NULL DEFAULT '1.0.0',
    price DECIMAL(10, 2) DEFAULT 0,
    is_free BOOLEAN DEFAULT 1,
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'review', 'published', 'suspended')),
    repository_url TEXT,
    documentation_url TEXT,
    demo_url TEXT,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Module Reviews Table
CREATE TABLE IF NOT EXISTS module_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    review TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(module_id, user_id)
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    key_prefix TEXT NOT NULL,
    permissions TEXT,
    last_used_at DATETIME,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Webhooks Table
CREATE TABLE IF NOT EXISTS webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    events TEXT NOT NULL,
    secret TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    last_triggered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Time entries indexes
CREATE INDEX IF NOT EXISTS idx_time_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_date ON time_entries(start_time);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_project ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);

-- Modules indexes
CREATE INDEX IF NOT EXISTS idx_modules_developer ON modules(developer_id);
CREATE INDEX IF NOT EXISTS idx_modules_status ON modules(status);
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);

