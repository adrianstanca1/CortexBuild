# 🚀 DEPLOY BACKEND NOW - Step by Step Guide

## ✅ **BACKEND IS READY - FOLLOW THESE EXACT STEPS:**

---

## 📋 **STEP 1: Open Render Dashboard**

**Dashboard URL:** https://dashboard.render.com/

✅ **Already opened in your browser!**

---

## 📋 **STEP 2: Create New Web Service**

1. Click the **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** if GitHub not connected
4. Or click **"Configure account"** → Select repository

---

## 📋 **STEP 3: Select Repository**

1. Find and select: **`adrianstanca1/CortexBuild`**
2. Click **"Connect"**

---

## 📋 **STEP 4: Configure Service**

Fill in these **EXACT** values:

### **Basic Settings:**
```
Name: cortexbuild-backend
Region: Oregon (US West)
Branch: main
Root Directory: (leave empty)
```

### **Build Settings:**
```
Runtime: Node
Build Command: npm install
Start Command: npm run server
```

### **Plan:**
```
Instance Type: Free
```

---

## 📋 **STEP 5: Add Environment Variables**

Click **"Advanced"** → **"Add Environment Variable"**

Add these **6 variables** (copy-paste exactly):

### **Variable 1:**
```
Key: NODE_ENV
Value: production
```

### **Variable 2:**
```
Key: PORT
Value: 5000
```

### **Variable 3:**
```
Key: JWT_SECRET
Value: cortexbuild-secret-2025-production
```

### **Variable 4:**
```
Key: FRONTEND_URL
Value: https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app
```

### **Variable 5:**
```
Key: VITE_SUPABASE_URL
Value: https://qglvhxkgbzujglehewsa.supabase.co
```

### **Variable 6:** ⚠️ **IMPORTANT - SECRET KEY**
```
Key: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbHZoeGtnYnp1amdsZWhld3NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIzNzkwMSwiZXhwIjoyMDczODEzOTAxfQ.eg6hoz1bIc1FzPjMAs8oaCuv1yjymxk_5MYjpg9vEFQ
```

---

## 📋 **STEP 6: Create Web Service**

1. Review all settings
2. Click **"Create Web Service"** button
3. Wait for deployment (~2-3 minutes)

---

## 📋 **STEP 7: Monitor Deployment**

You'll see:
```
Building...
Installing dependencies...
Starting server...
```

**Expected logs:**
```
✅ Supabase client initialized
📊 Project: https://qglvhxkgbzujglehewsa.supabase.co
✅ Supabase connected successfully
✅ Auth service (Supabase) initialized
🚀 Server running on port 5000
```

---

## 📋 **STEP 8: Copy Backend URL**

Once deployed, you'll see:
```
Your service is live at https://cortexbuild-backend.onrender.com
```

**Copy this URL!** You'll need it for the next step.

---

## 📋 **STEP 9: Test Backend**

Open a new terminal and test:

```bash
# Test health check
curl https://cortexbuild-backend.onrender.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-14T..."
}
```

```bash
# Test login
curl -X POST https://cortexbuild-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adrian.stanca1@gmail.com",
    "password": "parola123"
  }'

# Expected response:
{
  "success": true,
  "user": {
    "id": "user-1",
    "email": "adrian.stanca1@gmail.com",
    "name": "Adrian Stanca",
    "role": "super_admin",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📋 **STEP 10: Update Frontend with Backend URL**

Run these commands in terminal:

```bash
# Add backend URL to Vercel
vercel env add VITE_API_URL production

# When prompted, enter:
https://cortexbuild-backend.onrender.com

# Redeploy frontend
vercel --prod
```

---

## 📋 **STEP 11: Test Full Application**

1. Open frontend: https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app
2. Click **"Login"**
3. Enter credentials:
   ```
   Email: adrian.stanca1@gmail.com
   Password: parola123
   ```
4. Should redirect to **Super Admin Dashboard**
5. Verify all features work

---

## ✅ **DEPLOYMENT CHECKLIST:**

- [ ] Render dashboard opened
- [ ] New Web Service created
- [ ] Repository connected (adrianstanca1/CortexBuild)
- [ ] Service configured (name, region, runtime)
- [ ] Build/Start commands set
- [ ] All 6 environment variables added
- [ ] Service deployed successfully
- [ ] Logs show no errors
- [ ] Health check returns 200 OK
- [ ] Login test successful
- [ ] Backend URL copied
- [ ] Vercel updated with backend URL
- [ ] Frontend redeployed
- [ ] End-to-end login test successful

---

## 🐛 **TROUBLESHOOTING:**

### **Issue: Build fails**
**Check:**
- Build command is `npm install`
- Start command is `npm run server`
- Runtime is `Node`

### **Issue: "Failed to connect to Supabase"**
**Check:**
- `VITE_SUPABASE_URL` is correct
- `SUPABASE_SERVICE_KEY` is correct (full token)
- No extra spaces in environment variables

### **Issue: "Invalid email or password"**
**Check:**
- Test with: adrian.stanca1@gmail.com / parola123
- Check logs for password verification errors
- Verify `verify_password()` function exists in Supabase

### **Issue: CORS error**
**Check:**
- `FRONTEND_URL` matches your Vercel URL exactly
- No trailing slash in URL

---

## 📊 **QUICK REFERENCE:**

### **Backend URL (after deployment):**
```
https://cortexbuild-backend.onrender.com
```

### **Frontend URL:**
```
https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app
```

### **Database URL:**
```
https://qglvhxkgbzujglehewsa.supabase.co
```

### **Test Credentials:**
```
Super Admin:
  Email: adrian.stanca1@gmail.com
  Password: parola123

Company Admin:
  Email: adrian@ascladdingltd.co.uk
  Password: lolozania1

Developer:
  Email: adrian.stanca1@icloud.com
  Password: password123
```

---

## 🎉 **YOU'RE READY TO DEPLOY!**

**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy  
**Status:** ✅ ALL READY

**Start with STEP 1 and follow each step carefully!**

---

**Good luck! 🚀**

