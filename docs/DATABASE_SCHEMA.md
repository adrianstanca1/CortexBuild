# CortexBuild Database Schema Documentation

**Version:** 2.0.0 UNIFIED  
**Last Updated:** 2025-10-11  
**Database:** cortexbuild.db (SQLite with WAL mode)  
**Total Tables:** 50  
**Source File:** `server/database.ts`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Configuration](#database-configuration)
3. [Schema Organization](#schema-organization)
4. [Table Definitions](#table-definitions)
5. [Indexes](#indexes)
6. [Seed Data](#seed-data)
7. [External Tables](#external-tables)

---

## Overview

CortexBuild uses a comprehensive SQLite database schema that supports all platform features including:
- Multi-tenant company management
- Project and task management
- Financial operations (invoicing, time tracking, purchase orders)
- AI agents and automation
- SDK development environment
- Global marketplace for apps
- Third-party integrations
- Real-time collaboration

---

## Database Configuration

```typescript
const db = new Database('./cortexbuild.db');
db.pragma('journal_mode = WAL');  // Write-Ahead Logging for better concurrency
db.pragma('foreign_keys = ON');   // Enforce referential integrity
```

**Key Features:**
- **WAL Mode:** Enables concurrent reads and writes
- **Foreign Keys:** Enforces data integrity across tables
- **Transactions:** All seed data inserted within transactions
- **Indexes:** 50+ indexes for optimal query performance

---

## Schema Organization

The database is organized into **13 logical sections**:

### 1. Core System (Lines ~50-150)
**Tables:** `users`, `companies`, `sessions`

Core authentication and multi-tenant infrastructure.

### 2. Project Management (Lines ~150-350)
**Tables:** `clients`, `projects`, `project_team`, `tasks`, `milestones`, `rfis`, `documents`

Complete project lifecycle management for construction projects.

### 3. Financial Management (Lines ~350-550)
**Tables:** `invoices`, `invoice_items`, `time_entries`, `subcontractors`, `purchase_orders`, `purchase_order_items`

Financial operations including billing, time tracking, and procurement.

### 4. Automation & Workflows (Lines ~550-750)
**Tables:** `smart_tools`, `smart_tool_executions`, `workflow_templates`, `workflows`, `workflow_runs`, `workflow_run_steps`, `automation_rules`, `automation_events`

Intelligent automation and workflow orchestration.

### 5. AI & Agents (Lines ~750-950)
**Tables:** `ai_agents`, `agent_subscriptions`, `agent_executions`, `ai_requests`

AI-powered agents for construction-specific tasks.

### 6. SDK & Development (Lines ~950-1150)
**Tables:** `sdk_developers`, `sdk_profiles`, `sdk_workflows`, `api_keys`, `api_usage_logs`, `developer_console_events`

Complete SDK development environment with API management.

### 7. Global Marketplace (Lines ~1150-1350)
**Tables:** `sdk_apps`, `user_app_installations`, `company_app_installations`, `app_review_history`, `app_analytics`, `app_versions`

App marketplace with dual installation models (individual + company-wide).

### 8. Integrations (Lines ~1350-1450)
**Tables:** `integrations`, `oauth_tokens`, `webhooks`, `webhook_logs`

Third-party integrations with OAuth and webhook support.

### 9. MCP - Model Context Protocol (External)
**Tables:** `mcp_sessions`, `mcp_messages`, `mcp_contexts`

Created in `server/services/mcp.ts` via `initializeMCPTables()`.

### 10. Deployment & Sandbox (Lines ~1550-1650)
**Tables:** `deployments`, `sandbox_environments`

Deployment tracking and isolated sandbox environments.

### 11. Module System (Lines ~1650-1700)
**Tables:** `module_reviews`

Module marketplace ratings and reviews.

### 12. Database Indexes (Lines ~1700-1800)
**50+ indexes** for performance optimization across all tables.

### 13. Seed Data (Lines ~1800-END)
Initial data including:
- 2 demo companies (ASC Cladding Ltd, BuildRight Construction)
- 5 demo users (Super Admin, Company Admins, Developers)
- Sample projects, clients, tasks, milestones
- **6 pre-approved Global Marketplace apps**
- AI Agents, Smart Tools, Workflow Templates
- Sample integrations and automations

---

## Table Definitions

### Core System Tables

#### users
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,  -- 'super_admin', 'company_admin', 'developer', 'user'
    avatar TEXT,
    company_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
)
```

#### companies
```sql
CREATE TABLE companies (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    industry TEXT,
    email TEXT,
    subscription_plan TEXT DEFAULT 'free',
    max_users INTEGER DEFAULT 10,
    max_projects INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### sessions
```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

---

### Global Marketplace Tables

#### sdk_apps
```sql
CREATE TABLE sdk_apps (
    id TEXT PRIMARY KEY,
    developer_id TEXT NOT NULL,
    company_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📦',
    category TEXT DEFAULT 'productivity',
    code TEXT,
    version TEXT DEFAULT '1.0.0',
    status TEXT DEFAULT 'draft',
    review_status TEXT DEFAULT 'draft',  -- 'draft', 'pending_review', 'approved', 'rejected'
    is_public INTEGER DEFAULT 0,         -- 0 = private, 1 = public
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
)
```

**Pre-Approved Apps (6):**
1. Project Dashboard (📊 analytics)
2. Team Chat (💬 communication)
3. Time Tracker (⏱️ productivity)
4. Team Calendar (📅 productivity)
5. Task Manager (✅ productivity)
6. Expense Tracker (💰 finance)

---

## Indexes

**Total:** 50+ indexes for optimal performance

**Key Indexes:**
- `idx_users_email` - Fast user lookup by email
- `idx_sessions_token` - Fast session validation
- `idx_projects_company_id` - Company-scoped project queries
- `idx_sdk_apps_status` - Marketplace app filtering
- `idx_ai_agents_company` - Company-specific AI agents
- `idx_workflows_company` - Company workflow queries

---

## Seed Data

### Demo Companies
1. **ASC Cladding Ltd** (company-1)
2. **BuildRight Construction** (company-2)

### Demo Users
1. **Super Admin:** adrian.stanca1@gmail.com / parola123
2. **Company Admin (ASC):** adrian@ascladdingltd.co.uk / lolozania1
3. **Developer:** adrian.stanca1@icloud.com / password123
4. **User (ASC):** john.smith@ascladdingltd.co.uk / password123
5. **Company Admin (BuildRight):** sarah.johnson@buildright.com / password123

### Sample Data
- 3 clients per company
- 2 projects per company
- 3 tasks per project
- 2 milestones per project
- 6 Global Marketplace apps (pre-approved)
- 5 AI Agents
- 3 Smart Tools per company
- 2 Workflow Templates

---

## External Tables

### MCP Tables (server/services/mcp.ts)
- `mcp_sessions` - AI conversation sessions
- `mcp_messages` - Message history
- `mcp_contexts` - Context management

### Deployment Tables (server/services/deployment.ts)
- `deployments` - Deployment tracking

---

## Migration Notes

**From v1.0 to v2.0:**
- Added Global Marketplace tables (sdk_apps, installations, reviews, analytics)
- Enhanced companies table with industry, email, subscription fields
- Added comprehensive documentation and TOC
- Reorganized into 13 logical sections
- Maintained backward compatibility

---

## Best Practices

1. **Always use transactions** for multi-table operations
2. **Use prepared statements** to prevent SQL injection
3. **Leverage indexes** for frequently queried columns
4. **Enable foreign keys** to maintain referential integrity
5. **Use WAL mode** for better concurrency
6. **Regular backups** of cortexbuild.db file

---

**For detailed implementation, see:** `server/database.ts`

