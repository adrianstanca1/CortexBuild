# 🧪 Integration Testing Guide - CortexBuild

**Data:** 31 Octombrie 2025  
**Status:** ⏳ Ready for Testing

---

## 🚀 **Quick Start Testing**

### **Step 1: Start Backend Server**
```bash
npm run server
```

**Expected Output:**
```
✅ Supabase connected successfully
✅ All 27 API routes registered successfully
🚀 Server running on http://localhost:3001
```

### **Step 2: Start Frontend Dev Server**
```bash
npm run dev
```

**Expected Output:**
```
VITE v6.x.x  ready in XXX ms

➜  Local:   http://localhost:3002/
```

### **Step 3: Open Browser**
```
http://localhost:3002
```

---

## 🧪 **Test Scenarios**

### **Scenario 1: Login Flow**

#### **Test Account 1: Super Admin**
```
Email: adrian.stanca1@gmail.com
Password: parola123
```

**Expected:**
1. ✅ Login form loads
2. ✅ Submit credentials
3. ✅ API call to `/api/auth/login`
4. ✅ Token received and stored
5. ✅ Redirect to dashboard
6. ✅ User data displayed

#### **Test Account 2: Company Admin**
```
Email: adrian@ascladdingltd.co.uk
Password: lolozania1
```

#### **Test Account 3: Developer**
```
Email: adrian.stanca1@icloud.com
Password: password123
```

---

### **Scenario 2: Dashboard Loading**

**After Login:**
1. ✅ Dashboard loads
2. ✅ API calls succeed
3. ✅ Data displays correctly
4. ✅ No console errors
5. ✅ Navigation works

---

### **Scenario 3: API Calls**

**Test Various Components:**
1. ✅ Projects list loads
2. ✅ Clients list loads
3. ✅ Tasks load
4. ✅ Marketplace apps load
5. ✅ Admin dashboard loads

---

### **Scenario 4: Form Submissions**

**Test Creating:**
1. ✅ New project
2. ✅ New task
3. ✅ New client
4. ✅ Update user
5. ✅ Update company

**Expected:**
- ✅ Form validates
- ✅ API call succeeds
- ✅ Data persists
- ✅ UI updates
- ✅ Success message

---

### **Scenario 5: UI Interactions**

**Test Buttons:**
- ✅ Save buttons
- ✅ Delete buttons (with confirmation)
- ✅ Edit buttons
- ✅ Cancel buttons
- ✅ Navigation buttons

**Test Filters:**
- ✅ Date filters
- ✅ Status filters
- ✅ Search functionality

---

## 🔍 **Verification Checklist**

### **Browser DevTools Checks:**
- [ ] Network tab: All API calls succeed (200 status)
- [ ] Console tab: No errors
- [ ] Application tab: Token stored correctly
- [ ] Application tab: User data stored

### **Functionality Checks:**
- [ ] Login works
- [ ] Logout works
- [ ] Token refresh works
- [ ] Protected routes require auth
- [ ] Data loads correctly
- [ ] Forms submit successfully
- [ ] Real-time features work

---

## 🐛 **Troubleshooting**

### **Issue: "Cannot connect to API"**
**Check:**
1. Backend server running?
2. Port 3001 accessible?
3. CORS configured correctly?
4. Network tab shows request?

### **Issue: "Login fails"**
**Check:**
1. User exists in Supabase?
2. Password hash correct?
3. Token received?
4. Browser console errors?

### **Issue: "404 on API calls"**
**Check:**
1. Backend routes registered?
2. URL correct?
3. Proxy configured in Vite?
4. Endpoint path correct?

---

## 📊 **Success Criteria**

### **Must Pass:**
- ✅ Login successful
- ✅ Dashboard loads
- ✅ API calls succeed
- ✅ Data displays
- ✅ Forms submit
- ✅ No console errors

### **Should Pass:**
- ⏳ All buttons work
- ⏳ All filters work
- ⏳ Navigation works
- ⏳ Real-time features work

---

## 📝 **Testing Log Template**

```
Date: [DATE]
Tester: [NAME]

Login:
- [ ] Super Admin: ✅/❌
- [ ] Company Admin: ✅/❌
- [ ] Developer: ✅/❌

Dashboard:
- [ ] Loads: ✅/❌
- [ ] Data displays: ✅/❌
- [ ] No errors: ✅/❌

API Calls:
- [ ] Projects: ✅/❌
- [ ] Clients: ✅/❌
- [ ] Tasks: ✅/❌

Forms:
- [ ] Create Project: ✅/❌
- [ ] Create Task: ✅/❌
- [ ] Update User: ✅/❌

Issues Found:
- [LIST ISSUES]
```

---

**Ready to begin integration testing!** 🚀

