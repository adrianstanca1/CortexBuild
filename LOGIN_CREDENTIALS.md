# 🔐 CortexBuild - Login Credentials

## 📋 Active Users

### 🔴 Super Admin

```
Email:    adrian.stanca1@gmail.com
Password: parola123
Role:     super_admin
Company:  ConstructCo (company-1)
```

**Access:**

- ✅ Full system access
- ✅ Super Admin Dashboard
- ✅ All admin features
- ✅ User management
- ✅ System settings
- ✅ Database access
- ✅ Developer tools

---

### 🟠 Company Admin #1

```
Email:    adrian@ascladdingltd.co.uk
Password: lolozania1
Role:     company_admin
Company:  ASC Cladding Ltd (company-2)
```

**Access:**

- ✅ Company dashboard
- ✅ User management (company only)
- ✅ Project management
- ✅ Team collaboration
- ✅ Reports & analytics
- ❌ System settings
- ❌ Super admin features

---

### 🟢 Developer

```
Email:    adrian.stanca1@icloud.com
Password: password123
Role:     developer
Company:  ConstructCo (company-1)
```

**Access:**

- ✅ Developer Console
- ✅ Code Editor
- ✅ API Builder
- ✅ Testing Framework
- ✅ Git Integration
- ✅ SDK Access
- ❌ Admin features
- ❌ User management

---

### 🔵 Company Admin #2

```
Email:    casey@constructco.com
Password: admin123
Role:     company_admin
Company:  ConstructCo (company-1)
```

**Access:**

- ✅ Company dashboard
- ✅ User management (company only)
- ✅ Project management
- ✅ Team collaboration
- ✅ Reports & analytics

---

### 🟡 Supervisor

```
Email:    mike@constructco.com
Password: admin123
Role:     supervisor
Company:  ConstructCo (company-1)
```

**Access:**

- ✅ Project dashboard
- ✅ Task management
- ✅ Team view
- ✅ Reports
- ❌ User management
- ❌ Admin features

---

## 🚀 Quick Start

### 1. Start the Application

```bash
# Start backend server
npm run server

# Start frontend (in another terminal)
npm run dev
```

### 2. Access the Application

```
URL: http://localhost:3000
```

### 3. Login

Choose one of the accounts above based on what you want to test.

---

## 🎯 Testing Different Roles

### Test Super Admin Features

1. Login as: `adrian.stanca1@gmail.com` / `parola123`
2. You'll see: Super Admin Dashboard
3. Access to: All system features

### Test Company Admin Features

1. Login as: `adrian@ascladdingltd.co.uk` / `lolozania1`
2. You'll see: Company Dashboard
3. Access to: Company-specific features

### Test Developer Features

1. Login as: `adrian.stanca1@icloud.com` / `password123`
2. You'll see: Developer Console
3. Access to: Development tools

---

## 📊 Database Information

### Database File

```
Location: /Users/admin/CortexBuild/cortexbuild.db
Type:     SQLite
Size:     ~508KB
```

### Tables Created

- ✅ users (5 users)
- ✅ companies (3 companies)
- ✅ projects (3 projects)
- ✅ user_dashboards (custom dashboards)
- ✅ dashboard_widgets (dashboard widgets)
- ✅ 40+ other tables

---

## 🔒 Security Notes

### Password Hashing

- All passwords are hashed using **bcrypt** (10 rounds)
- Passwords are stored in `password_hash` column
- Never stored in plain text

### Session Management

- JWT tokens with 24h expiry
- Secure session storage
- Auto-logout on token expiry

### Role-Based Access Control (RBAC)

- Permissions checked on every request
- UI elements hidden based on role
- API endpoints protected by middleware

---

## 🛠️ Troubleshooting

### Can't Login?

1. Check server is running: `lsof -ti:5000`
2. Check database exists: `ls -lah cortexbuild.db`
3. Verify user exists: `sqlite3 cortexbuild.db "SELECT email, role FROM users;"`
4. Check password hash: Run `node server/update-passwords.js` again

### Wrong Dashboard?

- Each role sees different dashboard
- Super Admin → Super Admin Dashboard
- Company Admin → Company Dashboard
- Developer → Developer Console
- Supervisor → Project Dashboard

### Database Issues?

```bash
# Check database integrity
sqlite3 cortexbuild.db "PRAGMA integrity_check;"

# View all tables
sqlite3 cortexbuild.db ".tables"

# View users
sqlite3 cortexbuild.db "SELECT * FROM users;"
```

---

## 📝 Notes

- **Super Admin** has access to everything
- **Company Admin** can only manage their company
- **Developer** has access to development tools
- **Supervisor** can manage projects and tasks
- All users can see their own dashboard

---

## 🔄 Reset Passwords

If you need to reset passwords, run:

```bash
node server/update-passwords.js
```

This will reset all passwords to the values listed above.

---

## ✅ Status

**Database:** ✅ Active and populated
**Users:** ✅ 5 users configured
**Passwords:** ✅ Updated and working
**Dashboards:** ✅ Tables created
**Server:** ✅ Running on port 5000
**Frontend:** ✅ Running on port 3000

---

**Last Updated:** 2025-10-10
**Database Version:** 1.0.0 GOLDEN
