-- Migration: Simple Auth0 Registration System
-- Description: Creates minimal tables for Auth0 integration and user profiles

-- Add settings column to existing tenants table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'asagents_db'
     AND TABLE_NAME = 'tenants'
     AND COLUMN_NAME = 'settings') = 0,
    'ALTER TABLE tenants ADD COLUMN settings JSON',
    'SELECT "settings column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add owner_id column to existing tenants table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'asagents_db'
     AND TABLE_NAME = 'tenants'
     AND COLUMN_NAME = 'owner_id') = 0,
    'ALTER TABLE tenants ADD COLUMN owner_id VARCHAR(255)',
    'SELECT "owner_id column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create user_profiles table for Auth0 users
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    auth0_id VARCHAR(255) NOT NULL UNIQUE,
    tenant_id BIGINT UNSIGNED,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    INDEX idx_user_auth0 (auth0_id),
    INDEX idx_user_email (email),
    INDEX idx_user_tenant (tenant_id),
    INDEX idx_user_role (role),
    INDEX idx_user_active (is_active)
);

-- Create tenant_roles table for role-based access control
CREATE TABLE IF NOT EXISTS tenant_roles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    permissions JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_role (tenant_id, name),
    INDEX idx_tenant_role (tenant_id, name)
);

-- Create tenant_settings table for tenant-specific configurations
CREATE TABLE IF NOT EXISTS tenant_settings (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT UNSIGNED NOT NULL UNIQUE,
    settings JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create auth_sessions table for session management
CREATE TABLE IF NOT EXISTS auth_sessions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_profile_id BIGINT UNSIGNED NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    auth0_access_token TEXT,
    auth0_refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_session_user (user_profile_id),
    INDEX idx_session_expires (expires_at),
    INDEX idx_session_active (is_active)
);

-- Create audit_logs table for security and compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_profile_id BIGINT UNSIGNED,
    tenant_id BIGINT UNSIGNED,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_profile_id),
    INDEX idx_audit_tenant (tenant_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_resource (resource_type, resource_id),
    INDEX idx_audit_created (created_at)
);

-- Insert default settings for existing tenants that don't have settings
UPDATE tenants 
SET settings = JSON_OBJECT(
    'industry', 'construction',
    'companySize', 'small',
    'country', 'UK',
    'timezone', 'Europe/London',
    'currency', 'GBP'
)
WHERE settings IS NULL;

-- Get the first tenant ID for default roles
SET @first_tenant_id = (SELECT id FROM tenants ORDER BY id LIMIT 1);

-- Create default roles for the first tenant if they don't exist
INSERT IGNORE INTO tenant_roles (tenant_id, name, permissions, created_at, updated_at)
VALUES 
    (@first_tenant_id, 'admin', JSON_ARRAY('*'), NOW(), NOW()),
    (@first_tenant_id, 'manager', JSON_ARRAY('read:projects', 'write:projects', 'read:users', 'read:reports'), NOW(), NOW()),
    (@first_tenant_id, 'user', JSON_ARRAY('read:projects', 'write:projects'), NOW(), NOW());

-- Create default settings for the first tenant if they don't exist
INSERT IGNORE INTO tenant_settings (tenant_id, settings, created_at, updated_at)
VALUES (
    @first_tenant_id,
    JSON_OBJECT(
        'features', JSON_OBJECT(
            'projects', true,
            'invoicing', true,
            'timeTracking', true,
            'reporting', true
        ),
        'limits', JSON_OBJECT(
            'users', 10,
            'projects', 50,
            'storage', 1024
        ),
        'branding', JSON_OBJECT(
            'logo', null,
            'primaryColor', '#3b82f6',
            'secondaryColor', '#64748b'
        )
    ),
    NOW(),
    NOW()
);

-- Add indexes for better performance on existing tables (ignore errors if they exist)
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX idx_projects_tenant_status ON projects(tenant_id, status);

COMMIT;
