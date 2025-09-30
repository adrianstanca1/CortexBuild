-- Migration: Auth0 Registration and User Profile System
-- Description: Creates tables for Auth0 integration, user profiles, and enhanced tenant management

-- Create tenants table for multitenant support
CREATE TABLE IF NOT EXISTS tenants (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    plan ENUM('free', 'growth', 'enterprise') NOT NULL DEFAULT 'free',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    settings JSON,
    owner_id VARCHAR(255), -- Auth0 user ID of the tenant owner
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_slug (slug),
    INDEX idx_tenant_plan (plan),
    INDEX idx_tenant_active (is_active),
    INDEX idx_tenant_owner (owner_id)
);

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

-- Create user_tenant_roles table for user role assignments within tenants
CREATE TABLE IF NOT EXISTS user_tenant_roles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_profile_id BIGINT UNSIGNED NOT NULL,
    tenant_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT UNSIGNED,
    
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES tenant_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES user_profiles(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_tenant_role (user_profile_id, tenant_id, role_id),
    INDEX idx_user_tenant (user_profile_id, tenant_id)
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

-- Create email_verifications table for email verification tracking
CREATE TABLE IF NOT EXISTS email_verifications (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_profile_id BIGINT UNSIGNED NOT NULL,
    email VARCHAR(255) NOT NULL,
    verification_token VARCHAR(255) NOT NULL UNIQUE,
    verified_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    INDEX idx_verification_token (verification_token),
    INDEX idx_verification_user (user_profile_id),
    INDEX idx_verification_expires (expires_at)
);

-- Insert default tenant for existing users (only if tenants table exists and is empty)
INSERT IGNORE INTO tenants (name, slug, plan, settings, created_at, updated_at)
SELECT
    'Default Organization',
    'default-org',
    'free',
    JSON_OBJECT(
        'industry', 'construction',
        'companySize', 'small',
        'country', 'UK',
        'timezone', 'Europe/London',
        'currency', 'GBP'
    ),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'default-org');

-- Get the default tenant ID
SET @default_tenant_id = COALESCE((SELECT id FROM tenants WHERE slug = 'default-org' LIMIT 1), 1);

-- Create default roles for the default tenant
INSERT IGNORE INTO tenant_roles (tenant_id, name, permissions, created_at, updated_at)
VALUES 
    (@default_tenant_id, 'admin', JSON_ARRAY('*'), NOW(), NOW()),
    (@default_tenant_id, 'manager', JSON_ARRAY('read:projects', 'write:projects', 'read:users', 'read:reports'), NOW(), NOW()),
    (@default_tenant_id, 'user', JSON_ARRAY('read:projects', 'write:projects'), NOW(), NOW());

-- Create default settings for the default tenant
INSERT IGNORE INTO tenant_settings (tenant_id, settings, created_at, updated_at)
VALUES (
    @default_tenant_id,
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_status ON projects(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON invoices(tenant_id, status);

-- Update existing users to have the default tenant
UPDATE users 
SET tenant_id = @default_tenant_id 
WHERE tenant_id IS NULL OR tenant_id = 0;

COMMIT;
