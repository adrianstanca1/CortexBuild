-- Migration: Add Foreign Key Constraints
-- Version: 001
-- Description: Add foreign key constraints after all tables are created

-- Add foreign key constraints to users table
ALTER TABLE users 
ADD CONSTRAINT fk_users_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE;

-- Add foreign key constraints to companies table
ALTER TABLE companies 
ADD CONSTRAINT fk_companies_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE;

-- Add foreign key constraints to projects table
ALTER TABLE projects 
ADD CONSTRAINT fk_projects_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_projects_owner 
FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE RESTRICT,
ADD CONSTRAINT fk_projects_company 
FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE SET NULL;

-- Add foreign key constraints to tasks table
ALTER TABLE tasks 
ADD CONSTRAINT fk_tasks_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_tasks_project 
FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_tasks_assigned_to 
FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
ADD CONSTRAINT fk_tasks_created_by 
FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT;

-- Add foreign key constraints to expenses table
ALTER TABLE expenses 
ADD CONSTRAINT fk_expenses_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_expenses_project 
FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_expenses_user 
FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
ADD CONSTRAINT fk_expenses_approved_by 
FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL;

-- Add foreign key constraints to documents table
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_documents_project 
FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_documents_uploaded_by 
FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE RESTRICT;

-- Add foreign key constraints to invoices table
ALTER TABLE invoices 
ADD CONSTRAINT fk_invoices_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_invoices_project 
FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_invoices_company 
FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE RESTRICT;

-- Add foreign key constraints to notifications table
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_notifications_user 
FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

-- Add foreign key constraints to audit_logs table
ALTER TABLE audit_logs 
ADD CONSTRAINT fk_audit_logs_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_audit_logs_user 
FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL;

-- Add foreign key constraints to user_sessions table
ALTER TABLE user_sessions 
ADD CONSTRAINT fk_user_sessions_user 
FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

-- Add foreign key constraints to invoice_line_items table
ALTER TABLE invoice_line_items 
ADD CONSTRAINT fk_invoice_line_items_invoice 
FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_users_tenant_id ON users (tenant_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);

CREATE INDEX idx_projects_tenant_id ON projects (tenant_id);
CREATE INDEX idx_projects_owner_id ON projects (owner_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_code ON projects (code);

CREATE INDEX idx_tasks_tenant_id ON tasks (tenant_id);
CREATE INDEX idx_tasks_project_id ON tasks (project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks (assigned_to);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_due_date ON tasks (due_date);

CREATE INDEX idx_expenses_tenant_id ON expenses (tenant_id);
CREATE INDEX idx_expenses_project_id ON expenses (project_id);
CREATE INDEX idx_expenses_user_id ON expenses (user_id);
CREATE INDEX idx_expenses_status ON expenses (status);
CREATE INDEX idx_expenses_expense_date ON expenses (expense_date);

CREATE INDEX idx_documents_tenant_id ON documents (tenant_id);
CREATE INDEX idx_documents_project_id ON documents (project_id);
CREATE INDEX idx_documents_uploaded_by ON documents (uploaded_by);
CREATE INDEX idx_documents_category ON documents (category);

CREATE INDEX idx_invoices_tenant_id ON invoices (tenant_id);
CREATE INDEX idx_invoices_project_id ON invoices (project_id);
CREATE INDEX idx_invoices_company_id ON invoices (company_id);
CREATE INDEX idx_invoices_status ON invoices (status);
CREATE INDEX idx_invoices_due_date ON invoices (due_date);

CREATE INDEX idx_notifications_tenant_id ON notifications (tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);
CREATE INDEX idx_notifications_created_at ON notifications (created_at);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs (tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs (table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);

CREATE INDEX idx_user_sessions_user_id ON user_sessions (user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions (session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions (expires_at);
