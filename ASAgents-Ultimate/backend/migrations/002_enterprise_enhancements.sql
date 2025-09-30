-- Enterprise Database Migration Script
-- Run this migration to enhance existing schema with enterprise features

-- Step 1: Add tenant support to existing tables
ALTER TABLE companies ADD COLUMN tenant_id TEXT;
ALTER TABLE users ADD COLUMN tenant_id TEXT;
ALTER TABLE projects ADD COLUMN tenant_id TEXT;
ALTER TABLE tasks ADD COLUMN tenant_id TEXT;
ALTER TABLE documents ADD COLUMN tenant_id TEXT;
ALTER TABLE expenses ADD COLUMN tenant_id TEXT;

-- Step 2: Add enhanced user fields
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN last_login DATETIME;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}'; -- JSON as TEXT for SQLite

-- Step 3: Add project enhancements
ALTER TABLE projects ADD COLUMN project_code TEXT;
ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'commercial';
ALTER TABLE projects ADD COLUMN priority TEXT DEFAULT 'medium';
ALTER TABLE projects ADD COLUMN progress_percentage DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE projects ADD COLUMN budget_approved DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN budget_spent DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE projects ADD COLUMN custom_fields TEXT DEFAULT '{}';

-- Step 4: Add task enhancements
ALTER TABLE tasks ADD COLUMN task_code TEXT;
ALTER TABLE tasks ADD COLUMN parent_task_id TEXT;
ALTER TABLE tasks ADD COLUMN estimated_hours DECIMAL(8,2);
ALTER TABLE tasks ADD COLUMN actual_hours DECIMAL(8,2) DEFAULT 0.00;
ALTER TABLE tasks ADD COLUMN progress_percentage DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE tasks ADD COLUMN custom_fields TEXT DEFAULT '{}';

-- Step 5: Add document enhancements
ALTER TABLE documents ADD COLUMN category_id TEXT;
ALTER TABLE documents ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE documents ADD COLUMN workflow_status TEXT DEFAULT 'draft';
ALTER TABLE documents ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE documents ADD COLUMN metadata TEXT DEFAULT '{}';

-- Step 6: Add expense enhancements
ALTER TABLE expenses ADD COLUMN expense_code TEXT;
ALTER TABLE expenses ADD COLUMN approval_status TEXT DEFAULT 'pending';
ALTER TABLE expenses ADD COLUMN approved_by TEXT;
ALTER TABLE expenses ADD COLUMN approved_at DATETIME;
ALTER TABLE expenses ADD COLUMN budget_line_item TEXT;