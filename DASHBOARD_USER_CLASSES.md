# 👥 Dashboard User Classes - Configuration

## ✅ **User Classes Configured**

Each user represents their class and has a specific dashboard type assigned.

---

## 📊 **User Class Mapping**

### 1. Super Admin → Developer Dashboard

**User**: Adrian Stanca  
**Email**: <adrian.stanca1@gmail.com>  
**Password**: parola123  
**Role**: `super_admin`  
**Company**: ConstructCo (`company-1`)  
**Dashboard**: **Developer Dashboard** (with all features)

**Why this mapping?**

- Super admins need access to all features including developer tools
- Developer Dashboard provides the most comprehensive view
- Includes all ML/AI widgets and analytics
- Unlimited quotas and full access

**Features Available**:

- ✅ DeveloperFocusWidget - Daily priorities and motivation
- ✅ DeveloperMetricsWidget - ML-powered metrics
- ✅ DeveloperInsightsWidget - AI recommendations
- ✅ SDK Workspace - Full access
- ✅ API Analytics - Complete visibility
- ✅ Cost Optimization - All insights
- ✅ Module Management - Full control
- ✅ Sandbox - Unlimited runs
- ✅ All other dashboards accessible

---

### 2. Company Admin → Company Admin Dashboard

**User**: Adrian ASC  
**Email**: <adrian@ascladdingltd.co.uk>  
**Password**: lolozania1  
**Role**: `company_admin`  
**Company**: AS CLADDING AND ROOFING LTD (`company-2`)  
**Dashboard**: **Company Admin Dashboard**

**Why this mapping?**

- Company admins need strategic overview of company operations
- Focus on projects, budgets, and team performance
- ML-powered insights for business decisions
- Company-scoped data visibility

**Features Available**:

- ✅ SmartMetricsWidget - ML-powered company metrics
- ✅ SmartInsightsWidget - AI business recommendations
- ✅ Projects Overview - All company projects
- ✅ Budget Tracking - Financial analytics
- ✅ Team Performance - Employee metrics
- ✅ Risk Assessment - ML predictions
- ✅ Upcoming Deadlines - Task management
- ✅ AI Agents - Business automation
- ✅ Company-scoped data only

---

### 3. Developer → Developer Console

**User**: Developer User
**Email**: <dev@constructco.com>
**Password**: password123
**Role**: `developer`
**Company**: ConstructCo (`company-1`)
**Interface**: **Developer Console** (Interactive Development Environment)

**Why this mapping?**

- Developers need active development tools, not just analytics
- Interactive console for testing code in real-time
- Sandbox environment for experimentation
- API testing interface for debugging
- Development-focused workspace

**Features Available**:

- ✅ **Code Editor** - Write and execute JavaScript code
- ✅ **Console Output** - Real-time execution logs
- ✅ **Sandbox Environment** - Safe code execution
- ✅ **API Tester** - Test endpoints with custom headers/body
- ✅ **Development Tools** - Code snippets, quick actions
- ✅ **Local Storage** - Save/load code
- ✅ **Code Download** - Export code files
- ✅ **Error Handling** - Detailed error messages
- ✅ **Execution Metrics** - Performance tracking
- ✅ **Interactive Console** - Browser DevTools-like experience

---

## 🎯 **Interface Type Summary**

### Developer Dashboard (Analytics)

**Used by**: Super Admin
**Purpose**: Development analytics, API metrics, code quality tracking
**Widgets**:

- DeveloperFocusWidget
- DeveloperMetricsWidget
- DeveloperInsightsWidget

**Key Features**:

- API usage tracking
- Cost analytics
- Sandbox management
- Module development
- Code quality scoring
- Productivity metrics

---

### Developer Console (Active Development)

**Used by**: Developer
**Purpose**: Interactive development environment, code execution, API testing
**Components**:

- Code Editor
- Console Output
- API Tester
- Development Tools

