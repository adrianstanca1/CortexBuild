# 🔧 Fix Authentication - CortexBuild

**Data:** 31 Octombrie 2025  
**Issue:** Login returns "Invalid email or password"

---

## 🔍 **Problem Analysis**

### **Current Situation:**
- ✅ Backend running on http://localhost:3001
- ✅ Health endpoint working
- ✅ Clients endpoint working
- ❌ Login endpoint returns "Invalid email or password"

### **Root Cause:**
1. **Table Name Mismatch:**
   - Backend code uses: `app_users` table
   - Schema may have: `users` table
   
2. **Password Hash Issue:**
   - Backend expects bcrypt hashes
   - Supabase may not have password hashes set correctly

3. **User Existence:**
   - Users may not exist in Supabase
   - Email addresses may not match

---

## 🔧 **Solution Steps**

### **Step 1: Verify Table Name**

**Check Supabase:**
1. Open Supabase Dashboard
2. Go to Table Editor
3. Check if table is `users` or `app_users`

**If table is `users` (not `app_users`):**
- Update `server/auth-supabase.ts` to use `users` instead of `app_users`

### **Step 2: Verify Users Exist**

**Check if users exist:**
```sql
SELECT id, email, name, role FROM users LIMIT 10;
-- OR
SELECT id, email, name, role FROM app_users LIMIT 10;
```

### **Step 3: Set Password Hashes**

**Option A: Using Node.js (Recommended)**
```bash
npm run migrate:supabase
# Then run password hash update script
```

**Option B: Using Supabase SQL Editor**
```sql
-- Update password hashes using bcrypt
UPDATE users 
SET password_hash = crypt('parola123', gen_salt('bf', 10))
WHERE email = 'adrian.stanca1@gmail.com';

UPDATE users 
SET password_hash = crypt('lolozania1', gen_salt('bf', 10))
WHERE email = 'adrian@ascladdingltd.co.uk';

UPDATE users 
SET password_hash = crypt('password123', gen_salt('bf', 10))
WHERE email = 'adrian.stanca1@icloud.com';
```

**Note:** If using `app_users` table, replace `users` with `app_users`.

### **Step 4: Test Login**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adrian.stanca1@icloud.com","password":"password123"}'
```

---

## 🎯 **Quick Fix**

If table is `users` (not `app_users`):

**Update `server/auth-supabase.ts`:**
```typescript
// Change line 64-66 from:
const { data, error } = await supabase
  .from('app_users')  // ❌ Change this
  .select('*')

// To:
const { data, error } = await supabase
  .from('users')  // ✅ Change to this
  .select('*')
```

Do the same for:
- `getUserByEmail` function (line 64)
- `getUserById` function (line 87)
- `register` function (line 187)
- `changePassword` function (line 316)

---

## ✅ **After Fix**

1. Restart backend server
2. Test login endpoint
3. Verify token is returned
4. Test frontend login

---

**Ready to fix authentication!** 🔧

