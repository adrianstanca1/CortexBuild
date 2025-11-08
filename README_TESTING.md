# 🧪 CortexBuild - Testing Guide

**Data:** 31 Octombrie 2025

---

## ✅ **Backend Testing - COMPLETE**

### **Status:**
- ✅ Supabase connection verified
- ✅ Server starts successfully
- ✅ All 27 API routes registered
- ✅ Server ready for requests

---

## 🚀 **Quick Start Testing**

### **Terminal 1: Start Backend**
```bash
npm run server
```

**Expected output:**
```
✅ Supabase connected successfully
✅ All 27 API routes registered successfully
✅ Server running on http://localhost:3001
```

### **Terminal 2: Start Frontend**
```bash
npm run dev
```

**Expected output:**
```
VITE v6.x.x  ready in XXX ms
➜  Local:   http://localhost:3002/
```

---

## 🧪 **Test Scenarios**

### **1. Login Test**
1. Open http://localhost:3002
2. Navigate to login
3. Test accounts:
   - **Super Admin:** `adrian.stanca1@gmail.com` / `parola123`
   - **Company Admin:** `adrian@ascladdingltd.co.uk` / `lolozania1`
   - **Developer:** `adrian.stanca1@icloud.com` / `password123`

**Expected:**
- ✅ Login successful
- ✅ Token stored
- ✅ Redirect to dashboard

### **2. Dashboard Test**
1. After login, verify dashboard loads
2. Check data displays
3. Verify no console errors

### **3. API Call Test**
1. Open browser DevTools → Network tab
2. Navigate through dashboard
3. Verify API calls succeed (200 status)
4. Verify data loads correctly

### **4. Form Submission Test**
1. Try creating:
   - New project
   - New task
   - New client
2. Verify success
3. Verify data persists

---

## 🔍 **Troubleshooting**

### **Issue: "Server won't start"**
```bash
# Check if port 3001 is in use
lsof -ti:3001 | xargs kill -9

# Verify environment variables
cat .env.local | grep SUPABASE

# Test Supabase connection
npm run verify:supabase
```

### **Issue: "Login fails"**
- Verify user exists in Supabase
- Check password hash is correct
- Verify JWT_SECRET is set

### **Issue: "API calls fail"**
- Check server is running
- Verify CORS settings
- Check browser console for errors

---

## ✅ **Success Checklist**

- [ ] Backend server starts
- [ ] Frontend starts
- [ ] Login works
- [ ] Dashboard loads
- [ ] API calls succeed
- [ ] Forms submit
- [ ] Data persists
- [ ] No console errors

---

**Ready to test!** 🚀

