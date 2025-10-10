# 🚀 Deploy via GitHub - ConstructAI

**Easiest Method**: Deploy directly from GitHub to Vercel

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ Code ready (already done!)

---

## 🎯 Step-by-Step Deployment

### **Step 1: Push Code to GitHub**

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create GitHub repo and push
# (Follow GitHub instructions to create new repo)
git remote add origin https://github.com/YOUR_USERNAME/constructai.git
git branch -M main
git push -u origin main
```

### **Step 2: Connect to Vercel**

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Import Project**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select your GitHub repository

3. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Click "Deploy"**
   - Vercel will start building
   - Wait ~2 minutes

### **Step 3: Create Postgres Database**

1. **In Vercel Dashboard**
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"

2. **Configure Database**
   - Name: `constructai-db`
   - Region: Choose closest to you
   - Click "Create"

3. **Connect to Project**
   - Select your project: `constructai`
   - Click "Connect"

### **Step 4: Initialize Database**

1. **Open Query Editor**
   - In database → "Query" tab

2. **Run Schema**
   - Copy content from `sql/init.sql`
   - Paste in editor
   - Click "Run Query"

3. **Verify Tables**
   - Check "Data" tab
   - Should see:
     - companies (1 row)
     - users (3 rows)
     - sessions (0 rows)

### **Step 5: Set Environment Variables**

1. **Go to Project Settings**
   - Your project → Settings → Environment Variables

2. **Add JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: Generate with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Environment: Production, Preview, Development
   - Click "Save"

3. **POSTGRES_URL is Auto-Added**
   - Vercel automatically adds this when you connect the database
   - No need to add manually

### **Step 6: Redeploy**

1. **Trigger Redeploy**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

2. **Wait for Deployment**
   - Should take ~1-2 minutes
   - Status will change to "Ready"

### **Step 7: Test Your App**

1. **Open Production URL**
   - Click "Visit" button
   - Or go to: `https://your-project.vercel.app`

2. **Test Login**
   - Email: `adrian.stanca1@gmail.com`
   - Password: `Cumparavinde1`

3. **Verify Features**
   - Dashboard loads
   - Navigation works
   - No console errors

---

## 🎯 Alternative: Deploy via CLI (After GitHub Push)

If you prefer CLI after pushing to GitHub:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link to existing project
vercel link

# Pull environment variables
vercel env pull

# Deploy
vercel --prod
```

---

## 📊 Deployment Flow

```
┌─────────────────┐
│  Local Code     │
└────────┬────────┘
         │
         │ git push
         ▼
┌─────────────────┐
│  GitHub Repo    │
└────────┬────────┘
         │
         │ auto-deploy
         ▼
┌─────────────────┐
│  Vercel Build   │
└────────┬────────┘
         │
         │ deploy
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Production     │ ───► │ Vercel Postgres  │
│  (Live App)     │      │  (Database)      │
└─────────────────┘      └──────────────────┘
```

---

## ✅ Checklist

### **GitHub Setup**
- [ ] Code pushed to GitHub
- [ ] Repository is accessible

### **Vercel Setup**
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Initial deployment successful

### **Database Setup**
- [ ] Postgres database created
- [ ] Database connected to project
- [ ] Schema initialized (sql/init.sql)
- [ ] Tables verified

### **Environment Variables**
- [ ] JWT_SECRET added
- [ ] POSTGRES_URL auto-added
- [ ] Project redeployed

### **Testing**
- [ ] Production URL accessible
- [ ] Login works
- [ ] Dashboard displays
- [ ] API endpoints respond

---

## 🔍 Troubleshooting

### **Issue: Build Fails**
**Check:**
- Build logs in Vercel dashboard
- TypeScript errors
- Missing dependencies

**Solution:**
```bash
# Test build locally
npm run build

# Fix any errors
# Push to GitHub
# Vercel will auto-redeploy
```

### **Issue: API Returns 404**
**Check:**
- `api/` folder is in repository
- `vercel.json` is in repository
- Rewrites are configured

**Solution:**
- Verify `vercel.json` exists
- Check API files are in `api/auth/` folder
- Redeploy

### **Issue: Database Connection Error**
**Check:**
- Database is connected to project
- `POSTGRES_URL` environment variable exists
- Database is not paused

**Solution:**
- Go to Storage → Your database
- Click "Connect" → Select project
- Redeploy

### **Issue: Login Fails**
**Check:**
- Database is initialized
- Users table has data
- JWT_SECRET is set

**Solution:**
```bash
# Verify database has users
# Go to database → Query tab
SELECT * FROM users;

# Should return 3 users
```

---

## 🎉 Success!

### **Your App is Live When:**
- ✅ Production URL works
- ✅ Login successful
- ✅ Dashboard displays
- ✅ No errors in console
- ✅ API endpoints respond

### **Production URL Format:**
```
https://constructai-xyz123.vercel.app
```

### **Custom Domain (Optional)**
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS
4. SSL auto-configured

---

## 📚 Resources

### **Vercel**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- GitHub Integration: https://vercel.com/docs/git

### **GitHub**
- Create Repo: https://github.com/new
- Docs: https://docs.github.com

---

## 🎯 Next Steps After Deployment

1. **Configure Custom Domain** (optional)
2. **Set Up Monitoring**
3. **Enable Analytics**
4. **Invite Team Members**
5. **Set Up CI/CD**

---

**🚀 Ready to deploy? Push to GitHub and import to Vercel!** 🎉

