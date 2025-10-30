# 🚀 Complete Deployment Guide

## Current Status
- ✅ **Frontend**: Deployed on Vercel (protected by auth)
- ⚠️ **Backend**: Needs deployment on Render.com
- ⚠️ **Database**: SQLite (will reset on each deployment)

## Step 1: Deploy Backend on Render.com

### 1.1 Go to Render.com
- Visit: https://render.com
- Sign up/Login with GitHub account

### 1.2 Create Web Service
- Click "New +" → "Web Service"
- Connect GitHub repository: `adrianstanca1/CortexBuild`

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
```
NODE_ENV=production
PORT=3001
JWT_SECRET=b354d0024ca7a870e88bb22ea3b07b00342db66f2b1dfdfb93efa157381f878cc05766f58c639cbe8b07b5d2539d59dd180d02f1d3f798ff62f41980e6e1bb2f
ENCRYPTION_KEY=c3f14de008245943a7be7d186f9d418f24dd10538e92930926636936c97dc5e8
```

### 1.5 Deploy
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Copy your backend URL (e.g., `https://cortexbuild-api.onrender.com`)

## Step 2: Update Frontend Environment Variables

### 2.1 Go to Vercel Dashboard
- Visit: https://vercel.com/adrian-b7e84541/cortex-build
- Go to Settings → Environment Variables

### 2.2 Add API URL
```
Name: VITE_API_URL
Value: https://your-backend-url.onrender.com/api
Environment: Production
```

### 2.3 Redeploy Frontend
- Go to Deployments tab
- Click "Redeploy" on the latest deployment

## Step 3: Test Complete Application

### 3.1 Access the Application
- Frontend URL: https://cortex-build-r8mkvuegc-adrian-b7e84541.vercel.app
- You may need to authenticate with Vercel first

### 3.2 Test Login
```
Email: adrian.stanca1@gmail.com
Password: parola123
```

### 3.3 Verify Features
- Login should work
- Dashboard should load
- API calls should succeed
- No console errors

## Step 4: PostgreSQL for Persistent Data (Optional)

### Current Issue
- SQLite database resets on each Render.com deployment
- Data is not persistent

### Solution Options

#### Option A: Render.com PostgreSQL
1. Add PostgreSQL service in Render
2. Get connection string
3. Update `server/database.ts` to use PostgreSQL
4. Run database migrations

#### Option B: Supabase PostgreSQL
1. Already configured in project
2. Free tier: 500 MB
3. Real-time features included
4. Update environment variables

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify environment variables are set
- Ensure port 3001 is used
- Check database initialization

### Frontend Issues
- Verify VITE_API_URL is correct
- Check browser console for errors
- Ensure CORS is configured properly
- Check Vercel deployment logs

### Database Issues
- SQLite resets on deployment (free tier)
- Consider PostgreSQL for persistence
- Check database file permissions
- Verify database initialization logs

## Environment Variables Reference

### Backend (Render.com)
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=b354d0024ca7a870e88bb22ea3b07b00342db66f2b1dfdfb93efa157381f878cc05766f58c639cbe8b07b5d2539d59dd180d02f1d3f798ff62f41980e6e1bb2f
ENCRYPTION_KEY=c3f14de008245943a7be7d186f9d418f24dd10538e92930926636936c97dc5e8
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## URLs
- **Frontend**: https://cortex-build-r8mkvuegc-adrian-b7e84541.vercel.app
- **Backend**: https://your-backend-url.onrender.com (after deployment)

## Next Steps After Deployment
1. Test all features end-to-end
2. Set up PostgreSQL for persistent data
3. Configure custom domain (optional)
4. Set up monitoring and logging
5. Configure CI/CD for automatic deployments

## Support
- Render.com Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Project Issues: Check GitHub repository
