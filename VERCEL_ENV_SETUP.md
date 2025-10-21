# Vercel Environment Variables Setup

## ⚠️ CRITICAL: Manual Setup Required

The Vercel CLI has issues with setting environment variables via stdin. You need to set them manually in the Vercel dashboard.

---

## 🔧 **Steps to Fix Login**

### **1. Go to Vercel Dashboard**
https://vercel.com/adrian-b7e84541/constructai-5/settings/environment-variables

### **2. Add/Update These Environment Variables**

#### **VITE_SUPABASE_URL**
- **Value:** `https://qglvhxkgbzujglehewsa.supabase.co`
- **Environments:** Production, Preview, Development

#### **SUPABASE_SERVICE_KEY**
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbHZoeGtnYnp1amdsZWhld3NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIzNzkwMSwiZXhwIjoyMDczODEzOTAxfQ.eg6hoz1bIc1FzPjMAs8oaCuv1yjymxk_5MYjpg9vEFQ`
- **Environments:** Production, Preview, Development

#### **JWT_SECRET**
- **Value:** `cortexbuild-dev-secret-key-2024`
- **Environments:** Production, Preview, Development

#### **VITE_SUPABASE_ANON_KEY**
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbHZoeGtnYnp1amdsZWhld3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzc5MDEsImV4cCI6MjA3MzgxMzkwMX0.DxhGOBDyvSzuVYrUcDRcs3iBUN_knTUVcHXqNNkoogY`
- **Environments:** Production, Preview, Development

---

### **3. Redeploy**
After setting the environment variables, redeploy:
```bash
vercel --prod
```

---

## 🧪 **Test Login**

**URL:** https://constructai-5.vercel.app (or latest deployment URL)

**Credentials:**
- Email: `super@admin.com`
- Password: `test123`

---

## 📝 **Why This Happened**

The Vercel CLI's `vercel env add` command doesn't properly handle stdin input with pipes or redirects. The environment variables were being truncated to just the first character.

**Solution:** Set them manually in the Vercel dashboard.

---

## ✅ **Verification**

After redeploying, test the environment variables:
```bash
curl https://constructai-5.vercel.app/api/test-env
```

Should show:
```json
{
  "env": {
    "VITE_SUPABASE_URL": "SET",
    "SUPABASE_SERVICE_KEY": "SET (length: 205)",  // Should be ~205, not 1!
    "JWT_SECRET": "SET"
  },
  "supabaseUrl": "https://qglvhxkgbzujglehewsa.supabase.co"
}
```

---

## 🎯 **Summary**

**Problem:** Login failing due to incorrect environment variables in Vercel  
**Cause:** Vercel CLI truncating values when set via stdin  
**Solution:** Set manually in Vercel dashboard  
**Status:** ⏳ Waiting for manual setup

---

**Once you've set the environment variables in the Vercel dashboard and redeployed, the login should work!** 🚀

