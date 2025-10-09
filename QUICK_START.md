# ⚡ Quick Start - ConstructAI

Get up and running in 5 minutes!

---

## 🚀 Deploy to Vercel (Production)

### **1. Create Vercel Account**
```
https://vercel.com → Sign up with GitHub
```

### **2. Create Database**
```
Dashboard → Storage → Create Database → Postgres
Name: constructai-db
Region: Choose closest to you
```

### **3. Initialize Database**
```
Go to database → Query tab
Copy content from: sql/init.sql
Click "Run Query"
```

### **4. Set Environment Variables**
```
Project Settings → Environment Variables

Add:
POSTGRES_URL = <from database .env.local tab>
JWT_SECRET = <generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

### **5. Deploy**
```bash
npx vercel --prod
```

**Done! Your app is live!** 🎉

---

## 💻 Local Development

### **Option 1: Vite Only (Frontend)**
```bash
npm install
npm run dev
```
Open http://localhost:3000

### **Option 2: Full Stack (Frontend + Backend)**
```bash
npm install
npm run dev:all
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 🔐 Login

**Super Admin:**
```
Email: adrian.stanca1@gmail.com
Password: Cumparavinde1
```

**Company Admin:**
```
Email: casey@constructco.com
Password: password123
```

---

## 📊 What's Included

- ✅ JWT Authentication
- ✅ Vercel Postgres Database
- ✅ 4 API Endpoints
- ✅ Modern Dashboard
- ✅ Multi-Tenant Support
- ✅ AI Features

---

## 🎯 Commands

```bash
# Development
npm run dev              # Start frontend
npm run dev:all          # Start frontend + backend

# Vercel
npm run vercel:dev       # Vercel dev server
npm run vercel:deploy    # Deploy preview
npm run vercel:prod      # Deploy production

# Build
npm run build            # Build for production
```

---

## 📚 Documentation

- **Full Deployment Guide**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Deployment Ready**: `DEPLOYMENT_READY.md`
- **Auth Implementation**: `REAL_AUTH_IMPLEMENTATION.md`

---

## 🆘 Need Help?

**Common Issues:**

1. **Can't login locally?**
   - Make sure backend is running: `npm run dev:all`

2. **Vercel deployment fails?**
   - Check environment variables are set
   - Verify database is initialized

3. **Database connection error?**
   - Verify `POSTGRES_URL` is correct
   - Check database is running

---

**🚀 That's it! You're ready to go!** 🎉

