# 🧪 Start Testing - Quick Guide

**Data:** 31 Octombrie 2025

---

## 🚀 **Quick Start Testing**

### **Step 1: Verify Environment Variables**

Check if `.env.local` exists and has required variables:
```bash
cat .env.local | grep SUPABASE
```

Required variables:
- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET` (optional, has default)

---

### **Step 2: Test Supabase Connection**

```bash
npm run verify:supabase
```

**Expected output:**
```
🔍 Verifying Supabase connection...

✅ Supabase connected successfully
✅ Companies table exists
   Found X companies

📊 Checking critical tables...

   ✅ users - Table exists
   ✅ projects - Table exists
   ✅ project_tasks_gantt - Table exists
   ✅ wbs_structure - Table exists
   ✅ project_budgets - Table exists
   ✅ payment_applications - Table exists

✅ Connection verification complete!
```

---

### **Step 3: Start Backend Server**

```bash
npm run server
```

**Expected output:**
```
🔌 Connecting to Supabase...
✅ Supabase connection verified
🔐 Registering Auth routes...
✅ All 27 API routes registered successfully
🚀 Server running on http://localhost:3001
```

**If connection fails:**
- Check `.env.local` has `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Verify Supabase project is active
- Check network connectivity

---

### **Step 4: Start Frontend (in new terminal)**

```bash
npm run dev
```

**Expected output:**
```
  VITE v6.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3002/
  ➜  Network: use --host to expose
```

---

### **Step 5: Test Login**

1. Open browser: http://localhost:3002
2. Navigate to login page
3. Test with:
   - **Super Admin:** `adrian.stanca1@gmail.com` / `parola123`
   - **Company Admin:** `adrian@ascladdingltd.co.uk` / `lolozania1`
   - **Developer:** `adrian.stanca1@icloud.com` / `password123`

**Expected:**
- ✅ Login successful
- ✅ Redirect to dashboard
- ✅ User data displayed

---

## 🔍 **Troubleshooting**

### **Issue: "Missing Supabase credentials"**
```bash
# Check if .env.local exists
ls -la .env.local

# If missing, create it with:
cat > .env.local << EOF
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY
JWT_SECRET=your-secret-key
EOF
```

### **Issue: "Failed to connect to Supabase"**
1. Verify Supabase project URL is correct
2. Verify service key is correct (not anon key)
3. Check Supabase project is active
4. Verify network connectivity

### **Issue: "Table does not exist"**
```bash
# Run migrations
npm run migrate:supabase
```

### **Issue: "Port 3001 already in use"**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or change port in server/index.ts
```

---

## ✅ **Success Criteria**

- [ ] Supabase connection verified
- [ ] Backend server starts successfully
- [ ] Frontend starts successfully
- [ ] Login works with test accounts
- [ ] Dashboard loads
- [ ] No console errors

---

**Ready to test!** 🚀

