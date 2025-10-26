# 🔒 Access Control Matrix - CortexBuild Platform

## Complete Role-Based Access Control (RBAC) System

---

## 👥 USER ROLES

| Role | Code | Description | Access Level |
|------|------|-------------|--------------|
| **Super Admin** | `super_admin` | Platform administrator | Platform-wide |
| **Company Admin** | `company_admin` | Company owner/client | Company-wide |
| **Developer** | `developer` | Technical developer | Development tools |
| **Supervisor** | `supervisor` | Field supervisor | Field operations |
| **Worker** | `worker` | Field worker | Limited field access |

---

## 🎯 DASHBOARD ACCESS

| Dashboard | Super Admin | Company Admin | Developer | Supervisor | Worker |
|-----------|-------------|---------------|-----------|------------|--------|
| **Super Admin Dashboard** | ✅ Full | ❌ No | ❌ No | ❌ No | ❌ No |
| **Company Admin Dashboard** | ✅ View All | ✅ Own Company | ❌ No | ❌ No | ❌ No |
| **Developer Dashboard** | ✅ Full | ❌ No | ✅ Full | ❌ No | ❌ No |
| **Supervisor Dashboard** | ✅ View All | ✅ View Company | ❌ No | ✅ Full | ❌ No |
| **Worker Dashboard** | ✅ View All | ✅ View Company | ❌ No | ✅ View | ✅ Full |

---

## 📊 PLATFORM ADMINISTRATION

| Feature | Super Admin | Company Admin | Developer | Supervisor | Worker |
|---------|-------------|---------------|-----------|------------|--------|
| **User Management (All)** | ✅ CRUD | ❌ No | ❌ No | ❌ No | ❌ No |
| **User Management (Company)** | ✅ CRUD | ✅ CRUD | ❌ No | 👁️ View | ❌ No |
| **Company Management (All)** | ✅ CRUD | ❌ No | ❌ No | ❌ No | ❌ No |
| **Company Management (Own)** | ✅ CRUD | ✅ RU | ❌ No | ❌ No | ❌ No |
| **Platform Settings** | ✅ Full | ❌ No | ❌ No | ❌ No | ❌ No |
| **Company Settings** | ✅ All | ✅ Own | ❌ No | ❌ No | ❌ No |
| **Platform Billing** | ✅ Full | ❌ No | ❌ No | ❌ No | ❌ No |
| **Company Billing** | ✅ All | ✅ Own | ❌ No | ❌ No | ❌ No |
| **Security & Audit** | ✅ Full | 👁️ Own | ❌ No | ❌ No | ❌ No |
| **Database Management** | ✅ Full | 👁️ Own | 👁️ Query | ❌ No | ❌ No |
| **Integrations** | ✅ Full | ✅ Own | ❌ No | ❌ No | ❌ No |
| **Permissions** | ✅ Full | ✅ Own | ❌ No | ❌ No | ❌ No |
| **Notifications** | ✅ Full | ✅ Own | 👁️ View | 👁️ View | 👁️ View |

**Legend:** ✅ Full Access | CRUD = Create/Read/Update/Delete | RU = Read/Update | 👁️ View Only | ❌ No Access

---

## 🏢 OFFICE OPERATIONS

| Feature | Super Admin | Company Admin | Developer | Supervisor | Worker |
|---------|-------------|---------------|-----------|------------|--------|
| **Project Management** | ✅ All | ✅ Company | ❌ No | ✅ RU | 👁️ View |
| **Team Management** | ✅ All | ✅ Company | ❌ No | ✅ RU | ❌ No |
| **Document Management** | ✅ All | ✅ Company | ❌ No | ✅ CRUD | 👁️ View |
| **Analytics & Reports** | ✅ Platform | ✅ Company | ❌ No | 👁️ Company | ❌ No |
| **Communication** | ✅ All | ✅ Company | ❌ No | ✅ Company | ✅ Team |
| **Resource Allocation** | ✅ All | ✅ Company | ❌ No | ✅ RU | ❌ No |
| **Budget Management** | ✅ All | ✅ Company | ❌ No | 👁️ View | ❌ No |
| **Client Management** | ✅ All | ✅ Company | ❌ No | 👁️ View | ❌ No |
| **Vendor Management** | ✅ All | ✅ Company | ❌ No | ✅ RU | ❌ No |
| **Contract Management** | ✅ All | ✅ Company | ❌ No | 👁️ View | ❌ No |

---

## 🏗️ FIELD OPERATIONS

| Feature | Super Admin | Company Admin | Developer | Supervisor | Worker |
|---------|-------------|---------------|-----------|------------|--------|
| **Daily Site Logs** | ✅ All | ✅ Company | ❌ No | ✅ CRUD | ✅ CR |
| **Safety Incident Reports** | ✅ All | ✅ Company | ❌ No | ✅ CRUD | ✅ CR |
| **Quality Control** | ✅ All | ✅ Company | ❌ No | ✅ CRUD | 👁️ View |
| **Time Tracking** | ✅ All | ✅ Company | ❌ No | ✅ CRU | ✅ CR |
| **Photo Documentation** | ✅ All | ✅ Company | ❌ No | ✅ CRUD | ✅ CR |
| **Equipment Tracking** | ✅ All | ✅ Company | ❌ No | ✅ RU | 👁️ View |
| **Material Procurement** | ✅ All | ✅ Company | ❌ No | ✅ CRU | 👁️ View |
| **Progress Updates** | ✅ All | ✅ Company | ❌ No | ✅ CRUD | ✅ CR |
| **Issue Reporting (RFIs)** | ✅ All | ✅ Company | ❌ No | ✅ CRUD | ✅ CR |
| **Punch Lists** | ✅ All | ✅ Company | ❌ No | ✅ CRUD | 👁️ View |
| **Weather Logging** | ✅ All | ✅ Company | ❌ No | ✅ CRUD | ✅ CR |
| **GPS Clock In/Out** | ✅ All | ✅ Company | ❌ No | ✅ View | ✅ Own |

