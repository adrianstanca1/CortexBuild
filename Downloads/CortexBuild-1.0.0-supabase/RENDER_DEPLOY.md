# 🚀 ONE-CLICK DEPLOY TO RENDER.COM

## ✅ **DEPLOY BACKEND IN 2 CLICKS!**

### **Step 1: Click Deploy Button**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/adrianstanca1/CortexBuild)

### **Step 2: Configure (auto-filled)**

Render will automatically:
- ✅ Read `render.yaml` configuration
- ✅ Set up environment variables
- ✅ Install dependencies
- ✅ Start the server

### **Step 3: Wait 2-3 minutes**

Backend will be live at:
```
https://cortexbuild-backend.onrender.com
```

---

## 🔧 **MANUAL DEPLOYMENT (Alternative)**

If the button doesn't work, follow these steps:

### **1. Go to Render Dashboard**
```
https://dashboard.render.com/
```

### **2. Create New Web Service**
- Click "New +" → "Web Service"
- Connect GitHub: `adrianstanca1/CortexBuild`
- Branch: `main`

### **3. Configuration**
```
Name: cortexbuild-backend
Region: Oregon (US West)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm run server
Plan: Free
```

### **4. Environment Variables**
```
NODE_ENV=production
PORT=5000
JWT_SECRET=cortexbuild-super-secret-key-2025
FRONTEND_URL=https://cortex-build-9d882ymnj-adrian-b7e84541.vercel.app
```

### **5. Deploy!**
Click "Create Web Service" and wait 2-3 minutes.

---

## 📊 **AFTER DEPLOYMENT**

### **1. Get Backend URL**
```
Example: https://cortexbuild-backend.onrender.com
```

### **2. Update Frontend**

Update Vercel environment variable:
```bash
# Via Vercel Dashboard:
# Settings → Environment Variables
# Add: VITE_API_URL = https://cortexbuild-backend.onrender.com
# Redeploy
```

### **3. Test Login**

Go to:
```
https://cortex-build-9d882ymnj-adrian-b7e84541.vercel.app
```

Login with:
```
Email: adrian.stanca1@gmail.com
Password: parola123
```

---

## ✅ **DEPLOYMENT CHECKLIST**

- [x] Frontend deployed on Vercel
- [ ] Backend deployed on Render
- [ ] Environment variables set
- [ ] Frontend updated with backend URL
- [ ] Login tested

---

## 🎉 **SUCCESS!**

Once deployed, your full-stack application will be live!

**Frontend:** https://cortex-build-9d882ymnj-adrian-b7e84541.vercel.app
**Backend:** https://cortexbuild-backend.onrender.com (after deployment)

---

**Need help? Let me know!** 🚀

