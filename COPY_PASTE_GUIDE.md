# Environment Variables - Copy & Paste Guide

## 🎯 Quick Copy Format

Use this section to quickly copy each variable. Click the copy button or select and copy the text.

---

## Variable 1: SUPABASE_URL

**Name to copy:**
```
SUPABASE_URL
```

**Value to copy:**
```
<YOUR_SUPABASE_URL>
```

---

## Variable 2: SUPABASE_SERVICE_KEY

**Name to copy:**
```
SUPABASE_SERVICE_KEY
```

**Value to copy:**
```
<YOUR_SUPABASE_SERVICE_KEY>
```

---

## Variable 3: JWT_SECRET

**Name to copy:**
```
JWT_SECRET
```

**Value to copy:**
```
cortexbuild-prod-secret-key-2025
```

---

## 📋 All Variables in One Table

| # | Name | Value |
|---|------|-------|
| 1 | SUPABASE_URL | <YOUR_SUPABASE_URL> |
| 2 | SUPABASE_SERVICE_KEY | <YOUR_SUPABASE_SERVICE_KEY> |
| 3 | JWT_SECRET | cortexbuild-prod-secret-key-2025 |

---

## 🔄 Step-by-Step Process

### Step 1: Open Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Log in if needed

### Step 2: Select CortexBuild Project
- Find and click on your CortexBuild project

### Step 3: Go to Settings
- Click the **Settings** tab at the top

### Step 4: Click Environment Variables
- In the left sidebar, click **Environment Variables**

### Step 5: Add First Variable (SUPABASE_URL)
1. Click **Add New** button
2. In **Name** field, paste: `SUPABASE_URL`
3. In **Value** field, paste: `https://zpbuvuxpfemldsknerew.supabase.co`
4. Select all environments: ✓ Production, ✓ Preview, ✓ Development
5. Click **Save**

### Step 6: Add Second Variable (SUPABASE_SERVICE_KEY)
1. Click **Add New** button
2. In **Name** field, paste: `SUPABASE_SERVICE_KEY`
3. In **Value** field, paste: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYnV2dXhwZmVtbGRza25lcmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExNDMxNywiZXhwIjoyMDcxNjkwMzE3fQ.gY8kq22SiOxULPdpdhf-sz-C7V9hC2ZtPy5003UYsik`
4. Select all environments: ✓ Production, ✓ Preview, ✓ Development
5. Click **Save**

### Step 7: Add Third Variable (JWT_SECRET)
1. Click **Add New** button
2. In **Name** field, paste: `JWT_SECRET`
3. In **Value** field, paste: `cortexbuild-prod-secret-key-2025`
4. Select all environments: ✓ Production, ✓ Preview, ✓ Development
5. Click **Save**

### Step 8: Verify All Variables Are Set
- You should see all three variables listed:
  - ✅ SUPABASE_URL
  - ✅ SUPABASE_SERVICE_KEY
  - ✅ JWT_SECRET

---

## ✅ Verification Checklist

After adding all variables, verify:

- [ ] All three variables appear in the Environment Variables list
- [ ] SUPABASE_URL value is correct
- [ ] SUPABASE_SERVICE_KEY value is correct (long JWT token)
- [ ] JWT_SECRET value is correct
- [ ] All three have checkmarks for Production, Preview, Development environments

---

## 🚀 Next Steps After Setting Variables

1. **Go to Deployments Tab**
   - Click the **Deployments** tab

2. **Find Latest Deployment**
   - Look for the most recent deployment at the top

3. **Redeploy**
   - Click the **...** (three dots) menu
   - Select **Redeploy**
   - Confirm if prompted

4. **Wait for Deployment**
   - Status should change to "Ready"
   - Usually takes 2-5 minutes

5. **Test the API**
   - Once deployment is ready, run:
   ```bash
   node test-login-api.js
   ```

---

## 📝 Important Notes

⚠️ **Security:**
- SUPABASE_SERVICE_KEY is sensitive
- Keep it secure and never share publicly
- Never commit to version control

✅ **Environments:**
- Always select ALL THREE environments:
  - Production (live deployment)
  - Preview (preview deployments)
  - Development (local development)

🔄 **After Changes:**
- Redeployment is required for changes to take effect
- Environment variables are only available after redeployment

---

## 🆘 Troubleshooting

**Variables not working after redeployment?**
- Verify values are copied exactly (no extra spaces)
- Check all three environments are selected
- Verify redeployment completed successfully
- Check Vercel function logs for errors

**Can't find Environment Variables in Settings?**
- Make sure you're in the Settings tab
- Look in the left sidebar
- Try scrolling down if not visible

**Redeployment stuck?**
- Click on the deployment to see logs
- Look for error messages
- Try redeploying again

---

## 📞 Files Available

- **VERCEL_ENV_VARS_TO_COPY.md** - Detailed markdown format
- **ENV_VARS_SIMPLE.txt** - Plain text format
- **env-vars.json** - JSON format
- **COPY_PASTE_GUIDE.md** - This file

Choose whichever format works best for you!

---

**Ready to add these to Vercel? Start with Step 1 above! 🚀**

