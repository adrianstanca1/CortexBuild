# 🚀 Vercel Deployment Guide - ConstructAI

**Date**: 2025-10-07  
**Status**: ✅ READY FOR DEPLOYMENT  
**Stack**: Vercel + Vercel Postgres + Serverless Functions

---

## 📋 What We Built

### **Serverless API Functions** (4 endpoints)
- ✅ `api/auth/login.ts` - POST /api/auth/login
- ✅ `api/auth/register.ts` - POST /api/auth/register
- ✅ `api/auth/me.ts` - GET /api/auth/me
- ✅ `api/auth/logout.ts` - POST /api/auth/logout

### **Database Schema**
- ✅ `sql/init.sql` - Complete database schema with initial data
- ✅ 3 tables: companies, users, sessions
- ✅ 3 initial users with hashed passwords

### **Configuration**
- ✅ `vercel.json` - Vercel configuration
- ✅ Environment-aware API URL (dev vs prod)

---

## 🎯 Step-by-Step Deployment

### **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**

```bash
vercel login
```

### **Step 3: Create Vercel Postgres Database**

1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database"
3. Select "Postgres"
4. Choose a name: `constructai-db`
5. Select region: Choose closest to your users
6. Click "Create"

### **Step 4: Get Database Connection String**

1. In Vercel dashboard, go to your Postgres database
2. Click ".env.local" tab
3. Copy the `POSTGRES_URL` value
4. Save it for later

### **Step 5: Initialize Database Schema**

1. In Vercel dashboard, go to your Postgres database
2. Click "Query" tab
3. Copy the entire content of `sql/init.sql`
4. Paste it in the query editor
5. Click "Run Query"
6. Verify tables were created

### **Step 6: Set Environment Variables**

In your Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add these variables:

```
POSTGRES_URL = <your-postgres-connection-string>
JWT_SECRET = <generate-a-random-secret-key>
```

To generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Step 7: Deploy to Vercel**

```bash
# From project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? constructai
# - Directory? ./
# - Override settings? No
```

### **Step 8: Verify Deployment**

After deployment, Vercel will give you a URL like:
```
https://constructai-xyz123.vercel.app
```

Test the API:
```bash
curl https://constructai-xyz123.vercel.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"adrian.stanca1@gmail.com","password":"Cumparavinde1"}'
```

Expected response:
```json
{
  "success": true,
  "user": {
    "id": "user-1",
    "email": "adrian.stanca1@gmail.com",
    "name": "Adrian Stanca",
    "role": "super_admin",
    "avatar": null,
    "companyId": "company-1"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔧 Local Development

### **Option 1: Use Vercel Dev (Recommended)**

```bash
# Install dependencies
npm install

# Link to Vercel project (pulls environment variables)
vercel link

# Pull environment variables
vercel env pull .env.local

# Start Vercel dev server (runs serverless functions locally)
vercel dev
```

This will start:
- Frontend on `http://localhost:3000`
- API functions on `http://localhost:3000/api/*`

### **Option 2: Use Local Express Server**

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

This uses the local SQLite database.

---

## 📊 Database Schema

### **companies**
```sql
id          TEXT PRIMARY KEY
name        TEXT UNIQUE NOT NULL
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### **users**
```sql
id            TEXT PRIMARY KEY
email         TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL
name          TEXT NOT NULL
role          TEXT NOT NULL
avatar        TEXT
company_id    TEXT NOT NULL (FK → companies.id)
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### **sessions**
```sql
id          TEXT PRIMARY KEY
user_id     TEXT NOT NULL (FK → users.id)
token       TEXT UNIQUE NOT NULL
expires_at  TIMESTAMP NOT NULL
created_at  TIMESTAMP
```

---

## 🔐 Initial Users

### **Super Admin**
```
Email: adrian.stanca1@gmail.com
Password: Cumparavinde1
Role: super_admin
```

### **Company Admin**
```
Email: casey@constructco.com
Password: password123
Role: company_admin
```

### **Supervisor**
```
Email: mike@constructco.com
Password: password123
Role: supervisor
```

---

## 🎯 API Endpoints

### **POST /api/auth/login**
Login with email and password

**Request:**
```json
{
  "email": "adrian.stanca1@gmail.com",
  "password": "Cumparavinde1"
}
```

**Response:**
```json
{
  "success": true,
  "user": {...},
  "token": "..."
}
```

### **POST /api/auth/register**
Register new user

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "companyName": "ConstructCo"
}
```

**Response:**
```json
{
  "success": true,
  "user": {...},
  "token": "..."
}
```

### **GET /api/auth/me**
Get current user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {...}
}
```

### **POST /api/auth/logout**
Logout current user

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true
}
```

---

## 🔍 Troubleshooting

### **Issue: API returns 500 error**
**Solution**: Check Vercel logs
```bash
vercel logs
```

### **Issue: Database connection fails**
**Solution**: Verify `POSTGRES_URL` environment variable is set correctly

### **Issue: CORS errors**
**Solution**: Verify `vercel.json` has correct CORS headers

### **Issue: Token verification fails**
**Solution**: Verify `JWT_SECRET` environment variable is set

---

## 📈 Monitoring

### **View Logs**
```bash
vercel logs
```

### **View Analytics**
Go to Vercel dashboard → Your project → Analytics

### **View Database**
Go to Vercel dashboard → Storage → Your database → Query

---

## 🎊 Production Checklist

Before going live:

- [ ] Database initialized with `sql/init.sql`
- [ ] Environment variables set (`POSTGRES_URL`, `JWT_SECRET`)
- [ ] API endpoints tested
- [ ] Login flow tested
- [ ] Registration flow tested
- [ ] Token refresh tested
- [ ] Logout tested
- [ ] CORS configured correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)

---

## 🚀 Deployment Commands

### **Deploy to Production**
```bash
vercel --prod
```

### **Deploy to Preview**
```bash
vercel
```

### **View Deployments**
```bash
vercel ls
```

### **Remove Deployment**
```bash
vercel rm <deployment-url>
```

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Test login at your Vercel URL
2. ✅ Configure custom domain (optional)
3. ✅ Set up monitoring and alerts
4. ✅ Add more users via registration
5. ✅ Customize roles and permissions

---

## 📊 Architecture Benefits

### **Vercel Advantages** ✅
- ✅ Automatic scaling
- ✅ Global CDN
- ✅ Zero configuration
- ✅ Instant deployments
- ✅ Preview deployments for PRs
- ✅ Built-in analytics
- ✅ Free SSL certificates
- ✅ Serverless functions

### **Vercel Postgres Advantages** ✅
- ✅ Managed database
- ✅ Automatic backups
- ✅ Connection pooling
- ✅ Query editor
- ✅ Monitoring dashboard
- ✅ Scales automatically
- ✅ No server management

---

## 🎉 Conclusion

**VERCEL DEPLOYMENT READY!** ✅

### **What You Have**
- ✅ **Serverless API** - 4 auth endpoints
- ✅ **Managed Database** - Vercel Postgres
- ✅ **Production Ready** - Scalable architecture
- ✅ **Zero Config** - Just deploy
- ✅ **Global CDN** - Fast worldwide
- ✅ **Auto SSL** - Secure by default

---

**🚀 Deploy now with: `vercel --prod`** 🎉

**Your app will be live in seconds!** ✨

