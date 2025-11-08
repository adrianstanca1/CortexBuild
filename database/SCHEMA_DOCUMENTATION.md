# CortexBuild Database Schema - Phase 5 Documentation

## Overview

This document describes the complete database schema created in Phase 5 to support company admin features. All tables include Row Level Security (RLS) policies to ensure data isolation between companies.

---

## Tables

### 1. **departments**
Stores company departments/teams.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK): Reference to companies table
- `name` (TEXT): Department name (unique per company)
- `description` (TEXT): Department description
- `budget` (NUMERIC): Department budget (>= 0)
- `manager_id` (UUID, FK): Reference to users table (department manager)
- `member_count` (INTEGER): Number of members (>= 0)
- `spent` (NUMERIC): Amount spent (>= 0)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Indexes:**
- `idx_departments_company_id`: For filtering by company
- `idx_departments_manager_id`: For filtering by manager
- `idx_departments_created_at`: For sorting by creation date

**Constraints:**
- `UNIQUE(company_id, name)`: Department names unique per company
- `budget >= 0`: Budget cannot be negative
- `member_count >= 0`: Member count cannot be negative
- `spent >= 0`: Spent amount cannot be negative

**RLS Policies:**
- Company admins can view/insert/update/delete their company's departments
- Super admins can access all departments

---

### 2. **custom_roles**
Stores company-specific custom roles with permissions.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK): Reference to companies table
- `name` (TEXT): Role name (unique per company)
- `description` (TEXT): Role description
- `permissions` (TEXT[]): Array of permission strings
- `user_count` (INTEGER): Number of users with this role (>= 0)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Indexes:**
- `idx_custom_roles_company_id`: For filtering by company
- `idx_custom_roles_created_at`: For sorting by creation date

**Constraints:**
- `UNIQUE(company_id, name)`: Role names unique per company
- `user_count >= 0`: User count cannot be negative

**RLS Policies:**
- Company admins can view/insert/update/delete their company's roles
- Super admins can access all roles

---

### 3. **department_members**
Junction table linking users to departments.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `department_id` (UUID, FK): Reference to departments table
- `user_id` (UUID, FK): Reference to users table
- `role` (TEXT): Member's role in department (default: 'member')
- `joined_at` (TIMESTAMP): When user joined department

**Indexes:**
- `idx_department_members_department_id`: For filtering by department
- `idx_department_members_user_id`: For filtering by user
- `idx_department_members_joined_at`: For sorting by join date

**Constraints:**
- `UNIQUE(department_id, user_id)`: Each user can only be in a department once

**RLS Policies:**
- Users can view department members of their company
- Company admins can insert/update/delete department members
- Super admins can access all department members

---

### 4. **company_analytics**
Stores monthly analytics data for companies.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK): Reference to companies table
- `total_projects` (INTEGER): Total projects (>= 0)
- `active_projects` (INTEGER): Active projects (>= 0)
- `completed_projects` (INTEGER): Completed projects (>= 0)
- `total_revenue` (NUMERIC): Total revenue (>= 0)
- `monthly_revenue` (NUMERIC): Monthly revenue (>= 0)
- `team_productivity` (NUMERIC): Productivity percentage (0-100)
- `completion_rate` (NUMERIC): Completion rate percentage (0-100)
- `budget_utilization` (NUMERIC): Budget utilization percentage (0-100)
- `month` (TEXT): Month (1-12)
- `year` (INTEGER): Year
- `created_at` (TIMESTAMP): Creation timestamp

**Indexes:**
- `idx_company_analytics_company_id`: For filtering by company
- `idx_company_analytics_year_month`: For filtering by date range
- `idx_company_analytics_created_at`: For sorting by creation date

**Constraints:**
- `UNIQUE(company_id, month, year)`: One record per company per month
- All numeric fields >= 0
- Percentage fields: 0-100

**RLS Policies:**
- Company admins can view/insert/update/delete their company's analytics
- Super admins can access all analytics

---

### 5. **company_settings**
Stores company-specific settings and configuration.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK): Reference to companies table (UNIQUE)
- `theme_color` (TEXT): Theme color hex code (default: '#3B82F6')
- `logo_url` (TEXT): URL to company logo
- `email_template` (TEXT): Custom email template
- `notifications_enabled` (BOOLEAN): Enable notifications (default: true)
- `two_factor_required` (BOOLEAN): Require 2FA (default: false)
- `ip_whitelist` (TEXT): IP whitelist for access control
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Indexes:**
- `idx_company_settings_company_id`: For filtering by company

**Constraints:**
- `UNIQUE(company_id)`: One settings record per company

**RLS Policies:**
- Company admins can view/insert/update/delete their company's settings
- Super admins can access all settings

---

