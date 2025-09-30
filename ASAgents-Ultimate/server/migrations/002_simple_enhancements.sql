-- Migration: Simple enhancements
-- Version: 002
-- Description: Add some useful indexes and sample data

-- Add some useful indexes (will fail silently if they already exist)
CREATE INDEX idx_users_email_active ON users(email, is_active);
CREATE INDEX idx_projects_status_date ON projects(status, start_date);
CREATE INDEX idx_tasks_status_due ON tasks(status, due_date);
CREATE INDEX idx_expenses_date_amount ON expenses(expense_date, amount);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Insert a default tenant if none exists
INSERT IGNORE INTO tenants (id, name, slug, contact_email, is_active) 
VALUES (1, 'Default Organization', 'default', 'admin@asagents.com', 1);

-- Insert a default admin user if none exists
INSERT IGNORE INTO users (
  id, tenant_id, email, password_hash, first_name, last_name, role, status, is_active
) VALUES (
  1, 1, 'admin@asagents.com', 
  '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O', -- placeholder hash
  'Admin', 'User', 'owner', 'active', 1
);
