# 🚀 Deploy Backend NOW - Step by Step

## Current Status

- ✅ **Frontend**: Deployed on Vercel (requires auth)
- ⚠️ **Backend**: Ready for Render.com deployment
- ✅ **Code**: All fixes applied and committed

## 🎯 Deploy Backend on Render.com (5 minutes)

### Step 1: Go to Render.com

1. Open: <https://render.com>
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub"

### Step 2: Create New Web Service

1. Click "New +" button
2. Select "Web Service"
3. Connect GitHub repository: `adrianstanca1/CortexBuild`

### Step 3: Configure Service

Fill in these exact values:

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

### Step 4: Add Environment Variables

Click "Advanced" and add these variables:

```
NODE_ENV = production
PORT = 3001
JWT_SECRET = b354d0024ca7a870e88bb22ea3b07b00342db66f2b1dfdfb93efa157381f878cc05766f58c639cbe8b07b5d2539d59dd180d02f1d3f798ff62f41980e6e1bb2f
ENCRYPTION_KEY = c3f14de008245943a7be7d186f9d418f24dd10538e92930926636936c97dc5e8
```

### Step 5: Deploy

1. Click "Create Web Service"
2. Wait 2-3 minutes for deployment
3. **IMPORTANT**: Copy your backend URL (e.g., `https://cortexbuild-api.onrender.com`)

## 🔄 Update Frontend (2 minutes)

### Step 1: Go to Vercel Dashboard

1. Open: <https://vercel.com/adrian-b7e84541/cortex-build>
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar

### Step 2: Add API URL

1. Click "Add New"
2. Fill in:

   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.onrender.com/api
   Environment: Production
   ```

3. Click "Save"

### Step 3: Redeploy Frontend

1. Go to "Deployments" tab
2. Click "Redeploy" on latest deployment
3. Wait for deployment to complete

## 🧪 Test Complete Application

### Step 1: Access Application

1. Open: <https://cortex-build-r8mkvuegc-adrian-b7e84541.vercel.app>
2. You may need to authenticate with Vercel first

### Step 2: Test Login

Use these credentials:

```
Email: adrian.stanca1@gmail.com
Password: parola123
```

### Step 3: Verify Features

- ✅ Login should work
- ✅ Dashboard should load
- ✅ No console errors
- ✅ API calls should succeed

## 🎉 Success

Once both steps are complete, you'll have:

- ✅ **Full-stack application** running in production
- ✅ **Frontend** on Vercel
- ✅ **Backend** on Render.com
- ✅ **Database** (SQLite, resets on deployment)
- ✅ **Authentication** working end-to-end

## 🆘 Troubleshooting

### Backend Issues

- Check Render logs for errors
- Verify environment variables are set
- Ensure port 3001 is used

### Frontend Issues

- Verify VITE_API_URL is correct
- Check browser console for errors
- Ensure CORS is configured

### Database Issues

- SQLite resets on each deployment (free tier)
- Consider PostgreSQL for persistent data

## 📞 Need Help?

- **Render Docs**: <https://render.com/docs>
- **Vercel Docs**: <https://vercel.com/docs>
- **Project Issues**: Check GitHub repository

---

**🚀 Ready to deploy? Follow the steps above and you'll have a fully functional application in production!**
