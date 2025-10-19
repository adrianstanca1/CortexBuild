# 🔐 CortexBuild - Login Credentials

## 📋 Active Demo Account (NEW - Supabase)

### 🟢 Demo Company Admin

```
Email:    demo@cortexbuild.ai
Password: demo1234
Role:     company_admin
Company:  company-1
User ID:  user-292a5961-8021-4948-b4bd-c8a4ac8b052a
```

**Access:**

- ✅ UK Tender Assistant (6 sample tenders)
- ✅ Company Dashboard
- ✅ Innovation Sandbox
- ✅ All company admin features
- ✅ Bid generation and management

**Created**: October 19, 2025
**Backend**: Supabase PostgreSQL + bcrypt
**Status**: ✅ WORKING

---

## 📋 Legacy Users (SQLite - May Not Work with Supabase)

### 🔴 Super Admin

```
Email:    adrian.stanca1@gmail.com
Password: parola123
Role:     super_admin
Company:  ConstructCo (company-1)
```

⚠️ **Note**: This account was from the old SQLite database. May not exist in Supabase.

---

### 🟠 Company Admin #1

```
Email:    adrian@ascladdingltd.co.uk
Password: lolozania1
Role:     company_admin
Company:  ASC Cladding Ltd (company-2)
```

⚠️ **Note**: This account was from the old SQLite database. May not exist in Supabase.

---

### 🟢 Developer

```
Email:    adrian.stanca1@icloud.com
Password: password123
Role:     developer
Company:  ConstructCo (company-1)
```

⚠️ **Note**: This account was from the old SQLite database. May not exist in Supabase.

---

## 🚀 Quick Start

### 1. Start the Application

```bash
# Start both frontend and backend
npm run dev:all

# Or start separately:
npm run server    # Backend on port 3001
npm run dev       # Frontend on port 3000
```

### 2. Access the Application

```
Frontend: http://localhost:3000
Backend API: http://localhost:3001
```

### 3. Login

Use the demo account:
- Email: `demo@cortexbuild.ai`
- Password: `demo1234`

### 4. Test UK Tender Assistant

1. After login, click "UK Tender Assistant" in the sidebar
2. View 6 sample UK construction tenders (£74M total value)
3. Search and filter by region, sector, value range
4. Click "View Details" on any tender
5. Click "Generate AI Bid" to create a bid

## 🧪 API Testing

### Test Login via API

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@cortexbuild.ai",
    "password": "demo1234"
  }'
```

### Test UK Tender Endpoints

```bash
# Get all tenders
curl http://localhost:3001/api/tenders

# Get tender statistics
curl http://localhost:3001/api/tenders/stats/overview

# Generate AI bid for a tender
curl -X POST http://localhost:3001/api/tenders/tender-001/generate-bid \
  -H "x-company-id: company-1"
```

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
