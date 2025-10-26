# 🏢 Multi-Tenant Architecture - Complete Guide

**Version**: 2.0.0  
**Last Updated**: 2025-10-07  
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Database Schema](#database-schema)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Tenant Context](#tenant-context)
6. [Permissions & RBAC](#permissions--rbac)
7. [API Layer](#api-layer)
8. [Security Best Practices](#security-best-practices)
9. [Performance Optimization](#performance-optimization)
10. [Code Examples](#code-examples)

---

## Overview

ConstructAI implements a **robust multi-tenant architecture** where each construction company (tenant) has completely isolated data while sharing the same application infrastructure.

### Key Features

- ✅ **Complete Data Isolation** - Each company's data is completely separate
- ✅ **Database-Level Security** - Row Level Security (RLS) enforces access control
- ✅ **Role-Based Access Control** - Granular permissions for each user role
- ✅ **Audit Logging** - Track all tenant operations
- ✅ **Performance Optimized** - Indexes and query optimization
- ✅ **Super Admin Access** - Platform-wide management capabilities

---

## Core Concepts

### 1. Tenant (Company)

Each construction company is a **tenant** with:
- Unique ID (`company_id`)
- Subscription plan (free, professional, enterprise)
- Status (active, suspended, cancelled)
- Settings (timezone, currency, features)

### 2. Data Isolation

All tenant-specific tables include a `company_id` foreign key:
- `users` - User profiles linked to companies
- `projects` - Construction projects
- `tasks` - Project tasks
- `subscriptions` - AI agent subscriptions
- `audit_logs` - Activity tracking
- `notifications` - User notifications

### 3. Super Admin

Special role that can:
- Access data from all companies
- Manage companies (create, suspend, delete)
- View platform-wide analytics
- Manage AI agents and plans

---

## Database Schema

### Core Tables

#### companies
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operative',
    avatar TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### projects
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning',
    budget DECIMAL(15, 2),
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Company ID indexes on all tenant tables
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_tasks_company_id ON tasks(company_id);

-- Composite indexes for common queries
CREATE INDEX idx_projects_company_status ON projects(company_id, status);
CREATE INDEX idx_tasks_company_assigned ON tasks(company_id, assigned_to);

-- Partial indexes for active records
CREATE INDEX idx_projects_active ON projects(company_id) WHERE status = 'active';
CREATE INDEX idx_tasks_active ON tasks(company_id) WHERE status IN ('todo', 'in-progress');
```

---

## Row Level Security (RLS)

### What is RLS?

Row Level Security is a PostgreSQL feature that automatically filters query results based on the current user's permissions. It's enforced at the database level, making it impossible to bypass.

### RLS Policies

#### Users Table
```sql
-- Users can only see users from their company
CREATE POLICY users_isolation_policy ON users
    FOR ALL
    USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Super admins can see all users
CREATE POLICY users_super_admin_policy ON users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );
```

#### Projects Table
```sql
CREATE POLICY projects_isolation_policy ON projects
    FOR ALL
    USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );
```

### Helper Functions

```sql
-- Get current user's company_id
CREATE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is super admin
CREATE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Tenant Context

### What is Tenant Context?

Tenant Context is a React Context that provides the current user's company information throughout the application.

### Structure

```typescript
interface TenantContext {
    user: User;
    companyId: string;
    companyName: string;
    companySlug: string;
    companyPlan: 'free' | 'professional' | 'enterprise';
    companyStatus: 'active' | 'suspended' | 'cancelled';
    subscriptions: Subscription[];
    hasFeature: (feature: string) => boolean;
    hasAgent: (agentSlug: string) => boolean;
}
```

### Usage

```typescript
import { useTenant } from '../contexts/TenantContext';

function MyComponent() {
    const tenant = useTenant();
    
    // Access company info
    console.log(tenant.companyName);
    console.log(tenant.companyPlan);
    
    // Check features
    if (tenant.hasFeature('ml_analytics')) {
        // Show ML analytics
    }
    
    // Check agent subscriptions
    if (tenant.hasAgent('hse-sentinel-ai')) {
        // Show HSE features
    }
}
```

### Feature Gates

```typescript
import { FeatureGate } from '../contexts/TenantContext';

<FeatureGate 
    feature="ml_analytics"
    fallback={<UpgradePrompt />}
>
    <MLAnalyticsDashboard />
</FeatureGate>
```

---

## Permissions & RBAC

### Role Hierarchy

```typescript
const ROLE_HIERARCHY = {
    super_admin: 100,
    company_admin: 80,
    supervisor: 60,
    'Project Manager': 40,
    operative: 20,
};
```

### Permissions Matrix

| Permission | super_admin | company_admin | supervisor | Project Manager | operative |
|-----------|-------------|---------------|------------|-----------------|-----------|
| company:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| company:update | ✅ | ✅ | ❌ | ❌ | ❌ |
| project:create | ✅ | ✅ | ✅ | ✅ | ❌ |
| project:delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| task:create | ✅ | ✅ | ✅ | ✅ | ❌ |
| task:assign | ✅ | ✅ | ✅ | ✅ | ❌ |
| user:invite | ✅ | ✅ | ❌ | ❌ | ❌ |
| platform:* | ✅ | ❌ | ❌ | ❌ | ❌ |

### Permission Checking

```typescript
import { hasPermission } from '../utils/permissions';

// Check single permission
if (hasPermission(user, 'project:create')) {
    // Allow project creation
}

// Require permission (throws error if denied)
requirePermission(tenantContext, 'user:invite');
```

---

## API Layer

### Tenant Validation Middleware

```typescript
import { validateCompanyAccess, requireCompanyAccess } from '../utils/tenantMiddleware';

// Validate access
const result = validateCompanyAccess(user, targetCompanyId);
if (!result.allowed) {
    throw new Error(result.reason);
}

// Require access (throws if denied)
requireCompanyAccess(user, targetCompanyId);
```

### Query Filtering

```typescript
import { buildTenantQuery } from '../utils/tenantMiddleware';

// Automatically adds company_id filter for non-super-admins
const query = buildTenantQuery(user, 'projects', '*');
const { data } = await query;
```

### Audit Logging

```typescript
import { logTenantAction, withAuditLog } from '../utils/tenantMiddleware';

// Log action
await logTenantAction(user, 'project_created', 'projects', projectId);

// Wrap operation with audit logging
const result = await withAuditLog(
    user,
    'project_updated',
    'projects',
    async () => {
        return await updateProject(projectId, data);
    },
    projectId
);
```

---

## Security Best Practices

### 1. Always Use RLS

✅ **DO**: Enable RLS on all tenant tables
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

❌ **DON'T**: Rely only on application-level filtering

### 2. Validate Tenant Access

✅ **DO**: Validate company_id before operations
```typescript
requireCompanyAccess(user, project.company_id);
```

❌ **DON'T**: Trust client-provided company_id

### 3. Sanitize Data

✅ **DO**: Force correct company_id
```typescript
const data = sanitizeDataForTenant(user, inputData);
```

❌ **DON'T**: Allow users to set arbitrary company_id

### 4. Use Prepared Statements

✅ **DO**: Use parameterized queries
```typescript
.eq('company_id', user.companyId)
```

❌ **DON'T**: Concatenate SQL strings

---

## Performance Optimization

### 1. Indexes

- Add indexes on `company_id` columns
- Create composite indexes for common queries
- Use partial indexes for filtered queries

### 2. Query Optimization

- Select only needed columns
- Use pagination for large result sets
- Implement caching where appropriate

### 3. Connection Pooling

- Use Supabase connection pooling
- Limit concurrent connections per tenant

---

## Code Examples

See `MULTI_TENANT_CODE_EXAMPLES.md` for detailed code examples.

---

## Migration Guide

See `supabase/migrations/` for database migration scripts:
- `001_multi_tenant_schema.sql` - Initial schema
- `002_create_super_admin.sql` - Super admin setup
- `003_enhanced_rls_security.sql` - Enhanced security

---

## Testing

See `MULTI_TENANT_TESTING.md` for testing guidelines.

---

## Support

For questions or issues, contact the ConstructAI team.

