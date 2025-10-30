# 🔧 Environment Variables Setup

## Required Environment Variables

### For Render.com Backend Deployment

```bash
# Core Settings
NODE_ENV=production
PORT=3001

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# AI Services (Optional)
OPENAI_API_KEY=sk-proj-your-openai-key
GEMINI_API_KEY=your-gemini-api-key

# Database (Optional - uses SQLite by default)
# POSTGRES_URL=postgres://user:pass@host:port/db

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Encryption (Optional)
ENCRYPTION_KEY=your-32-character-encryption-key

# Supabase (Optional)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## For Vercel Frontend

```bash
# API Connection
VITE_API_URL=https://your-backend-url.onrender.com/api

# Supabase (Optional)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Quick Setup Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Generate Encryption Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment Checklist

### Render.com Backend
- [ ] NODE_ENV=production
- [ ] PORT=3001
- [ ] JWT_SECRET=(generated)
- [ ] OPENAI_API_KEY=(optional)
- [ ] GEMINI_API_KEY=(optional)

### Vercel Frontend
- [ ] VITE_API_URL=https://your-backend-url.onrender.com/api
- [ ] VITE_SUPABASE_URL=(optional)
- [ ] VITE_SUPABASE_ANON_KEY=(optional)

## Test Credentials

```
Email: adrian.stanca1@gmail.com
Password: parola123
```

## URLs

- Frontend: https://cortex-build-r8mkvuegc-adrian-b7e84541.vercel.app
- Backend: https://your-backend-url.onrender.com