**Legend:** CR = Create/Read | CRU = Create/Read/Update

---

## 💻 DEVELOPMENT TOOLS

| Feature | Super Admin | Company Admin | Developer | Supervisor | Worker |
|---------|-------------|---------------|-----------|------------|--------|
| **Code Editor** | ✅ Full | ❌ No | ✅ Full | ❌ No | ❌ No |
| **Terminal** | ✅ Full | ❌ No | ✅ Full | ❌ No | ❌ No |
| **Git Integration** | ✅ Full | ❌ No | ✅ Full | ❌ No | ❌ No |
| **API Builder** | ✅ Full | ❌ No | ✅ Full | ❌ No | ❌ No |
| **Database Tools** | ✅ Full | 👁️ Own | 👁️ Query | ❌ No | ❌ No |
| **Testing Framework** | ✅ Full | ❌ No | ✅ Full | ❌ No | ❌ No |
| **Package Manager** | ✅ Full | ❌ No | ✅ Full | ❌ No | ❌ No |
| **Documentation** | ✅ Full | 👁️ View | ✅ Full | 👁️ View | 👁️ View |
| **Deployment** | ✅ Full | ❌ No | ✅ Full | ❌ No | ❌ No |

---

## 📱 MOBILE APPS

| App | Super Admin | Company Admin | Developer | Supervisor | Worker |
|-----|-------------|---------------|-----------|------------|--------|
| **Daily Log App** | ✅ All | ✅ Company | ❌ No | ✅ Full | ✅ Own |
| **Safety Report App** | ✅ All | ✅ Company | ❌ No | ✅ Full | ✅ Own |
| **Quality Control App** | ✅ All | ✅ Company | ❌ No | ✅ Full | 👁️ View |
| **Time Tracking App** | ✅ All | ✅ Company | ❌ No | ✅ View | ✅ Own |
| **Photo Upload App** | ✅ All | ✅ Company | ❌ No | ✅ Full | ✅ Own |

---

## 🔐 DATA SCOPE

### Super Admin
- **Scope:** Platform-wide
- **Access:** All companies, all users, all projects, all data
- **Limitations:** None

### Company Admin
- **Scope:** Company-wide
- **Access:** Own company users, projects, data only
- **Limitations:** Cannot access other companies' data or platform settings

### Developer
- **Scope:** Development environment
- **Access:** Code, APIs, databases (query only), documentation
- **Limitations:** No access to business data, users, or operations

### Supervisor
- **Scope:** Company field operations
- **Access:** Company projects, teams, field operations
- **Limitations:** No billing, no platform settings, no other companies

### Worker
- **Scope:** Own activities
- **Access:** Own time logs, safety reports, assigned tasks
- **Limitations:** Cannot manage others, limited to own data

---

## 🎯 PERMISSION ACTIONS

| Action | Description | Example |
|--------|-------------|---------|
| **Create (C)** | Add new records | Create new project, user, report |
| **Read (R)** | View existing records | View projects, users, reports |
| **Update (U)** | Modify existing records | Edit project details, update status |
| **Delete (D)** | Remove records | Delete user, remove project |
| **Manage (M)** | Full control | All CRUD + settings + permissions |

---

## 🚦 ACCESS LEVELS

| Level | Description | Roles |
|-------|-------------|-------|
| **Platform** | Access to all data across all companies | Super Admin |
| **Company** | Access to all data within own company | Company Admin, Supervisor |
| **Own** | Access to own data only | Developer, Worker |
| **None** | No access | - |

---

## ✅ IMPLEMENTATION

### Authentication
```typescript
// Check if user is authenticated
if (!user) redirect('/login');

// Check user role
const userRole = user.role; // 'super_admin' | 'company_admin' | 'developer' | 'supervisor' | 'worker'
```

### Authorization
```typescript
import { hasPermission, canAccessDashboard, canAccessFeature } from '@/lib/rbac/permissions';

// Check permission
if (hasPermission(userRole, 'users', 'create', 'company')) {
    // Allow user creation
}

// Check dashboard access
if (canAccessDashboard(userRole, 'super-admin-dashboard')) {
    // Show dashboard
}

// Check feature access
if (canAccessFeature(userRole, 'code-editor')) {
    // Show code editor
}
```

### Data Filtering
```typescript
// Super Admin - See all
const projects = await db.projects.findAll();

// Company Admin - See company only
const projects = await db.projects.findAll({
    where: { company_id: user.company_id }
});

// Worker - See own only
const timeLogs = await db.time_logs.findAll({
    where: { user_id: user.id }
});
```

---

## 📊 STATISTICS

- **Total Roles:** 5
- **Total Dashboards:** 5
- **Total Features:** 50+
- **Total Permissions:** 100+
- **Access Levels:** 4
- **Permission Actions:** 5

---

**Last Updated:** 2025-10-10
**Version:** 1.0.0
**Status:** ✅ IMPLEMENTED

