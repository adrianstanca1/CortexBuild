-- Simple Admin Tables Migration
-- Version: 005
-- Description: Create admin users table and enhance tenants table

SET FOREIGN_KEY_CHECKS = 0;

-- Create admin users table (platform-level administrators)
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('super_admin', 'platform_admin', 'support_admin') NOT NULL DEFAULT 'platform_admin',
  permissions JSON NULL COMMENT 'Additional granular permissions',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP NULL,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
  mfa_secret VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_email (email),
  INDEX idx_admin_role (role),
  INDEX idx_admin_active (is_active)
) ENGINE=InnoDB;

-- Add admin audit logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100) NULL,
  tenant_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_audit_admin_id (admin_id),
  INDEX idx_admin_audit_action (action),
  INDEX idx_admin_audit_resource (resource_type, resource_id),
  INDEX idx_admin_audit_tenant (tenant_id),
  INDEX idx_admin_audit_created (created_at),
  CONSTRAINT fk_admin_audit_admin FOREIGN KEY (admin_id) REFERENCES admin_users (id) ON DELETE CASCADE,
  CONSTRAINT fk_admin_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Enhance tenants table with additional columns
ALTER TABLE tenants
ADD COLUMN subscription_status ENUM('trial', 'active', 'suspended', 'cancelled') NOT NULL DEFAULT 'trial',
ADD COLUMN subscription_expires_at TIMESTAMP NULL,
ADD COLUMN max_users INT NOT NULL DEFAULT 10,
ADD COLUMN max_projects INT NOT NULL DEFAULT 5,
ADD COLUMN max_storage_gb DECIMAL(10,2) NOT NULL DEFAULT 1.0,
ADD COLUMN current_users INT NOT NULL DEFAULT 0,
ADD COLUMN current_projects INT NOT NULL DEFAULT 0,
ADD COLUMN current_storage_gb DECIMAL(10,2) NOT NULL DEFAULT 0.0,
ADD COLUMN admin_notes TEXT NULL,
ADD COLUMN created_by_admin_id BIGINT UNSIGNED NULL,
ADD COLUMN last_activity_at TIMESTAMP NULL;

-- Add indexes for tenant table
ALTER TABLE tenants
ADD INDEX idx_tenant_subscription (subscription_status),
ADD INDEX idx_tenant_plan (plan),
ADD INDEX idx_tenant_active (is_active),
ADD INDEX idx_tenant_created_by (created_by_admin_id);

-- Enhance companies table with storage tracking
ALTER TABLE companies
ADD COLUMN storage_usage_gb DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN max_users INT NOT NULL DEFAULT 10,
ADD COLUMN status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active';

-- Create tenant usage tracking table
CREATE TABLE IF NOT EXISTS tenant_usage (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  usage_date DATE NOT NULL,
  api_calls INT NOT NULL DEFAULT 0,
  storage_used_gb DECIMAL(10,2) NOT NULL DEFAULT 0,
  active_users INT NOT NULL DEFAULT 0,
  projects_created INT NOT NULL DEFAULT 0,
  tasks_created INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tenant_usage_date (tenant_id, usage_date),
  INDEX idx_tenant_usage_tenant (tenant_id),
  INDEX idx_tenant_usage_date (usage_date),
  CONSTRAINT fk_tenant_usage_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
