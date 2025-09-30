-- Enhanced Multi-tenant database schema for ASAgents platform
-- Includes all tables needed for full application functionality
-- Designed for MariaDB/MySQL 10.5+

-- Core tenant and user tables (from existing schema)
CREATE TABLE IF NOT EXISTS tenants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  plan ENUM('free','growth','enterprise') NOT NULL DEFAULT 'growth',
  contact_email VARCHAR(320) NOT NULL,
  contact_phone VARCHAR(32) NULL,
  address JSON NULL,
  billing_reference VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  role ENUM('owner','admin','manager','analyst','viewer','operative','foreman','principal_admin') NOT NULL DEFAULT 'viewer',
  status ENUM('invited','active','suspended') NOT NULL DEFAULT 'invited',
  avatar_url VARCHAR(512) NULL,
  phone VARCHAR(32) NULL,
  mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
  mfa_secret VARCHAR(255) NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_per_tenant (tenant_id, email),
  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- OAuth and social login integration
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  provider ENUM('google','github','facebook','oauth_io') NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(320) NULL,
  provider_name VARCHAR(255) NULL,
  provider_avatar VARCHAR(512) NULL,
  access_token TEXT NULL,
  refresh_token TEXT NULL,
  expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_provider_user (provider, provider_user_id),
  CONSTRAINT fk_oauth_accounts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Companies/Clients
CREATE TABLE IF NOT EXISTS companies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('client','contractor','supplier','partner') NOT NULL DEFAULT 'client',
  contact_email VARCHAR(320) NULL,
  contact_phone VARCHAR(32) NULL,
  address JSON NULL,
  website VARCHAR(512) NULL,
  tax_number VARCHAR(64) NULL,
  storage_usage_gb DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_users INT NOT NULL DEFAULT 10,
  status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_companies_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Projects (enhanced from existing)
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  owner_id BIGINT UNSIGNED NOT NULL,
  company_id BIGINT UNSIGNED NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status ENUM('draft','active','on_hold','completed','archived') NOT NULL DEFAULT 'draft',
  priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  budget DECIMAL(14,2) NULL,
  spent DECIMAL(14,2) NOT NULL DEFAULT 0,
  progress DECIMAL(5,2) NOT NULL DEFAULT 0,
  start_date DATE NULL,
  end_date DATE NULL,
  location JSON NULL,
  tags JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_project_code (tenant_id, code),
  CONSTRAINT fk_projects_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_projects_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Project assignments
CREATE TABLE IF NOT EXISTS project_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('manager','lead','member','viewer') NOT NULL DEFAULT 'member',
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY unique_project_user (project_id, user_id),
  CONSTRAINT fk_project_assignments_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_project_assignments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_project_assignments_assigner FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tasks/Todos
CREATE TABLE IF NOT EXISTS tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  assigned_to BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status ENUM('todo','in_progress','done','cancelled') NOT NULL DEFAULT 'todo',
  priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  progress DECIMAL(5,2) NOT NULL DEFAULT 0,
  due_date DATETIME NULL,
  completed_at DATETIME NULL,
  estimated_hours DECIMAL(8,2) NULL,
  actual_hours DECIMAL(8,2) NULL,
  tags JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Time tracking
