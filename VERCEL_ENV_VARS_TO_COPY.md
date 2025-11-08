# Vercel Environment Variables - Copy & Paste Format

## Instructions
Copy each variable name and value separately into Vercel dashboard:
1. Go to Settings → Environment Variables
2. Click "Add New"
3. Paste the **Name** into the Name field
4. Paste the **Value** into the Value field
5. Select all environments (Production, Preview, Development)
6. Click Save
7. Repeat for each variable

---

## Variable 1: SUPABASE_URL

### Name (Copy this):
```
SUPABASE_URL
```

### Value (Copy this):
```
<YOUR_SUPABASE_URL>
```

---

## Variable 2: SUPABASE_SERVICE_KEY

### Name (Copy this):
```
SUPABASE_SERVICE_KEY
```

### Value (Copy this):
```
<YOUR_SUPABASE_SERVICE_KEY>
```

---

## Variable 3: JWT_SECRET

### Name (Copy this):
```
JWT_SECRET
```

### Value (Copy this):
```
cortexbuild-prod-secret-key-2025
```

---

## Quick Reference Table

| Variable Name | Value |
|---|---|
| SUPABASE_URL | <YOUR_SUPABASE_URL> |
| SUPABASE_SERVICE_KEY | <YOUR_SUPABASE_SERVICE_KEY> |
| JWT_SECRET | cortexbuild-prod-secret-key-2025 |

---

## Step-by-Step in Vercel

### For Each Variable:

1. **Open Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select CortexBuild Project**
   - Click on your project

3. **Go to Settings**
   - Click Settings tab

4. **Click Environment Variables**
   - In left sidebar

5. **Click Add New**
   - Green button

6. **Paste Name**
   - Copy from "Name (Copy this)" section above
   - Paste into Name field

7. **Paste Value**
   - Copy from "Value (Copy this)" section above
   - Paste into Value field

8. **Select Environments**
   - Check: Production ✓
   - Check: Preview ✓
   - Check: Development ✓

9. **Click Save**
   - Button at bottom

10. **Repeat for next variable**
    - Go back to step 5

---

## Verification Checklist

After adding all three variables, verify:

- [ ] SUPABASE_URL is set to: `<YOUR_SUPABASE_URL>`
- [ ] SUPABASE_SERVICE_KEY is set to: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
- [ ] JWT_SECRET is set to a strong random value
- [ ] All three variables show in the Environment Variables list
- [ ] All three have checkmarks for Production, Preview, Development

---

## Important Notes

⚠️ **Security:**
- SUPABASE_SERVICE_KEY is sensitive - keep it secure
- Never share these values publicly
- Never commit them to version control
- They're only used server-side in Vercel functions

✅ **Environments:**
- Make sure to select ALL THREE environments:
  - Production (for live deployment)
  - Preview (for preview deployments)
  - Development (for local development)

🔄 **After Setting Variables:**
1. Go to Deployments tab
2. Click ... on latest deployment
3. Select Redeploy
4. Wait for deployment to complete

---

## Need Help?

If you have issues:
1. Double-check the values are copied exactly (no extra spaces)
2. Make sure all three environments are selected
3. Verify the variables appear in the list after saving
4. Check that you're in the correct project

Once all variables are set and redeployed, run:
```bash
node test-login-api.js
```

This will verify the API endpoint is working correctly.

