-- =====================================================
-- AS Agents Construction Management Database Schema
-- =====================================================
-- This schema creates all tables for the construction management platform
-- Run this in your Supabase SQL Editor
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =====================================================
-- COMPANIES TABLE
-- =====================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- USERS TABLE (extends Supabase Auth)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    permissions TEXT [] DEFAULT ARRAY []::TEXT [],
    avatar_url TEXT,
    phone TEXT,
    position TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    priority TEXT DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15, 2),
    spent DECIMAL(15, 2) DEFAULT 0,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    client_id UUID,
    manager_id UUID REFERENCES users(id),
    progress INTEGER DEFAULT 0,
    health_status TEXT DEFAULT 'on_track',
    tags TEXT [],
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- PROJECT ASSIGNMENTS
-- =====================================================
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(project_id, user_id)
);
-- =====================================================
-- TODOS / TASKS
-- =====================================================
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT [],
    checklist JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- TIME ENTRIES
-- =====================================================
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    description TEXT,
    task_type TEXT,
    billable BOOLEAN DEFAULT TRUE,
    approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- SAFETY INCIDENTS
-- =====================================================
CREATE TABLE safety_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES users(id),
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    severity TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT,
    description TEXT NOT NULL,
    injuries TEXT,
    witnesses TEXT [],
    corrective_actions TEXT,
    status TEXT DEFAULT 'open',
    investigation_notes TEXT,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- EQUIPMENT
-- =====================================================
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    status TEXT DEFAULT 'available',
    purchase_date DATE,
    purchase_cost DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    assigned_to_project UUID REFERENCES projects(id),
    assigned_to_user UUID REFERENCES users(id),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    location TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- CLIENTS
-- =====================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    contact_person TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- INVOICES
-- =====================================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    client_id UUID REFERENCES clients(id),
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    tax DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    status TEXT DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    notes TEXT,
    line_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- EXPENSES
-- =====================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    category TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- SITE UPDATES
-- =====================================================
CREATE TABLE site_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    update_type TEXT DEFAULT 'general',
    attachments TEXT [],
    weather JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- MESSAGES
-- =====================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    title TEXT,
    participants UUID [],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    attachments TEXT [],
    read_by UUID [],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- DOCUMENTS
-- =====================================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    uploaded_by UUID REFERENCES users(id),
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    category TEXT,
    tags TEXT [],
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- AUDIT LOGS
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_todos_project ON todos(project_id);
CREATE INDEX idx_todos_assigned ON todos(assigned_to);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- =====================================================
-- RLS POLICIES
-- =====================================================
-- Users can view users in their company
CREATE POLICY "Users can view company users" ON users FOR
SELECT USING (
        company_id IN (
            SELECT company_id
            FROM users
            WHERE id = auth.uid()
        )
    );
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR
UPDATE USING (id = auth.uid());
-- Projects - Users can view projects in their company
CREATE POLICY "Users can view company projects" ON projects FOR
SELECT USING (
        company_id IN (
            SELECT company_id
            FROM users
            WHERE id = auth.uid()
        )
    );
-- Todos - Users can view todos in their company
CREATE POLICY "Users can view company todos" ON todos FOR
SELECT USING (
        company_id IN (
            SELECT company_id
            FROM users
            WHERE id = auth.uid()
        )
    );
-- Time Entries - Users can manage their own entries
CREATE POLICY "Users can manage own time entries" ON time_entries FOR ALL USING (user_id = auth.uid());
-- Notifications - Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR
UPDATE USING (user_id = auth.uid());
-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE
UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE
UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todos_updated_at BEFORE
UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE
UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_safety_incidents_updated_at BEFORE
UPDATE ON safety_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE
UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================
-- Insert demo company
INSERT INTO companies (id, name, industry, size)
VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Demo Construction Co',
        'Construction',
        'medium'
    );
-- Note: Users will be created via Supabase Auth signup
-- After user signs up, trigger will create entry in users table
-- =====================================================
-- DATABASE SETUP COMPLETE
-- =====================================================