**Key Features**:

- Real-time code execution
- Interactive console
- Sandbox environment
- API endpoint testing
- Code save/load/download
- Error handling
- Performance metrics

---

### Company Admin Dashboard

**Used by**: Company Admin  
**Purpose**: Business overview, strategic insights  
**Widgets**:

- SmartMetricsWidget
- SmartInsightsWidget

**Key Features**:

- Project management
- Budget tracking
- Team performance
- Risk assessment
- Business analytics
- ML predictions

---

### Supervisor Dashboard

**Used by**: Supervisors, Team Leads  
**Purpose**: Team management, task oversight  
**Widgets**:

- SmartMetricsWidget
- SmartInsightsWidget

**Key Features**:

- Task management
- Team oversight
- Project tracking
- Activity monitoring

---

### Operative Dashboard

**Used by**: Workers, Field Staff  
**Purpose**: Daily tasks, simplified interface  
**Widgets**:

- DailyFocusWidget

**Key Features**:

- Daily tasks
- Progress tracking
- Timesheets
- Safety reports
- Simplified UI

---

## 🔄 **How to Switch Users**

### To test different dashboards

1. **Logout** from current user
2. **Login** with different credentials
3. **Navigate** to appropriate dashboard

### Quick Switch Guide

**Want to test Developer Dashboard (Analytics)?**
→ Login as: <adrian.stanca1@gmail.com>

**Want to test Developer Console (Active Development)?**
→ Login as: <dev@constructco.com>

**Want to test Company Admin Dashboard?**
→ Login as: <adrian@ascladdingltd.co.uk>

**Want to test Supervisor Dashboard?**
→ Login as: <mike@constructco.com> (password: password123)

**Want to test Operative Dashboard?**
→ Create operative user or use existing operative account

---

## 📝 **User Database Schema**

```sql
users table:
- id: TEXT PRIMARY KEY
- email: TEXT UNIQUE NOT NULL
- password_hash: TEXT NOT NULL
- name: TEXT NOT NULL
- role: TEXT NOT NULL  -- super_admin, company_admin, developer, supervisor, user
- company_id: TEXT NOT NULL
- created_at: DATETIME
- updated_at: DATETIME
```

---

## 🔧 **How to Add More Users**

### Add a new user class

```javascript
// In server/setup-dashboard-users.js
const hash = await bcrypt.hash('your-password', 10);

db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, company_id)
    VALUES (?, ?, ?, ?, ?, ?)
`).run(
    'user-id',
    'email@example.com',
    hash,
    'User Name',
    'role',  // super_admin, company_admin, developer, supervisor, user
    'company-id'
);
```

### Then run

```bash
node server/setup-dashboard-users.js
```

---

## ✅ **Verification**

To verify users are configured correctly:

```bash
node server/check-database.js
```

Expected output:

```
Users:
- adrian.stanca1@gmail.com (super_admin) → Developer Dashboard
- adrian@ascladdingltd.co.uk (company_admin) → Company Admin Dashboard
- dev@constructco.com (developer) → Developer Dashboard
```

---

## 🎉 **Summary**

**3 User Classes Configured**:

1. ✅ **Super Admin** → Developer Dashboard (analytics & full access)
2. ✅ **Company Admin** → Company Admin Dashboard (business focus)
3. ✅ **Developer** → Developer Console (active development environment)

**All users have**:

- ✅ Correct passwords (bcrypt hashed)
- ✅ Appropriate roles
- ✅ Assigned companies
- ✅ Specific dashboard types
- ✅ ML/AI widgets enabled

**Ready for testing!** 🚀

---

## 📞 **Support**

### To reset users

```bash
node server/setup-dashboard-users.js
```

### To check users

```bash
node server/check-database.js
```

### To update passwords

```bash
node server/update-test-users.js
```

---

**Last Updated**: 2025-01-10  
**Status**: ✅ Configured and Ready
