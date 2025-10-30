# Known Issues - CortexBuild V2.0

## 🐛 Active Issues

### 1. React Hooks Error (INTERMITTENT)

**Error Message:**
```
Rendered more hooks than during the previous render.
```

**Status:** 🔍 INVESTIGATING

**When it occurs:**
- Sometimes appears after login
- May occur when switching between user roles
- Intermittent - doesn't always reproduce

**Root Cause Analysis:**
- All hooks in App.tsx are called unconditionally ✅
- All hooks in dashboard components are called unconditionally ✅
- UnifiedDashboardScreen has been fixed with SuperAdminDashboardWrapper ✅
- Likely caused by a component that conditionally renders based on user state

**Potential Causes:**
1. A lazy-loaded component that has hooks
2. A component that renders differently based on `currentUser` prop
3. A third-party library component with internal hooks

**Debugging Steps:**
1. Check browser console for the exact component stack trace
2. Look for any component that uses hooks inside conditional statements
3. Check if any lazy-loaded components have hooks
4. Verify that all dashboard components call hooks in the same order

**Workaround:**
- Refresh the page - the error usually doesn't persist
- The application functions correctly despite the error

**Files to Check:**
- `App.tsx` - Main app component
- `components/screens/UnifiedDashboardScreen.tsx` - Dashboard router
- `components/screens/developer/DeveloperDashboardV2.tsx` - Developer dashboard
- `components/screens/company/CompanyAdminDashboardV2.tsx` - Company admin dashboard
- `components/admin/SuperAdminDashboardV2.tsx` - Super admin dashboard
- Any lazy-loaded components

---

### 2. My Applications API - Schema Issue (MINOR)

**Error Message:**
```
SqliteError: no such column: sa.config
```

**Status:** 📝 DOCUMENTED

**When it occurs:**
- When calling GET /api/my-applications

**Root Cause:**
- The `user_app_installations` or `company_app_installations` table is missing the `config` column
- Or the SQL query is referencing a column that doesn't exist

**Impact:**
- My Applications screen may not load installed apps correctly
- Does not affect other functionality

**Fix Required:**
1. Check the database schema for `user_app_installations` table
2. Add `config` column if missing:
   ```sql
   ALTER TABLE user_app_installations ADD COLUMN config TEXT;
   ALTER TABLE company_app_installations ADD COLUMN config TEXT;
   ```
3. Or update the SQL query in `server/routes/my-applications.ts` to not reference `sa.config`

**Files to Check:**
- `server/database.ts` - Database schema
- `server/routes/my-applications.ts` - My Applications API routes

---

## ✅ Resolved Issues

### 1. API URL Configuration (FIXED)

**Issue:** Frontend was making requests to wrong API URL

**Solution:** Updated `.env.local`:
```bash
# Before
VITE_API_URL=http://localhost:3001

# After
VITE_API_URL=http://localhost:3001/api
```

**Status:** ✅ RESOLVED

---

### 2. React Hooks Error in UnifiedDashboardScreen (FIXED)

**Issue:** `useState` was called conditionally for different user roles

**Solution:** Created `SuperAdminDashboardWrapper` component to isolate hooks

**Status:** ✅ RESOLVED

---

## 🔧 Debugging Tools

### Check Backend Logs:
```bash
# Backend runs in terminal 145
# Check logs for errors
```

### Check Frontend Console:
```bash
# Open browser DevTools (F12)
# Check Console tab for errors
# Check Network tab for failed API calls
```

### Test API Endpoints:
```bash
# Health check
curl http://localhost:3001/api/health

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adrian.stanca1@gmail.com","password":"Cumparavinde1"}'

# Projects test (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/projects
```

### Database Queries:
```bash
# Check users
sqlite3 cortexbuild.db "SELECT email, role FROM users;"

# Check table schema
sqlite3 cortexbuild.db ".schema user_app_installations"

# Check installed apps
sqlite3 cortexbuild.db "SELECT * FROM user_app_installations;"
```

---

## 📝 Notes

### React Hooks Rules:
1. **Always call hooks at the top level** - Never inside loops, conditions, or nested functions
2. **Call hooks in the same order** - React relies on the order of hook calls
3. **Only call hooks from React functions** - Not from regular JavaScript functions

### Common Patterns That Cause Hook Errors:
```typescript
// ❌ BAD - Conditional hook
if (condition) {
  const [state, setState] = useState(false);
}

// ✅ GOOD - Hook always called
const [state, setState] = useState(false);
if (condition) {
  // Use state here
}

// ❌ BAD - Early return before hooks
if (!user) return null;
const [state, setState] = useState(false);

// ✅ GOOD - Hooks before early return
const [state, setState] = useState(false);
if (!user) return null;
```

### Debugging React Hooks Errors:
1. Check the browser console for the component stack trace
2. Look for the component that's causing the issue
3. Verify all hooks are called unconditionally
4. Check if any lazy-loaded components have hooks
5. Use React DevTools to inspect component tree

---

## 🚀 Next Steps

1. **Fix My Applications API schema issue**
   - Add `config` column to tables or update SQL query

2. **Investigate React Hooks error**
   - Add more detailed logging
   - Check all lazy-loaded components
   - Verify component render order

3. **Add error boundaries**
   - Wrap dashboard components in error boundaries
   - Provide better error messages to users

4. **Add integration tests**
   - Test login flow
   - Test dashboard switching
   - Test API calls

---

## 📞 Support

If you encounter any issues:
1. Check this document first
2. Check browser console for errors
3. Check backend logs for API errors
4. Try refreshing the page
5. Try clearing localStorage and logging in again

---

**Last Updated:** 2025-10-11  
**Version:** 2.0.0

