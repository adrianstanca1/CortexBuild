-- Simple Admin Schema Migration
-- Creates admin tables and adds essential columns to existing tables

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

-- Create tenant usage tracking table
CREATE TABLE IF NOT EXISTS tenant_usage (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  usage_date DATE NOT NULL,
  api_calls INT NOT NULL DEFAULT 0,
  storage_used_gb DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  active_users INT NOT NULL DEFAULT 0,
  projects_created INT NOT NULL DEFAULT 0,
  tasks_created INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_date (tenant_id, usage_date),
  INDEX idx_usage_date (usage_date),
  INDEX idx_usage_tenant (tenant_id)
) ENGINE=InnoDB;

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100) NULL,
  tenant_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
  INDEX idx_audit_admin (admin_user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_resource (resource_type, resource_id),
  INDEX idx_audit_tenant (tenant_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- Create system settings table for admin configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  description TEXT NULL,
  is_public TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether setting is visible to tenants',
  updated_by_admin_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by_admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT,
  INDEX idx_setting_key (setting_key),
  INDEX idx_setting_public (is_public)
) ENGINE=InnoDB;

-- Create tenant invitations table
CREATE TABLE IF NOT EXISTS tenant_invitations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(320) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  invitation_token VARCHAR(255) NOT NULL UNIQUE,
  invited_by_admin_id BIGINT UNSIGNED NULL,
  invited_by_user_id BIGINT UNSIGNED NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_invitation_token (invitation_token),
  INDEX idx_invitation_email (email),
  INDEX idx_invitation_tenant (tenant_id),
  INDEX idx_invitation_expires (expires_at)
) ENGINE=InnoDB;

-- Create notification templates table for admin-managed notifications
CREATE TABLE IF NOT EXISTS notification_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_key VARCHAR(100) NOT NULL UNIQUE,
  template_name VARCHAR(200) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT NULL,
  variables JSON NULL COMMENT 'Available template variables',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by_admin_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT,
  INDEX idx_template_key (template_key),
  INDEX idx_template_active (is_active)
) ENGINE=InnoDB;

-- Create system health metrics table
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  metric_unit VARCHAR(20) NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_health_metric_name (metric_name),
  INDEX idx_health_recorded (recorded_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