CREATE TABLE IF NOT EXISTS time_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  task_id BIGINT UNSIGNED NULL,
  description TEXT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  duration_minutes INT NULL,
  is_billable TINYINT(1) NOT NULL DEFAULT 1,
  hourly_rate DECIMAL(8,2) NULL,
  status ENUM('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_time_entries_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_time_entries_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_time_entries_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
  CONSTRAINT fk_time_entries_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Equipment management
CREATE TABLE IF NOT EXISTS equipment (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(128) NOT NULL,
  model VARCHAR(128) NULL,
  serial_number VARCHAR(128) NULL,
  status ENUM('available','in_use','maintenance','retired') NOT NULL DEFAULT 'available',
  location VARCHAR(255) NULL,
  purchase_date DATE NULL,
  purchase_cost DECIMAL(12,2) NULL,
  current_value DECIMAL(12,2) NULL,
  maintenance_schedule JSON NULL,
  last_maintenance DATE NULL,
  next_maintenance DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_equipment_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Equipment assignments
CREATE TABLE IF NOT EXISTS equipment_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  equipment_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NULL,
  assigned_at DATETIME NOT NULL,
  returned_at DATETIME NULL,
  notes TEXT NULL,
  CONSTRAINT fk_equipment_assignments_equipment FOREIGN KEY (equipment_id) REFERENCES equipment (id) ON DELETE CASCADE,
  CONSTRAINT fk_equipment_assignments_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
  CONSTRAINT fk_equipment_assignments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Safety incidents
CREATE TABLE IF NOT EXISTS safety_incidents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  reported_by BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('low','medium','high','critical') NOT NULL,
  status ENUM('open','investigating','resolved','closed') NOT NULL DEFAULT 'open',
  incident_date DATETIME NOT NULL,
  location VARCHAR(255) NULL,
  injured_parties JSON NULL,
  witnesses JSON NULL,
  corrective_actions TEXT NULL,
  resolved_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_safety_incidents_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_safety_incidents_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
  CONSTRAINT fk_safety_incidents_reporter FOREIGN KEY (reported_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  category ENUM('materials','labor','equipment','travel','utilities','other') NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'GBP',
  expense_date DATE NOT NULL,
  receipt_url VARCHAR(512) NULL,
  status ENUM('draft','submitted','approved','rejected','paid') NOT NULL DEFAULT 'draft',
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_approver FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Documents (enhanced from existing)
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  owner_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  storage_path VARCHAR(512) NOT NULL,
  checksum CHAR(64) NOT NULL,
  category ENUM('drawing','specification','permit','photo','report','other') NOT NULL DEFAULT 'other',
  status ENUM('draft','active','archived') NOT NULL DEFAULT 'active',
  tags JSON NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Invoices (enhanced from existing)
CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  company_id BIGINT UNSIGNED NULL,
  invoice_number VARCHAR(64) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(320) NULL,
  amount_due DECIMAL(14,2) NOT NULL,
  amount_paid DECIMAL(14,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'GBP',
  due_date DATE NOT NULL,
  issued_date DATE NOT NULL,
  status ENUM('draft','sent','paid','overdue','void') NOT NULL DEFAULT 'draft',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_invoice_number (tenant_id, invoice_number),
  CONSTRAINT fk_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_invoices_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
  CONSTRAINT fk_invoices_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(14,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  paid_at DATETIME NOT NULL,
  method ENUM('bank_transfer','card','cash','cheque','other') NOT NULL DEFAULT 'bank_transfer',
  reference VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('info','warning','error','success') NOT NULL DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  action_url VARCHAR(512) NULL,
  expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Conversations and messages
CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  type ENUM('general','project','support','announcement') NOT NULL DEFAULT 'general',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_conversations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_conversations_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_conversations_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  message_type ENUM('text','file','system') NOT NULL DEFAULT 'text',
  file_url VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Multimodal AI content
CREATE TABLE IF NOT EXISTS multimodal_content (
  id VARCHAR(100) PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  type ENUM('text','image','audio','video','document','mixed') NOT NULL,
  status ENUM('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  title VARCHAR(255) NULL,
  description TEXT NULL,
  file_url VARCHAR(512) NULL,
  file_size BIGINT UNSIGNED NULL,
  mime_type VARCHAR(255) NULL,
  checksum VARCHAR(64) NULL,
  processing_results JSON NULL,
  ai_provider ENUM('gemini','openai','anthropic','java-enterprise') NULL,
  model_version VARCHAR(128) NULL,
  confidence DECIMAL(5,4) NULL,
  processing_time_ms INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_multimodal_content_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_multimodal_content_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_multimodal_content_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Audit logs (enhanced from existing)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  action VARCHAR(64) NOT NULL,
  changes JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_tenant (tenant_id, created_at),
  INDEX idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Company settings
CREATE TABLE IF NOT EXISTS company_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  setting_key VARCHAR(128) NOT NULL,
  setting_value JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tenant_setting (tenant_id, setting_key),
  CONSTRAINT fk_company_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB;
