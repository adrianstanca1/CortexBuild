# 🚀 Interactive Deployment Guide

## Current Status
- ✅ **Frontend**: https://cortex-build-qv7j4204j-adrian-b7e84541.vercel.app
- ✅ **Code**: All fixes applied, error-free
- ⚠️ **Backend**: Needs deployment on Render.com
- ⚠️ **Connection**: Needs environment variables

---

## Step 1: Deploy Backend on Render.com

### 1.1 Open Render.com
- **Click here**: https://render.com
- **Sign up/Login** with GitHub

### 1.2 Create Web Service
- Click **"New +"** → **"Web Service"**
- Connect repository: `adrianstanca1/CortexBuild`

### 1.3 Configure Service
```
Name: cortexbuild-api
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: (leave empty)
Build Command: npm install
Start Command: npm run server
Plan: Free
```

### 1.4 Add Environment Variables
Click **"Advanced"** and add:

```
NODE_ENV = production
PORT = 3001
JWT_SECRET = b354d0024ca7a870e88bb22ea3b07b00342db66f2b1dfdfb93efa157381f878cc05766f58c639cbe8b07b5d2539d59dd180d02f1d3f798ff62f41980e6e1bb2f
ENCRYPTION_KEY = c3f14de008245943a7be7d186f9d418f24dd10538e92930926636936c97dc5e8
```

### 1.5 Deploy
- Click **"Create Web Service"**
- Wait 2-3 minutes
- **Copy your backend URL** (e.g., `https://cortexbuild-api.onrender.com`)

---

## Step 2: Update Vercel Environment Variables

### 2.1 Go to Vercel Dashboard
- **Click here**: https://vercel.com/adrian-b7e84541/cortex-build
- Click **"Settings"** tab
- Click **"Environment Variables"** in sidebar

### 2.2 Add API URL
- Click **"Add New"**
- Fill in:
  ```
  Name: VITE_API_URL
  Value: https://your-backend-url.onrender.com/api
  Environment: Production
  ```
- Click **"Save"**

### 2.3 Redeploy Frontend
- Go to **"Deployments"** tab
- Click **"Redeploy"** on latest deployment
- Wait for completion

---

## Step 3: Test Complete Application

### 3.1 Access Application
- **Open**: https://cortex-build-qv7j4204j-adrian-b7e84541.vercel.app

### 3.2 Test Login
```
Email: adrian.stanca1@gmail.com
Password: parola123
```

### 3.3 Verify Features
- ✅ Login works
- ✅ Dashboard loads
- ✅ No console errors
- ✅ API calls succeed

---

## 🆘 Need Help?

### Common Issues:
1. **Render deployment fails**: Check build logs for errors
2. **Vercel environment variables not working**: Make sure to redeploy after adding variables
3. **Login not working**: Check if backend URL is correct

### Quick Test:
```bash
# Test backend health
curl https://your-backend-url.onrender.com/api/health

# Test frontend
curl -I https://cortex-build-qv7j4204j-adrian-b7e84541.vercel.app
```

---

## 📊 Success Checklist

- [ ] Backend deployed on Render.com
- [ ] Backend URL copied
- [ ] VITE_API_URL added to Vercel
- [ ] Frontend redeployed
- [ ] Login works
- [ ] No console errors
- [ ] All features working

---

**🎉 Once complete, you'll have a fully functional production application!**
