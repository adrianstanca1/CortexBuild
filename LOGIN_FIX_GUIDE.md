# 🔧 Login Fix Guide

## ✅ **LOCALHOST LOGIN - FIXED!**

### **Problem:**
The backend server was not running, so login requests were failing.

### **Solution:**
The backend server is now running on `http://localhost:3001`

### **How to Test Localhost Login:**

1. **Make sure both servers are running:**
   ```bash
   # Terminal 1 - Frontend (already running)
   npm run dev
   
   # Terminal 2 - Backend (now running)
   npm run server
   ```

2. **Visit:** `http://localhost:3000`

3. **Login with:**
   - Email: `adrian.stanca1@gmail.com`
   - Password: `password123`

4. **Expected Result:** ✅ Login successful!

---

## ⚠️ **VERCEL LOGIN - NOT WORKING (Expected)**

### **Problem:**
Vercel deployment only includes the **frontend** (static files). There is **NO backend server** running on Vercel.

### **Why It Doesn't Work:**
- Vercel serves static files only
- The backend API (`/api/auth/login`) doesn't exist on Vercel
- Frontend tries to call `/api/auth/login` but gets 404

### **Current Behavior:**
- Frontend on Vercel: ✅ Works
- Backend on Vercel: ❌ Doesn't exist
- Login on Vercel: ❌ Fails (no backend)

---

## 🚀 **SOLUTION: Deploy Backend Separately**

To make login work on Vercel, you need to deploy the backend to a separate platform.

### **Option 1: Deploy Backend to Render (Recommended)**

**Step 1: Create Render Account**
- Visit: https://render.com
- Sign up with GitHub

**Step 2: Create New Web Service**
- Click "New +" → "Web Service"
- Connect your GitHub repository: `CortexBuild`
- Configure:
  - **Name:** `cortexbuild-backend`
  - **Environment:** `Node`
  - **Build Command:** `npm install`
  - **Start Command:** `npm run server`
  - **Plan:** Free

**Step 3: Add Environment Variables**
- Add any required env vars from `.env.local`

**Step 4: Deploy**
- Click "Create Web Service"
- Wait for deployment (~2-3 minutes)
- Get your backend URL: `https://cortexbuild-backend.onrender.com`

**Step 5: Update Frontend**
- Update `auth/authService.ts`:
  ```typescript
  const API_URL = import.meta.env.PROD
      ? 'https://cortexbuild-backend.onrender.com/api'  // Your Render URL
      : 'http://localhost:3001/api';
  ```

**Step 6: Redeploy Frontend**
- Commit and push changes
- Vercel will auto-deploy
- Login will now work!

---

### **Option 2: Deploy Backend to Railway**

**Step 1: Create Railway Account**
- Visit: https://railway.app
- Sign up with GitHub

**Step 2: Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose `CortexBuild`

**Step 3: Configure**
- Railway auto-detects Node.js
- Set start command: `npm run server`
- Add environment variables

**Step 4: Deploy**
- Railway deploys automatically
- Get your backend URL: `https://cortexbuild-production.up.railway.app`

**Step 5: Update Frontend**
- Update `auth/authService.ts` with Railway URL
- Commit and push

---

### **Option 3: Use Vercel Serverless Functions**

**Convert Express routes to Vercel serverless functions:**

**Step 1: Create `api` directory in project root**
```bash
mkdir api
```

**Step 2: Create serverless function files**
```typescript
// api/auth/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  
  // Your login logic here
  // ...
  
  res.json({ success: true, user, token });
}
```

**Step 3: Update `vercel.json`**
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

**Step 4: Deploy**
- Commit and push
- Vercel will deploy serverless functions

---

## 📝 **QUICK FIX FOR LOCALHOST**

### **Current Status:**
✅ **Localhost login is working!**

### **To keep it working:**
1. Always run both servers:
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   npm run server
   ```

2. Or use the combined command:
   ```bash
   npm run dev:all
   ```

---

## 🎯 **RECOMMENDED APPROACH**

### **For Development:**
- Use localhost with both servers running
- Login works perfectly

### **For Production:**
1. **Deploy backend to Render** (easiest, free tier available)
2. **Update frontend API URL** to point to Render
3. **Redeploy frontend to Vercel**
4. **Login works on production!**

---

## 🔍 **DEBUGGING TIPS**

### **If localhost login still doesn't work:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Check frontend can reach backend:**
   - Open browser console (F12)
   - Try to login
   - Look for network errors

3. **Check CORS:**
   - Backend should allow `http://localhost:3000`
   - Check `server/index.ts` for CORS config

4. **Clear browser data:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

---

## 📊 **CURRENT SETUP**

### **Localhost:**
- Frontend: `http://localhost:3000` ✅ Running
- Backend: `http://localhost:3001` ✅ Running
- Login: ✅ **WORKING**

### **Vercel:**
- Frontend: `https://cortex-build-726dz1xxz-adrian-b7e84541.vercel.app` ✅ Deployed
- Backend: ❌ **NOT DEPLOYED**
- Login: ❌ **NOT WORKING** (expected)

---

## 🚀 **NEXT STEPS**

### **To make Vercel login work:**

1. **Choose a backend hosting platform:**
   - Render (recommended - free tier)
   - Railway (easy setup)
   - Heroku (paid)
   - DigitalOcean (more control)

2. **Deploy backend:**
   - Follow steps above for chosen platform
   - Get backend URL

3. **Update frontend:**
   - Change API_URL in `auth/authService.ts`
   - Commit and push

4. **Test:**
   - Visit Vercel URL
   - Try to login
   - Should work! ✅

---

## 💡 **ALTERNATIVE: All-in-One Deployment**

### **Deploy everything to Render:**

1. **Deploy as a single service:**
   - Build command: `npm install && npm run build`
   - Start command: `npm run server`
   - Render serves both frontend and backend

2. **Configure static files:**
   - Serve `dist` folder for frontend
   - API routes handled by Express

3. **One URL for everything:**
   - `https://cortexbuild.onrender.com`
   - Frontend and backend together

---

**🎉 Localhost login is now working! For production, deploy the backend separately.** 🚀

