# 🔧 Multi-Tenant Code Examples

Practical examples for implementing multi-tenant features in ConstructAI.

---

## Table of Contents

1. [Tenant Context Usage](#tenant-context-usage)
2. [Permission Checking](#permission-checking)
3. [API Queries with Tenant Filtering](#api-queries-with-tenant-filtering)
4. [Component Access Control](#component-access-control)
5. [Audit Logging](#audit-logging)
6. [Real-time Subscriptions](#real-time-subscriptions)

---

## Tenant Context Usage

### Basic Usage

```typescript
import { useTenant } from '../contexts/TenantContext';

function ProjectsList() {
    const tenant = useTenant();
    
    return (
        <div>
            <h1>Projects for {tenant.companyName}</h1>
            <p>Plan: {tenant.companyPlan}</p>
            <p>Active Agents: {tenant.subscriptions.length}</p>
        </div>
    );
}
```

### Feature Checking

```typescript
import { useTenant, useFeature } from '../contexts/TenantContext';

function AnalyticsDashboard() {
    const tenant = useTenant();
    const hasMLAnalytics = useFeature('ml_analytics');
    
    if (!hasMLAnalytics) {
        return <UpgradePrompt feature="ML Analytics" />;
    }
    
    return <MLDashboard />;
}
```

### Agent Checking

```typescript
import { useAgent } from '../contexts/TenantContext';

function SafetyMonitoring() {
    const hasHSEAgent = useAgent('hse-sentinel-ai');
    
    if (!hasHSEAgent) {
        return (
            <div>
                <p>Subscribe to HSE Sentinel AI to enable safety monitoring</p>
                <button>Subscribe Now</button>
            </div>
        );
    }
    
    return <HSEDashboard />;
}
```

---

## Permission Checking

### Check Single Permission

```typescript
import { hasPermission } from '../utils/permissions';
import { useTenant } from '../contexts/TenantContext';

function CreateProjectButton() {
    const tenant = useTenant();
    const canCreate = hasPermission(tenant.user, 'project:create');
    
    if (!canCreate) {
        return null; // Hide button
    }
    
    return (
        <button onClick={handleCreateProject}>
            Create Project
        </button>
    );
}
```

### Require Permission

```typescript
import { requirePermission } from '../utils/permissions';
import { useTenant } from '../contexts/TenantContext';

async function deleteProject(projectId: string) {
    const tenant = useTenant();
    
    // Throws error if permission denied
    requirePermission(tenant, 'project:delete');
    
    // Proceed with deletion
    await api.deleteProject(projectId);
}
```

### Role-Based Rendering

```typescript
import { useRole } from '../contexts/TenantContext';

function AdminPanel() {
    const { isSuperAdmin, isCompanyAdmin } = useRole();
    
    return (
        <div>
            {isSuperAdmin && <PlatformAdminSection />}
            {isCompanyAdmin && <CompanyAdminSection />}
            <UserSection />
        </div>
    );
}
```

---

## API Queries with Tenant Filtering

### Automatic Tenant Filtering

```typescript
import { buildTenantQuery } from '../utils/tenantMiddleware';
import { useTenant } from '../contexts/TenantContext';

async function fetchProjects() {
    const tenant = useTenant();
    
    // Automatically adds company_id filter for non-super-admins
    const query = buildTenantQuery(tenant.user, 'projects', '*');
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
}
```

### Manual Tenant Filtering

```typescript
import { supabase } from '../supabaseClient';
import { useTenant } from '../contexts/TenantContext';

async function fetchTasks() {
    const tenant = useTenant();
    
    let query = supabase
        .from('tasks')
        .select('*');
    
    // Add tenant filter for non-super-admins
    if (tenant.user.role !== 'super_admin') {
        query = query.eq('company_id', tenant.companyId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
}
```

### Validate Resource Access

```typescript
import { requireResourceAccess } from '../utils/tenantMiddleware';
import { useTenant } from '../contexts/TenantContext';

async function updateProject(projectId: string, updates: any) {
    const tenant = useTenant();
    
    // Validate user can access this project
    await requireResourceAccess(tenant.user, 'projects', projectId);
    
    // Proceed with update
    const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .single();
    
    if (error) throw error;
    return data;
}
```

---

## Component Access Control

### Feature Gate

```typescript
import { FeatureGate } from '../contexts/TenantContext';

function Dashboard() {
    return (
        <div>
            <BasicMetrics />
            
            <FeatureGate 
                feature="ml_analytics"
                fallback={<UpgradePrompt />}
            >
                <MLAnalytics />
            </FeatureGate>
            
            <FeatureGate feature="advanced_reporting">
                <AdvancedReports />
            </FeatureGate>
        </div>
    );
}
```

### Role Gate

```typescript
import { RoleGate } from '../contexts/TenantContext';

function ProjectSettings() {
    return (
        <div>
            <GeneralSettings />
            
            <RoleGate 
                allowedRoles={['super_admin', 'company_admin']}
                fallback={<p>Admin access required</p>}
            >
                <DangerZone />
            </RoleGate>
        </div>
    );
}
```

### Agent Gate

```typescript
import { AgentGate } from '../contexts/TenantContext';

function SafetySection() {
    return (
        <div>
            <AgentGate 
                agentSlug="hse-sentinel-ai"
                fallback={<SubscribePrompt agent="HSE Sentinel AI" />}
            >
                <HSEMonitoring />
            </AgentGate>
        </div>
    );
}
```

---

## Audit Logging

### Log Single Action

```typescript
import { logTenantAction } from '../utils/tenantMiddleware';
import { useTenant } from '../contexts/TenantContext';

async function createProject(projectData: any) {
    const tenant = useTenant();
    
    // Create project
    const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .single();
    
    if (error) throw error;
    
    // Log action
    await logTenantAction(
        tenant.user,
        'project_created',
        'projects',
        data.id,
        { name: projectData.name }
    );
    
    return data;
}
```

### Wrap Operation with Audit Log

```typescript
import { withAuditLog } from '../utils/tenantMiddleware';
import { useTenant } from '../contexts/TenantContext';

async function updateProject(projectId: string, updates: any) {
    const tenant = useTenant();
    
    return await withAuditLog(
        tenant.user,
        'project_updated',
        'projects',
        async () => {
            const { data, error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', projectId)
                .single();
            
            if (error) throw error;
            return data;
        },
        projectId
    );
}
```

---

## Real-time Subscriptions

### Subscribe to Company Activity

```typescript
import { subscribeToCompanyActivity } from '../api/realtime';
import { useTenant } from '../contexts/TenantContext';
import { useEffect } from 'react';

function ActivityFeed() {
    const tenant = useTenant();
    
    useEffect(() => {
        const subscription = subscribeToCompanyActivity(
            tenant.companyId,
            (activity) => {
                console.log('New activity:', activity);
                // Update UI
            }
        );
        
        return () => {
            subscription.unsubscribe();
        };
    }, [tenant.companyId]);
    
    return <div>Activity Feed</div>;
}
```

### Subscribe to Tasks

```typescript
import { subscribeToTasks } from '../api/realtime';
import { useTenant } from '../contexts/TenantContext';
import { useEffect, useState } from 'react';

function TaskList() {
    const tenant = useTenant();
    const [tasks, setTasks] = useState([]);
    
    useEffect(() => {
        const subscription = subscribeToTasks(
            tenant.companyId,
            '*', // All events
            (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'UPDATE') {
                    setTasks(prev => prev.map(t => 
                        t.id === payload.new.id ? payload.new : t
                    ));
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                }
            }
        );
        
        return () => {
            subscription.unsubscribe();
        };
    }, [tenant.companyId]);
    
    return (
        <div>
            {tasks.map(task => (
                <TaskItem key={task.id} task={task} />
            ))}
        </div>
    );
}
```

---

## Complete Example: Create Project with Full Validation

```typescript
import { useTenant } from '../contexts/TenantContext';
import { requirePermission } from '../utils/permissions';
import { sanitizeDataForTenant, withAuditLog } from '../utils/tenantMiddleware';
import { supabase } from '../supabaseClient';

async function createProject(projectData: any) {
    const tenant = useTenant();
    
    // 1. Check permission
    requirePermission(tenant, 'project:create');
    
    // 2. Sanitize data (ensure correct company_id)
    const sanitizedData = sanitizeDataForTenant(tenant.user, projectData);
    
    // 3. Create project with audit logging
    const project = await withAuditLog(
        tenant.user,
        'project_created',
        'projects',
        async () => {
            const { data, error } = await supabase
                .from('projects')
                .insert(sanitizedData)
                .single();
            
            if (error) throw error;
            return data;
        }
    );
    
    return project;
}
```

---

## Best Practices

### ✅ DO

- Always use `useTenant()` to get tenant context
- Check permissions before sensitive operations
- Use `buildTenantQuery()` for automatic filtering
- Log important actions with `logTenantAction()`
- Validate resource access with `requireResourceAccess()`
- Use Feature/Role/Agent gates for UI access control

### ❌ DON'T

- Don't trust client-provided `company_id`
- Don't bypass permission checks
- Don't forget to unsubscribe from real-time channels
- Don't expose sensitive data to unauthorized roles
- Don't skip audit logging for important operations

---

## Troubleshooting

### Issue: "Permission denied"

**Solution**: Check that the user has the required permission using `hasPermission()`.

### Issue: "Access denied: You can only access data from your own company"

**Solution**: Verify that the resource belongs to the user's company or that the user is a super_admin.

### Issue: "Tenant context not available"

**Solution**: Ensure the component is wrapped in `<TenantProvider>`.

---

For more information, see `MULTI_TENANT_COMPLETE_GUIDE.md`.

