-- Create missing tables for CortexBuild Platform
-- This script creates all tables that are referenced in code but don't exist in database

-- Activities table (for audit log and activity tracking)
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT,
    project_id INTEGER,
    action TEXT NOT NULL,
    description TEXT,
    entity_type TEXT,
    entity_id TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

