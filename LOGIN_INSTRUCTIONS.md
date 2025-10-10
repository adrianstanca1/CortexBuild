# 🔐 Login Instructions - CortexBuild

## ✅ **Login is now working!**

---

## 🚀 **Quick Start**

### 1. Make sure both servers are running

```bash
npm run dev:all
```

This will start:

- **Frontend**: <http://localhost:3000/>
- **Backend**: <http://localhost:3001/>

### 2. Open your browser

```
http://localhost:3000/
```

### 3. Login with one of the test accounts

---

## 👥 **Dashboard User Classes**

Each user represents their class and has a specific dashboard type:

### 1. Super Admin → Developer Dashboard

```
Email: adrian.stanca1@gmail.com
Password: password123
```

**User Class**: Super Admin
**Dashboard Type**: Developer Dashboard (with all features)
**Company**: ConstructCo

**Access**:

- ✅ Developer Dashboard with full features
- ✅ All ML/AI widgets
- ✅ Unlimited quotas
- ✅ Super admin privileges
- ✅ Can access all dashboards

**Recommended for**: Testing Developer Dashboard with full access

---

### 2. Company Admin → Company Admin Dashboard

```
Email: adrian@ascladdingltd.co.uk
Password: lolozania1
```

**User Class**: Company Admin
**Dashboard Type**: Company Admin Dashboard
**Company**: AS CLADDING AND ROOFING LTD

**Access**:

- ✅ Company Admin Dashboard
- ✅ SmartMetricsWidget
- ✅ SmartInsightsWidget
- ✅ Company-scoped data
- ✅ Standard quotas

**Recommended for**: Testing Company Admin Dashboard

---

### 3. Developer → Developer Console

```
Email: dev@constructco.com
Password: parola123
```

**User Class**: Developer
**Dashboard Type**: Developer Dashboard
**Company**: ConstructCo

**Access**:

- ✅ Developer Dashboard
- ✅ DeveloperFocusWidget
- ✅ DeveloperMetricsWidget
- ✅ DeveloperInsightsWidget
- ✅ SDK Workspace
- ✅ Personal analytics
- ✅ Limited quotas (10 sandbox runs/day)

**Recommended for**: Testing Developer Dashboard with standard access

---

## 🔧 **Troubleshooting**

### Login not working?

#### 1. Check if both servers are running

```bash
# You should see output from both frontend and backend
npm run dev:all
```

Expected output:

```
[0] VITE v6.3.6  ready in 182 ms
[0] ➜  Local:   http://localhost:3000/
[1] 🚀 CortexBuild AI Platform Server
[1] ✅ Server running on http://localhost:3001
```

#### 2. Check if users exist in database

```bash
node server/update-test-users.js
```

This will verify and update all test users.

#### 3. Clear browser cache

- Press `Ctrl+Shift+Delete` (Windows/Linux)
- Press `Cmd+Shift+Delete` (Mac)
- Clear cookies and cache
- Refresh page

#### 4. Check console for errors

- Press `F12` to open Developer Tools
- Go to Console tab
- Look for any red errors
- Check Network tab for failed API calls

---

## 📊 **What to Test**

### After Login as Super Admin

1. ✅ Navigate to Developer Dashboard
2. ✅ Verify all 3 widgets display:
   - DeveloperFocusWidget (header)
   - DeveloperMetricsWidget (metrics)
   - DeveloperInsightsWidget (insights)
3. ✅ Check that metrics show data
4. ✅ Verify insights are generated
5. ✅ Test "Refresh Data" button

### After Login as Developer

1. ✅ Navigate to Developer Dashboard
2. ✅ Verify personalized greeting
3. ✅ Check priority task
4. ✅ Verify code quality and productivity scores
5. ✅ Test SDK Workspace access

---

## 🔄 **Reset Database (if needed)**

If you need to reset the database:

```bash
# Stop servers
# Delete database file
rm cortexbuild.db cortexbuild.db-shm cortexbuild.db-wal

# Restart servers (will recreate database)
npm run dev:all

# Add test users
node server/update-test-users.js
```

---

## 📝 **Notes**

### Password Hashes

All passwords are securely hashed using bcrypt with 10 rounds:

- `parola123` → `$2b$10$DRNY1m5Ht2NprGvrnvkefObctlBmF4lYRfh6bv8I3Ayp/i6IwP5qW`
- `lolozania1` → `$2b$10$ZT8F562b27NxXiw10KYZMuMDfGR2oChv4Fw5HHVL1QhxHBXy5/vbu`
- `password123` → `$2b$10$Ri1Vt/60hAte7/x0j9Aiv.OCNXB5DLVCAsh1eByE7idr7wSnA7ODS`

### Database Location

```
/Users/admin/CortexBuild/cortexbuild.db
```

### API Endpoints

```
POST http://localhost:3001/api/auth/login
POST http://localhost:3001/api/auth/register
POST http://localhost:3001/api/auth/logout
GET  http://localhost:3001/api/auth/me
```

---

## ✅ **Success Checklist**

- [x] Both servers running (frontend + backend)
- [x] Test users created in database
- [x] Passwords correctly hashed
- [x] Login endpoint working
- [x] JWT authentication configured
- [x] CORS enabled for localhost:3000

---

## 🎉 **Ready to Test!**

Login is now fully functional. You can:

1. ✅ Login with any of the 3 test accounts
2. ✅ Access Developer Dashboard
3. ✅ See ML-powered widgets
4. ✅ Test all features

**Enjoy testing the enhanced Developer Dashboard!** 🚀

---

## 📞 **Support**

If you still have issues:

1. Check server logs in terminal
2. Check browser console for errors
3. Verify database has users: `node server/update-test-users.js`
4. Try different browser or incognito mode

---

**Last Updated**: 2025-01-10
**Status**: ✅ Working
