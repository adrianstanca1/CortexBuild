# Phase 6: React Component Integration Guide

## Overview

This guide shows how to integrate each React component with the new database tables and RPC functions created in Phase 5.

---

## Component Integration Map

| Component | Database Table | RPC Functions | Status |
|-----------|----------------|---------------|--------|
| **CompanyAdminDashboardNew** | Multiple | Multiple | ⏳ TODO |
| **DepartmentManagement** | departments | create_department, update_department_budget | ⏳ TODO |
| **RoleManagement** | custom_roles | - | ⏳ TODO |
| **TeamManagement** | department_members, users | invite_team_member, update_team_member_role | ⏳ TODO |
| **CompanyAnalytics** | company_analytics | get_company_analytics | ⏳ TODO |
| **CompanySettings** | company_settings, api_keys, webhooks | create_api_key | ⏳ TODO |
| **RoleSelector** | custom_roles | - | ✅ DONE |
| **DepartmentSelector** | departments | - | ✅ DONE |

---

## 1. CompanyAdminDashboardNew Integration

### Current State
- Fetches team count from users table
- Fetches subscription status from subscriptions table
- Displays hardcoded metrics

### Integration Tasks
- [ ] Fetch department count from `departments` table
- [ ] Fetch custom roles count from `custom_roles` table
- [ ] Fetch analytics from `company_analytics` table
- [ ] Display real-time metrics
- [ ] Add quick action buttons for new features

### Code Changes Required
```typescript
// Add to useEffect
const [departmentCount, setDepartmentCount] = useState(0);
const [rolesCount, setRolesCount] = useState(0);
const [analyticsData, setAnalyticsData] = useState(null);

// Fetch departments
const { data: depts } = await supabase
    .from('departments')
    .select('id')
    .eq('company_id', currentUser.companyId);
setDepartmentCount(depts?.length || 0);

// Fetch roles
const { data: roles } = await supabase
    .from('custom_roles')
    .select('id')
    .eq('company_id', currentUser.companyId);
setRolesCount(roles?.length || 0);

// Fetch analytics
const { data: analytics } = await supabase
    .rpc('get_company_analytics', {
        p_company_id: currentUser.companyId
    });
setAnalyticsData(analytics?.[0]);
```

---

## 2. DepartmentManagement Integration

### Current State
- Displays mock departments
- Add/edit/delete functionality (local state)

### Integration Tasks
- [ ] Replace mock data with real data from `departments` table
- [ ] Use `create_department()` RPC for creating departments
- [ ] Use `update_department_budget()` RPC for updating budgets
- [ ] Implement real delete functionality
- [ ] Add member count from `department_members` table

### Code Changes Required
```typescript
// Load departments
const loadDepartments = async () => {
    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('company_id', currentUser.companyId);
    if (error) throw error;
    setDepartments(data || []);
};

// Create department
const handleCreate = async (formData) => {
    const result = await supabase.rpc('create_department', {
        p_company_id: currentUser.companyId,
        p_name: formData.name,
        p_description: formData.description,
        p_budget: formData.budget,
        p_manager_id: formData.manager_id
    });
    if (result.error) throw result.error;
    await loadDepartments();
};

// Update budget
const handleUpdateBudget = async (deptId, newBudget) => {
    const result = await supabase.rpc('update_department_budget', {
        p_department_id: deptId,
        p_new_budget: newBudget
    });
    if (result.error) throw result.error;
    await loadDepartments();
};
```

---

## 3. RoleManagement Integration

### Current State
- Displays mock roles
- Add/edit/delete functionality (local state)

### Integration Tasks
- [ ] Replace mock data with real data from `custom_roles` table
- [ ] Implement create role functionality
- [ ] Implement update role functionality
- [ ] Implement delete role functionality
- [ ] Track user count per role

### Code Changes Required
```typescript
// Load roles
const loadRoles = async () => {
    const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('company_id', currentUser.companyId);
    if (error) throw error;
    setRoles(data || []);
};

// Create role
const handleCreateRole = async (formData) => {
    const { data, error } = await supabase
        .from('custom_roles')
        .insert({
            company_id: currentUser.companyId,
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions
        });
    if (error) throw error;
    await loadRoles();
};

// Delete role
const handleDeleteRole = async (roleId) => {
    const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', roleId);
    if (error) throw error;
    await loadRoles();
};
```

---

## 4. TeamManagement Integration

### Current State
- Displays mock team members
- Add/remove functionality (local state)

### Integration Tasks
- [ ] Replace mock data with real data from `users` table
- [ ] Use `invite_team_member()` RPC for inviting members
- [ ] Use `update_team_member_role()` RPC for role changes
- [ ] Implement real delete functionality
- [ ] Show department assignments from `department_members` table

