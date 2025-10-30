# Environment Variables - Complete Reference

## 🎯 Quick Start

You need to add **3 environment variables** to your Vercel project. I've created **6 different formats** to make it easy.

---

## 📋 The 3 Variables You Need

### 1️⃣ SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://zpbuvuxpfemldsknerew.supabase.co`

### 2️⃣ SUPABASE_SERVICE_KEY
- **Name:** `SUPABASE_SERVICE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYnV2dXhwZmVtbGRza25lcmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExNDMxNywiZXhwIjoyMDcxNjkwMzE3fQ.gY8kq22SiOxULPdpdhf-sz-C7V9hC2ZtPy5003UYsik`

### 3️⃣ JWT_SECRET
- **Name:** `JWT_SECRET`
- **Value:** `cortexbuild-prod-secret-key-2025`

---

## 📁 Choose Your Format

| File | Best For | Format |
|------|----------|--------|
| **COPY_PASTE_GUIDE.md** ⭐ | Complete guide with steps | Markdown |
| **VERCEL_CONFIG_READY.md** | Quick reference + instructions | Markdown |
| **VERCEL_ENV_VARS_TO_COPY.md** | Detailed reference | Markdown |
| **ENV_VARS_SIMPLE.txt** | Plain text format | Text |
| **ENV_VARS_RAW.txt** | Just names and values | Text |
| **env-vars.json** | JSON format | JSON |

**Recommendation:** Start with **COPY_PASTE_GUIDE.md** for the complete step-by-step process.

---

## 🚀 Quick Steps

1. **Open Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select CortexBuild Project**
   - Click on your project

3. **Go to Settings → Environment Variables**
   - Click Settings tab
   - Click Environment Variables in sidebar

4. **Add 3 Variables**
   - For each variable:
     - Click "Add New"
     - Paste Name
     - Paste Value
     - Select all environments (Production, Preview, Development)
     - Click Save

5. **Redeploy**
   - Go to Deployments tab
   - Click ... on latest deployment
   - Select Redeploy
   - Wait for completion

6. **Test**
   - Run: `node test-login-api.js`

---

## ✅ Verification Checklist

After adding variables:

- [ ] All 3 variables appear in Environment Variables list
- [ ] SUPABASE_URL is correct
- [ ] SUPABASE_SERVICE_KEY is correct (long JWT token)
- [ ] JWT_SECRET is correct
- [ ] All 3 have checkmarks for Production, Preview, Development
- [ ] Redeployment completed successfully
- [ ] API test passes

---

## 📝 Important Notes

⚠️ **Security:**
- SUPABASE_SERVICE_KEY is sensitive
- Keep it secure
- Never share publicly
- Never commit to version control

✅ **Environments:**
- Always select ALL THREE:
  - Production
  - Preview
  - Development

🔄 **Redeployment:**
- Required for variables to take effect
- Vercel rebuilds automatically

---

## 🆘 Troubleshooting

**Variables not working?**
- Check values are copied exactly (no extra spaces)
- Verify all 3 environments are selected
- Confirm redeployment completed

**Can't find Environment Variables?**
- Make sure you're in Settings tab
- Look in left sidebar
- Scroll if not visible

**Redeployment failed?**
- Click deployment to see logs
- Look for error messages
- Try redeploying again

---

## 📞 Next Steps

1. **Choose a file** from the 6 options above
2. **Copy the values** into Vercel
3. **Redeploy** your project
4. **Test** with `node test-login-api.js`
5. **Verify** login works in frontend

---

## 🎉 You're All Set!

All environment variables are prepared and ready to copy. Pick your favorite format and get started!

**Start with COPY_PASTE_GUIDE.md for the complete step-by-step process.**

Good luck! 🚀

