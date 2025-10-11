# CortexBuild Demo Credentials

## 🔐 User Accounts

All demo users have been seeded in the database. Use these credentials to test different roles and features.

---

## 👤 Demo Users

### 1. **Super Admin** (Full Platform Control)

```
Email:    adrian.stanca1@gmail.com
Password: Cumparavinde1
Role:     super_admin
Company:  ASC Cladding Ltd
```

**Access:**

- Super Admin Dashboard (12 sections)
- Platform-wide control
- User management
- Company management
- System settings
- Analytics & reports
- Marketplace management

---

### 2. **Company Admin** (Company-Wide Control)

```
Email:    adrian@ascladdingltd.co.uk
Password: lolozania1
Role:     company_admin
Company:  ASC Cladding Ltd
```

**Access:**

- Company Admin Dashboard (15 sections)
- Office Operations (7 sections)
- Field Operations (8 sections)
- Team management
- Project management
- Financial management
- Reports & analytics

---

### 3. **Developer #1** (Adrian Stanca)

```
Email:    adrian.stanca1@icloud.com
Password: password123
Role:     developer
Company:  ASC Cladding Ltd
```

**Access:**

- Developer Dashboard V2 (10 tools)
- **🆕 Codex Agent** (GPT-5-Codex AI assistant)
- Code Editor
- SDK Developer
- API Builder
- Database Tools
- Testing Framework
- Marketplace (browse & publish apps)
- Documentation

---

### 4. **Developer #2** (Dev User)

```
Email:    dev@constructco.com
Password: password123
Role:     developer
Company:  ASC Cladding Ltd
```

**Access:**

- Developer Dashboard V2 (10 tools)
- **🆕 Codex Agent** (GPT-5-Codex AI assistant)
- Code Editor
- SDK Developer
- API Builder
- Database Tools
- Testing Framework
- Marketplace (browse & publish apps)
- Documentation

---

### 6. **Regular User** (Standard Access)

```
Email:    john.doe@ascladdingltd.co.uk
Password: password123
Role:     user
Company:  ASC Cladding Ltd
```

**Access:**

- User Dashboard
- Assigned projects
- Tasks & milestones
- Time tracking
- Document access
- Basic reports

---

### 7. **Field User** (Field Operations)

```
Email:    jane.smith@ascladdingltd.co.uk
Password: password123
Role:     user
Company:  ASC Cladding Ltd
```

**Access:**

- Field Dashboard
- Daily site logs
- Safety reports
- Quality control
- Equipment tracking
- Time tracking
- Mobile-optimized interface

---

## 🚀 Quick Start

### **1. Access the Application**

```
Frontend: http://localhost:3000/
Backend:  http://localhost:3001/
```

### **2. Login**

1. Open <http://localhost:3000/>
2. Choose a user from the list above
3. Enter email and password
4. Click "Login"

### **3. Test Codex Agent (Developer Only)**

1. Login as Developer (<adrian.stanca1@icloud.com> / password123)
2. Navigate to Developer Dashboard V2
3. Click **"Codex Agent"** tool card
4. Start chatting with GPT-5-Codex!

**Quick Actions:**

- "Explore this repository"
- "Propose improvements"
- "Review recent changes"
- "Run all tests"

---

## 🏢 Demo Companies

### **ASC Cladding Ltd**

```
ID:       company-1
Industry: Construction
Users:    5 users (all roles)
Projects: 3 active projects
```

### **BuildRight Construction**

```
ID:       company-2
Industry: Construction
Users:    0 users (empty company for testing)
Projects: 0 projects
```

---

## 📦 Pre-Approved Marketplace Apps

All users have access to these 6 apps:

1. **Project Dashboard** (Analytics)
   - Real-time project metrics
   - Progress tracking
   - Team performance

2. **Team Chat** (Communication)
   - Real-time messaging
   - File sharing
   - @mentions

3. **Time Tracker** (Productivity)
   - Time logging
   - Timesheet management
   - Billing integration

4. **Team Calendar** (Productivity)
   - Shared calendar
   - Event scheduling
   - Reminders

5. **Task Manager** (Productivity)
   - Task creation
   - Assignment
   - Progress tracking

6. **Expense Tracker** (Finance)
   - Expense logging
   - Receipt upload
   - Approval workflow

---

## 🔧 API Testing

### **Login Endpoint**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adrian.stanca1@gmail.com",
    "password": "Cumparavinde1"
  }'
```

### **Get Current User**

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Get Marketplace Apps**

```bash
curl http://localhost:3001/api/global-marketplace/apps
```

---

## 🎯 Feature Testing Checklist

### **Super Admin Features**

- [ ] User management (create, edit, delete)
- [ ] Company management
- [ ] System settings
- [ ] Platform analytics
- [ ] Marketplace app approval

### **Company Admin Features**

- [ ] Team management
- [ ] Project creation
- [ ] Financial reports
- [ ] Office operations
- [ ] Field operations

### **Developer Features**

- [ ] **Codex Agent** (NEW!)
- [ ] Code Editor
- [ ] SDK Developer
- [ ] API testing
- [ ] Database queries
- [ ] App publishing

### **User Features**

- [ ] Project access
- [ ] Task management
- [ ] Time tracking
- [ ] Document viewing
- [ ] Reports

---

## 🆕 Latest Features (Commit: 10b3442)

### **OpenAI Codex SDK Integration**

✅ Codex Agent with GPT-5-Codex  
✅ Thread-based conversations  
✅ Code generation & preview  
✅ File change tracking  
✅ Supabase persistence  

**Access:** Developer Dashboard V2 → Codex Agent

---

## 📝 Notes

- All passwords are stored as plain text in development (for demo purposes)
- In production, passwords should be hashed with bcrypt
- JWT tokens expire after 24 hours
- Session data is stored in localStorage
- Database file: `cortexbuild.db` (SQLite)

---

## 🔄 Reset Database

If you need to reset the database to default state:

```bash
# Stop backend
# Delete database
rm -f cortexbuild.db cortexbuild.db-shm cortexbuild.db-wal

# Restart backend (will recreate database with seed data)
npm run server
```

---

## 🎉 Happy Testing

For more information, see:

- `docs/PLATFORM_ARCHITECTURE.md` - Platform overview
- `docs/ACCESS_CONTROL_MATRIX.md` - RBAC details
- `docs/DATABASE_SCHEMA.md` - Database structure
- `docs/CODEX_SDK_INTEGRATION.md` - Codex Agent guide
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `SUPABASE_MIGRATION.md` - Supabase setup

---

**Repository:** <https://github.com/adrianstanca1/CortexBuild>  
**Latest Commit:** 10b3442 (OpenAI Codex SDK Integration)
