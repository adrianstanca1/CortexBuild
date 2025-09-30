-- Enhanced Admin and Multitenant Schema
-- Version: 001
-- Description: Create admin users, enhanced multitenant structure, and RBAC system

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

-- Enhanced tenants table with additional admin fields
-- Check and add columns only if they don't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'subscription_status') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN subscription_status ENUM(\'trial\', \'active\', \'suspended\', \'cancelled\') NOT NULL DEFAULT \'trial\''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'subscription_expires_at') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN subscription_expires_at TIMESTAMP NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'max_users') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN max_users INT NOT NULL DEFAULT 5'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'max_projects') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN max_projects INT NOT NULL DEFAULT 3'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'max_storage_gb') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN max_storage_gb INT NOT NULL DEFAULT 1'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'current_users') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN current_users INT NOT NULL DEFAULT 0'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'current_projects') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN current_projects INT NOT NULL DEFAULT 0'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'current_storage_gb') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN current_storage_gb DECIMAL(10,2) NOT NULL DEFAULT 0.00'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'admin_notes') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN admin_notes TEXT NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'created_by_admin_id') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN created_by_admin_id BIGINT UNSIGNED NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'tenants'
   AND table_schema = DATABASE()
   AND column_name = 'last_activity_at') > 0,
  'SELECT 1',
  'ALTER TABLE tenants ADD COLUMN last_activity_at TIMESTAMP NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for admin who created the tenant
ALTER TABLE tenants ADD CONSTRAINT fk_tenant_created_by_admin 
  FOREIGN KEY (created_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL;

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

-- Enhanced users table with admin tracking
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'users'
   AND table_schema = DATABASE()
   AND column_name = 'created_by_admin_id') > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN created_by_admin_id BIGINT UNSIGNED NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'users'
   AND table_schema = DATABASE()
   AND column_name = 'last_activity_at') > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN last_activity_at TIMESTAMP NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = 'users'
   AND table_schema = DATABASE()
   AND column_name = 'login_count') > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN login_count INT NOT NULL DEFAULT 0'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for admin who created the user
ALTER TABLE users ADD CONSTRAINT fk_user_created_by_admin 
  FOREIGN KEY (created_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL;

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

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public, updated_by_admin_id) VALUES
('platform_name', '"ASAgents Platform"', 'Platform display name', 1, 1),
('max_file_upload_mb', '50', 'Maximum file upload size in MB', 1, 1),
('session_timeout_minutes', '480', 'User session timeout in minutes', 0, 1),
('maintenance_mode', 'false', 'Platform maintenance mode status', 1, 1),
('registration_enabled', 'true', 'Whether new tenant registration is enabled', 1, 1),
('default_tenant_plan', '"growth"', 'Default plan for new tenants', 0, 1)
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Insert default notification templates
INSERT INTO notification_templates (template_key, template_name, subject, body_text, variables, created_by_admin_id) VALUES
('tenant_welcome', 'Tenant Welcome Email', 'Welcome to ASAgents Platform', 'Welcome {{tenant_name}} to the ASAgents Platform! Your account has been created successfully.', '["tenant_name", "admin_email", "login_url"]', 1),
('user_invitation', 'User Invitation Email', 'You have been invited to join {{tenant_name}}', 'You have been invited to join {{tenant_name}} on the ASAgents Platform. Click the link to accept: {{invitation_url}}', '["tenant_name", "invitation_url", "inviter_name"]', 1),
('password_reset', 'Password Reset Email', 'Reset your ASAgents password', 'Click the following link to reset your password: {{reset_url}}. This link expires in 24 hours.', '["reset_url", "user_name"]', 1)
ON DUPLICATE KEY UPDATE template_name = VALUES(template_name);

SET FOREIGN_KEY_CHECKS = 1;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_subscription ON tenants (subscription_status, subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_tenants_activity ON tenants (last_activity_at);
CREATE INDEX IF NOT EXISTS idx_users_activity ON users (last_activity_at);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users (tenant_id, role);
