# CortexBuild Database Status Report

**Generated**: October 9, 2025, 22:00
**Database**: SQLite (better-sqlite3)
**File**: `cortexbuild.db`

---

## 📊 Database Statistics

| Category | Count |
|----------|-------|
| Users | 5 |
| Companies | 2 |
| Projects | 3 |
| Clients | 3 |
| Tasks | 4 |
| AI Agents | 6 |
| Subscription Plans | 3 |

---

## 👥 Users

| ID | Email | Name | Role | Company |
|----|-------|------|------|---------|
| user-1 | <adrian.stanca1@gmail.com> | Adrian Stanca | super_admin | company-1 |
| user-4 | <adrian@ascladdingltd.co.uk> | Adrian Stanca | company_admin | company-2 |
| user-2 | <casey@constructco.com> | Casey Johnson | company_admin | company-1 |
| user-5 | <dev@constructco.com> | Dev User | developer | company-1 |
| user-3 | <mike@constructco.com> | Mike Wilson | supervisor | company-1 |

### Login Credentials

**Super Admin**:

- Email: `adrian.stanca1@gmail.com`
- Password: `parola123`

**Company Admin**:

- Email: `adrian@ascladdingltd.co.uk`
- Password: `Lolozania1`

**Developer**:

- Email: `dev@constructco.com`
- Password: `parola123`

---

## 🏢 Companies

| ID | Name | Created |
|----|------|---------|
| company-1 | ConstructCo | 2025-10-09 21:50:53 |
| company-2 | AS CLADDING AND ROOFING LTD | 2025-10-09 21:50:53 |

---

## 🏗️ Projects

| ID | Name | Status | Company |
|----|------|--------|---------|
| 1 | Metropolis Tower | active | company-1 |
| 2 | Bayview Innovation Campus | planning | company-1 |
| 3 | Greenwich Community Stadium | active | company-2 |

---

## 👤 Clients

| ID | Name | Email | Company |
|----|------|-------|---------|
| 1 | Acme Developments | <alice@acme.dev> | company-1 |
| 2 | Skyline Properties | <robert@skyline.com> | company-1 |
| 3 | Metropolitan Council | <sarah@metro.gov> | company-2 |

---

## ✅ Tasks

| Status | Count |
|--------|-------|
| completed | 1 |
| in-progress | 2 |
| todo | 1 |

**Total Tasks**: 4

---

## 🤖 AI Agents

| Slug | Name | Status | Company |
|------|------|--------|---------|
| hse-sentinel-ai | HSE Sentinel | active | Global |
| commercial-guardian | Commercial Guardian | active | Global |
| quality-inspector | Quality Inspector | active | Global |
| hse-sentinel-ai-company-1 | HSE Sentinel | active | company-1 |
| commercial-guardian-company-1 | Commercial Guardian | active | company-1 |

**Total AI Agents**: 6 (3 global, 3 company-specific)

---

## 💳 Subscription Plans

| ID | Name | Tier | Price | Billing |
|----|------|------|-------|---------|
| plan-free | Free | free | $0.00 | monthly |
| plan-pro-monthly | Pro | pro | $49.00 | monthly |
| plan-enterprise-monthly | Enterprise | enterprise | $199.00 | monthly |

---

## 📋 Database Tables (54 total)

### Core Tables

- `users` - User accounts
- `companies` - Multi-tenant companies
- `sessions` - Active sessions
- `clients` - Client management
- `projects` - Construction projects
- `tasks` - Task management
- `milestones` - Project milestones
- `documents` - Document storage
- `time_entries` - Time tracking

### Financial Tables

- `invoices` - Invoicing system
- `invoice_items` - Invoice line items
- `purchase_orders` - Purchase order management
- `purchase_order_items` - PO line items
- `subcontractors` - Subcontractor directory

### Developer Platform

- `sdk_developers` - SDK developer registrations
- `sdk_profiles` - Developer profiles (empty)
- `sdk_workflows` - Workflow definitions (empty)
- `sdk_apps` - Published apps (empty)
- `api_keys` - API authentication
- `api_usage_logs` - API usage tracking

### AI & Automation

- `ai_agents` - AI agent definitions
- `ai_requests` - AI API request logs
- `agent_executions` - Agent execution history
- `agent_subscriptions` - Agent subscriptions
- `automation_events` - Automation event logs
- `automation_rules` - Automation rules
- `smart_tools` - Smart tool definitions
- `smart_tool_executions` - Tool execution logs

### Subscription Management

- `subscription_plans` - Subscription tiers
- `user_subscriptions` - User subscription records
- `usage_metrics` - Usage tracking

### Integration & Webhooks

- `webhooks` - Webhook configurations
- `webhook_logs` - Webhook delivery logs
- `oauth_tokens` - OAuth credentials
- `integrations` - Third-party integrations

### Workflow Engine

- `workflows` - Workflow definitions
- `workflow_templates` - Workflow templates
- `workflow_runs` - Workflow execution history
- `workflow_run_steps` - Individual step execution

### Developer Tools

- `sandbox_environments` - Sandbox instances
- `deployments` - Deployment history
- `app_versions` - Application versions
- `module_reviews` - Module review system
- `developer_console_events` - Developer activity logs

### MCP (Model Context Protocol)

- `mcp_sessions` - MCP session management
- `mcp_messages` - MCP message history
- `mcp_contexts` - MCP context storage

---

## 🔍 Database Health Check

✅ **All tables created successfully**
✅ **Seed data populated**
✅ **Foreign key constraints enabled**
✅ **WAL (Write-Ahead Logging) mode enabled**
✅ **Multi-tenant isolation working** (company_id filtering)
✅ **Password hashing implemented** (bcrypt with 10 rounds)

---

## 📝 Notes

1. **SDK Tables Empty**: `sdk_profiles`, `sdk_workflows`, and `sdk_apps` are empty - will be populated when users access Developer Dashboard
2. **User Subscriptions**: No active subscriptions yet - users on default free tier
3. **AI Agents**: Mix of global agents (available to all) and company-specific agents
4. **Multi-Tenant**: All data properly scoped to companies with `company_id` foreign keys

---

## 🔧 Useful SQL Queries

### Get all users with company names

```sql
SELECT u.email, u.name, u.role, c.name as company 
FROM users u 
JOIN companies c ON u.company_id = c.id;
```

### Get project count by company

```sql
SELECT c.name, COUNT(p.id) as project_count 
FROM companies c 
LEFT JOIN projects p ON p.company_id = c.id 
GROUP BY c.id;
```

### Get subscription plan details

```sql
SELECT * FROM subscription_plans ORDER BY price;
```

### Check user login activity

```sql
SELECT u.email, s.created_at 
FROM sessions s 
JOIN users u ON u.id = s.user_id 
ORDER BY s.created_at DESC 
LIMIT 10;
```

---

## 🚀 Next Steps

1. ✅ Database configured and running
2. ✅ Test users created with correct passwords
3. ✅ Multi-tenant architecture validated
4. ⏳ Populate SDK data through Developer Dashboard usage
5. ⏳ Test subscription flows
6. ⏳ Test automation workflows
7. ⏳ Validate AI agent execution

---

**Status**: ✅ **Database Healthy and Ready**
