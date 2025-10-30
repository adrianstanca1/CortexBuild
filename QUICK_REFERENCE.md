# CortexBuild Login Fix - Quick Reference Card

## 🚀 Quick Start (20 minutes)

### Step 1: Set Environment Variables
```
URL: https://vercel.com/dashboard
→ Select CortexBuild project
→ Settings → Environment Variables
→ Add 3 variables:

SUPABASE_URL = <YOUR_SUPABASE_URL>

SUPABASE_SERVICE_KEY = <YOUR_SUPABASE_SERVICE_KEY>

JWT_SECRET = cortexbuild-prod-secret-key-2025
```

### Step 2: Disable Deployment Protection
```
URL: https://vercel.com/dashboard
→ Select CortexBuild project
→ Settings → Deployment Protection
→ Click Disable
→ Confirm
```

### Step 3: Redeploy
```
URL: https://vercel.com/dashboard
→ Select CortexBuild project
→ Deployments tab
→ Click ... on latest deployment
→ Select Redeploy
→ Wait for completion
```

### Step 4: Test API
```bash
node test-login-api.js
```

### Step 5: Test Frontend
```
URL: https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app
Email: adrian.stanca1@gmail.com
Password: password123
```

### Step 6: Re-enable Protection
```
URL: https://vercel.com/dashboard
→ Select CortexBuild project
→ Settings → Deployment Protection
→ Click Enable
→ Save
```

---

## 📋 Environment Variables

| Name | Value |
|------|-------|
| SUPABASE_URL | https://zpbuvuxpfemldsknerew.supabase.co |
| SUPABASE_SERVICE_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYnV2dXhwZmVtbGRza25lcmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExNDMxNywiZXhwIjoyMDcxNjkwMzE3fQ.gY8kq22SiOxULPdpdhf-sz-C7V9hC2ZtPy5003UYsik |
| JWT_SECRET | cortexbuild-prod-secret-key-2025 |

---

## 🧪 Test Credentials

| Field | Value |
|-------|-------|
| Email | adrian.stanca1@gmail.com |
| Password | password123 |

---

## 🔗 Important URLs

| Purpose | URL |
|---------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Frontend App | https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app |
| Supabase Dashboard | https://app.supabase.com |

---

## 📁 Documentation Files

| File | Purpose |
|------|---------|
| LOGIN_FIX_ACTION_PLAN.md | Step-by-step instructions |
| VERCEL_DEPLOYMENT_PROTECTION_ISSUE.md | Technical explanation |
| LOGIN_TROUBLESHOOTING_SUMMARY.md | Complete overview |
| FINAL_STATUS_REPORT.md | Project status |
| QUICK_REFERENCE.md | This file |

---

## 🧪 Test Scripts

```bash
# Test API endpoint
node test-login-api.js

# Or use bash
bash test-login-api.sh
```

---

## ✅ Expected Results

### API Test Success
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ...",
  "user": {
    "email": "adrian.stanca1@gmail.com",
    "name": "Adrian Stanca",
    "role": "admin"
  }
}
```

### Frontend Login Success
- ✅ Login form submits
- ✅ No console errors
- ✅ Redirected to dashboard
- ✅ User info displayed

---

## ❌ Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| 405 Method Not Allowed | Deployment Protection enabled | Disable protection |
| 401 Unauthorized | Invalid credentials | Check email/password |
| CORS Error | CORS headers missing | Already fixed, redeploy |
| 500 Error | Build failed | Check Vercel logs |
| Blank Page | Environment vars missing | Set in Vercel |

---

## 📊 Status Checklist

- [ ] Environment variables set in Vercel
- [ ] Deployment Protection disabled
- [ ] Redeployment triggered
- [ ] Redeployment completed
- [ ] API test passed
- [ ] Frontend login works
- [ ] Dashboard accessible
- [ ] Deployment Protection re-enabled

---

## 🎯 Success Criteria

✅ API returns 200 status
✅ API returns valid JWT token
✅ Frontend login form works
✅ User redirected to dashboard
✅ User session maintained
✅ No console errors

---

## 📞 Need Help?

1. Check `LOGIN_FIX_ACTION_PLAN.md` for detailed steps
2. Run `node test-login-api.js` to test API
3. Check Vercel logs for errors
4. Check browser console (F12) for frontend errors
5. Verify environment variables are set correctly

---

## ⏱️ Time Estimate

- Set environment variables: 5 min
- Disable protection: 2 min
- Redeploy: 5 min
- Test API: 2 min
- Test frontend: 5 min
- Re-enable protection: 2 min

**Total: ~20 minutes**

---

## 🎉 You're All Set!

All code fixes are deployed. Just follow the 6 steps above and login will work!

Good luck! 🚀

