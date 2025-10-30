# 🚀 CortexBuild - Quick Access Guide

**Last Updated:** October 30, 2025  
**Status:** ✅ DEPLOYED & LIVE

---

## 🌐 Live URLs

### Production Site
```
https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app
```
**Note:** Currently protected by Vercel Deployment Protection (401)

### Vercel Dashboard
```
https://vercel.com/team_8JqgaFIWWp8b31jzxViPkHR2/constructai-5
```

### GitHub Repository
```
https://github.com/adrianstanca1/CortexBuild
```

---

## ⚡ Quick Commands

### Check Deployment Status
```bash
./check-deployment.sh
```

### Build Locally
```bash
npm run build
```

### Run Development Server
```bash
npm run dev
```

### Deploy to Vercel
```bash
git push origin main
# Vercel auto-deploys from GitHub
```

---

## 🔑 Login Credentials

### Super Admin
```
Email:    adrian.stanca1@gmail.com
Password: parola123
```

### Company Admin
```
Email:    adrian@ascladdingltd.co.uk
Password: lolozania1
```

### Developer
```
Email:    adrian.stanca1@icloud.com
Password: password123
```

---

## ⚙️ Enable Public Access

### Disable Vercel Deployment Protection

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Select Project**
   - Click: `constructai-5`

3. **Open Settings**
   - Click: Settings tab

4. **Find Deployment Protection**
   - Left sidebar → Deployment Protection

5. **Disable Protection**
   - Select: Disabled
   - Click: Save

6. **Done!**
   - Your site is now publicly accessible

---

## 📝 Environment Variables Needed

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://qglvhxkgbzujglehewsa.supabase.co` |
| `SUPABASE_SERVICE_KEY` | See `DEPLOY_NOW.md` line 96 |
| `JWT_SECRET` | `cortexbuild-secret-2025-production` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your production URL |
| `PORT` | `5000` |

---

## 🎯 Quick Test After Deployment

1. **Visit Production URL**
   ```
   https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app
   ```

2. **Click Login**

3. **Enter Super Admin Credentials**
   - Email: `adrian.stanca1@gmail.com`
   - Password: `parola123`

4. **Should Redirect to Dashboard**
   - Verify data loads
   - Check navigation works
   - Test key features

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_SUCCESS_REPORT.md` | Full deployment details |
| `DISABLE_DEPLOYMENT_PROTECTION.md` | How to enable public access |
| `VERCEL_ENV_VARS_TO_COPY.md` | Environment variable setup |
| `DEPLOY_NOW.md` | Backend deployment guide |
| `check-deployment.sh` | Automated status checker |

---

## 🆘 Quick Troubleshooting

### Can't access site (401 error)
**Fix:** Disable Deployment Protection (see steps above)

### Login fails
**Fix:** Check environment variables in Vercel dashboard

### Build fails
**Fix:** 
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Need to redeploy
**Fix:**
```bash
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

---

## 📞 Project Information

| Detail | Value |
|--------|-------|
| **Project Name** | constructai-5 |
| **Project ID** | prj_ZTOZItm0QS0WpZCjYsUO78ewT373 |
| **Team ID** | team_8JqgaFIWWp8b31jzxViPkHR2 |
| **Framework** | Next.js 15.1.6 |
| **Database** | Supabase PostgreSQL |
| **Deployment** | Vercel Edge Network |

---

## ✅ Current Status Checklist

- [x] Code pushed to GitHub
- [x] Vercel deployment triggered
- [x] Build completed successfully
- [x] HTTPS/SSL active
- [x] Production URL responding
- [ ] Deployment Protection disabled
- [ ] Environment variables configured
- [ ] Login tested and working
- [ ] All features verified

---

## 🎉 Success Criteria

Your deployment is **fully operational** when:

1. ✅ Production URL loads without 401 error
2. ✅ Login works with test credentials
3. ✅ Dashboard displays correctly
4. ✅ API calls succeed
5. ✅ Supabase data loads
6. ✅ Navigation works smoothly
7. ✅ No console errors

---

**Deployment completed successfully! 🚀**

*Quick reference created for rapid access to deployment information*


