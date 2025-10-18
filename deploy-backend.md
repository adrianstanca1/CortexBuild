# 🚀 Backend Deployment Guide

## Quick Deploy to Render.com

### 1. Go to Render.com
- Visit: https://render.com
- Sign up/Login with GitHub

### 2. Create Web Service
- Click "New +" → "Web Service"
- Connect: `adrianstanca1/CortexBuild`

### 3. Configuration
```
Name: cortexbuild-api
Environment: Node
Region: Oregon (US West)
Branch: main
Build Command: npm install
Start Command: npm run server
Plan: Free
```

### 4. Environment Variables
```
NODE_ENV=production
PORT=3001
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
GEMINI_API_KEY=your-gemini-key
```

### 5. Deploy
- Click "Create Web Service"
- Wait 2-3 minutes
- Copy backend URL: `https://cortexbuild-api.onrender.com`

## Update Frontend

### 1. Vercel Dashboard
- Go to: https://vercel.com/adrian-b7e84541/cortex-build
- Settings → Environment Variables

### 2. Add Variable
```
Name: VITE_API_URL
Value: https://your-backend-url.onrender.com/api
Environment: Production
```

### 3. Redeploy
- Deployments → Redeploy latest

## Test

### Login Credentials
```
Email: adrian.stanca1@gmail.com
Password: parola123
```

### URLs
- Frontend: https://cortex-build-r8mkvuegc-adrian-b7e84541.vercel.app
- Backend: https://your-backend-url.onrender.com

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify environment variables
- Ensure port 3001 is used

### Frontend Issues
- Verify VITE_API_URL is correct
- Check browser console for errors
- Ensure CORS is configured

### Database Issues
- SQLite resets on each deployment (free tier)
- Consider PostgreSQL for persistence
- Check database initialization logs