### Code Changes Required
```typescript
// Load team members
const loadTeamMembers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', currentUser.companyId);
    if (error) throw error;
    setTeamMembers(data || []);
};

// Invite team member
const handleInviteMember = async (email, role) => {
    const result = await supabase.rpc('invite_team_member', {
        p_company_id: currentUser.companyId,
        p_email: email,
        p_role: role
    });
    if (result.error) throw result.error;
    await loadTeamMembers();
};

// Update role
const handleUpdateRole = async (userId, newRole) => {
    const result = await supabase.rpc('update_team_member_role', {
        p_user_id: userId,
        p_new_role: newRole
    });
    if (result.error) throw result.error;
    await loadTeamMembers();
};
```

---

## 5. CompanyAnalytics Integration

### Current State
- Displays mock analytics data
- Export to PDF/CSV (local data)

### Integration Tasks
- [ ] Replace mock data with real data from `company_analytics` table
- [ ] Use `get_company_analytics()` RPC for date range queries
- [ ] Implement real export functionality
- [ ] Add date range filtering
- [ ] Display real metrics

### Code Changes Required
```typescript
// Load analytics
const loadAnalytics = async (startDate, endDate) => {
    const { data, error } = await supabase.rpc('get_company_analytics', {
        p_company_id: currentUser.companyId,
        p_start_date: startDate,
        p_end_date: endDate
    });
    if (error) throw error;
    setAnalytics(data || []);
};

// Use DateRangeFilter
const handleDateRangeChange = (range) => {
    loadAnalytics(range.start, range.end);
};
```

---

## 6. CompanySettings Integration

### Current State
- Displays mock settings
- Tabs for different settings sections

### Integration Tasks
- [ ] Load settings from `company_settings` table
- [ ] Load API keys from `api_keys` table
- [ ] Load webhooks from `webhooks` table
- [ ] Implement save functionality for each tab
- [ ] Use `create_api_key()` RPC for generating keys

### Code Changes Required
```typescript
// Load settings
const loadSettings = async () => {
    const { data: settings } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', currentUser.companyId)
        .single();
    
    const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('*')
        .eq('company_id', currentUser.companyId);
    
    const { data: webhooks } = await supabase
        .from('webhooks')
        .select('*')
        .eq('company_id', currentUser.companyId);
    
    setSettings(settings);
    setApiKeys(apiKeys || []);
    setWebhooks(webhooks || []);
};

// Save settings
const handleSaveSettings = async (updatedSettings) => {
    const { error } = await supabase
        .from('company_settings')
        .upsert({
            company_id: currentUser.companyId,
            ...updatedSettings
        });
    if (error) throw error;
    toast.success('Settings saved');
};

// Create API key
const handleCreateApiKey = async (keyName) => {
    const apiKey = `sk_${Math.random().toString(36).substr(2, 32)}`;
    const result = await supabase.rpc('create_api_key', {
        p_company_id: currentUser.companyId,
        p_key_name: keyName,
        p_key_value: apiKey
    });
    if (result.error) throw result.error;
    await loadSettings();
};
```

---

## 7. RoleSelector Verification

### Current State
- Already fetches from `custom_roles` table
- Displays roles with permissions

### Verification Tasks
- [ ] Test that roles load correctly
- [ ] Test search/filter functionality
- [ ] Test multi-select mode
- [ ] Test permissions tooltip
- [ ] Verify RLS policies allow access

---

## 8. DepartmentSelector Verification

### Current State
- Already fetches from `departments` table
- Displays departments with stats

### Verification Tasks
- [ ] Test that departments load correctly
- [ ] Test search/filter functionality
- [ ] Test multi-select mode
- [ ] Test stats tooltip
- [ ] Verify RLS policies allow access

---

## Integration Checklist

### Phase 6 Component Integration
- [ ] CompanyAdminDashboardNew - Integrated with real data
- [ ] DepartmentManagement - Connected to departments table
- [ ] RoleManagement - Connected to custom_roles table
- [ ] TeamManagement - Connected to users and department_members tables
- [ ] CompanyAnalytics - Connected to company_analytics table
- [ ] CompanySettings - Connected to company_settings, api_keys, webhooks tables
- [ ] RoleSelector - Verified working
- [ ] DepartmentSelector - Verified working

### Testing
- [ ] All CRUD operations tested
- [ ] RLS policies verified
- [ ] Error handling tested
- [ ] Loading states tested
- [ ] Responsive design verified

### Build & Deploy
- [ ] npm run build successful
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Deployed to Vercel (optional)

---

## Common Integration Patterns

### Pattern 1: Load Data on Mount
```typescript
useEffect(() => {
    loadData();
}, [currentUser.companyId]);
```

### Pattern 2: Handle Errors with Toast
```typescript
try {
    await operation();
    toast.success('Operation successful');
} catch (error) {
    console.error(error);
    toast.error(error.message);
}
```

### Pattern 3: Update Local State After RPC
```typescript
const result = await supabase.rpc('function_name', params);
if (result.error) throw result.error;
await loadData(); // Refresh data
```

### Pattern 4: Use RLS for Data Isolation
```typescript
// RLS automatically filters by company_id
const { data } = await supabase
    .from('table_name')
    .select('*')
    .eq('company_id', currentUser.companyId);
```