### 6. **api_keys**
Stores API keys for company integrations.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK): Reference to companies table
- `name` (TEXT): API key name
- `key_value` (TEXT): The actual API key (UNIQUE)
- `created_at` (TIMESTAMP): Creation timestamp
- `last_used_at` (TIMESTAMP): Last usage timestamp

**Indexes:**
- `idx_api_keys_company_id`: For filtering by company
- `idx_api_keys_key_value`: For validating API keys
- `idx_api_keys_created_at`: For sorting by creation date

**Constraints:**
- `UNIQUE(company_id, name)`: API key names unique per company
- `UNIQUE(key_value)`: API key values globally unique

**RLS Policies:**
- Company admins can view/insert/update/delete their company's API keys
- Super admins can access all API keys

---

### 7. **webhooks**
Stores webhook configurations for event notifications.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK): Reference to companies table
- `url` (TEXT): Webhook URL
- `events` (TEXT[]): Array of event types to subscribe to
- `active` (BOOLEAN): Whether webhook is active (default: true)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Indexes:**
- `idx_webhooks_company_id`: For filtering by company
- `idx_webhooks_active`: For filtering active webhooks
- `idx_webhooks_created_at`: For sorting by creation date

**RLS Policies:**
- Company admins can view/insert/update/delete their company's webhooks
- Super admins can access all webhooks

---

## RPC Functions

### 1. **invite_team_member(company_id, email, role)**
Invites a new team member or adds existing user to company.

**Parameters:**
- `p_company_id` (UUID): Company ID
- `p_email` (TEXT): User email
- `p_role` (TEXT): User role

**Returns:** JSON with success status and user_id

---

### 2. **update_team_member_role(user_id, new_role)**
Updates a user's role in the company.

**Parameters:**
- `p_user_id` (UUID): User ID
- `p_new_role` (TEXT): New role

**Returns:** JSON with success status

---

### 3. **create_department(company_id, name, description, budget, manager_id)**
Creates a new department.

**Parameters:**
- `p_company_id` (UUID): Company ID
- `p_name` (TEXT): Department name
- `p_description` (TEXT): Department description
- `p_budget` (NUMERIC): Department budget
- `p_manager_id` (UUID): Manager user ID

**Returns:** JSON with success status and department_id

---

### 4. **assign_user_to_department(user_id, department_id, role)**
Assigns a user to a department.

**Parameters:**
- `p_user_id` (UUID): User ID
- `p_department_id` (UUID): Department ID
- `p_role` (TEXT): Role in department (default: 'member')

**Returns:** JSON with success status and member_id

---

### 5. **get_company_analytics(company_id, start_date, end_date)**
Retrieves analytics data for a company within a date range.

**Parameters:**
- `p_company_id` (UUID): Company ID
- `p_start_date` (DATE): Start date (optional)
- `p_end_date` (DATE): End date (optional)

**Returns:** Table with analytics records

---

### 6. **create_api_key(company_id, key_name, key_value)**
Creates a new API key for a company.

**Parameters:**
- `p_company_id` (UUID): Company ID
- `p_key_name` (TEXT): API key name
- `p_key_value` (TEXT): API key value

**Returns:** JSON with success status and api_key_id

---

### 7. **update_department_budget(department_id, new_budget)**
Updates a department's budget.

**Parameters:**
- `p_department_id` (UUID): Department ID
- `p_new_budget` (NUMERIC): New budget amount

**Returns:** JSON with success status

---

### 8. **get_department_members(department_id)**
Retrieves all members of a department.

**Parameters:**
- `p_department_id` (UUID): Department ID

**Returns:** Table with member details

---

### 9. **get_department_budget_summary(company_id)**
Retrieves budget summary for all departments in a company.

**Parameters:**
- `p_company_id` (UUID): Company ID

**Returns:** Table with budget information

---

## Design Decisions

1. **Cascading Deletes**: Departments and related data are deleted when a company is deleted
2. **Unique Constraints**: Department and role names are unique per company to prevent duplicates
3. **Check Constraints**: Budget and member counts must be non-negative
4. **Percentage Fields**: Analytics percentages are constrained to 0-100 range
5. **Timestamps**: All tables include created_at and updated_at for audit trails
6. **RLS Policies**: All tables enforce company-level data isolation
7. **Indexes**: Strategic indexes on foreign keys and frequently queried columns

---

## Migration Order

Run migrations in this order:
1. `001_create_departments_table.sql`
2. `002_create_custom_roles_table.sql`
3. `003_create_department_members_table.sql`
4. `004_create_company_analytics_table.sql`
5. `005_create_company_settings_table.sql`
6. `006_create_api_keys_table.sql`
7. `007_create_webhooks_table.sql`
8. `008_create_rpc_functions.sql`
9. `009_create_rpc_functions_part2.sql`

