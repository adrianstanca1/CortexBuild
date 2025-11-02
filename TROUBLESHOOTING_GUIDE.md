# 🔧 Troubleshooting Guide - CortexBuild

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start backend server (in another terminal)
npm run server

# Run both simultaneously
npm run dev:all
```

---

## ❌ Common Issues & Solutions

### **Issue 1: Dev Server Won't Start**

**Error**: `Failed to resolve dependency`

**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
npm install

# Start dev server
npm run dev
```

---

### **Issue 2: Supabase Connection Failed**

**Error**: `Supabase client not configured` or empty URL

**Solution**:
1. Check `.env.local` exists in project root
2. Verify environment variables:
   ```env
   VITE_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Restart dev server: `npm run dev`

---

### **Issue 3: Login Not Working**

**Error**: `Login failed` or `Authentication error`

**Solution**:
1. Verify backend is running: `npm run server`
2. Check backend is on port 5000
3. Verify Supabase credentials in `.env.local`
4. Check browser console for detailed error
5. Test with correct credentials:
   - Email: `adrian.stanca1@gmail.com`
   - Password: `parola123`

---

### **Issue 4: Build Fails**

**Error**: `TypeScript errors` or `Module not found`

**Solution**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
```

---

### **Issue 5: Port Already in Use**

**Error**: `Port 3000 already in use`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

---

## 🔍 Debugging Tips

### **Enable Debug Logging**
```typescript
// In any component
console.log('🔍 Debug:', variable);
console.error('❌ Error:', error);
console.warn('⚠️ Warning:', warning);
```

### **Check Network Requests**
1. Open DevTools (F12)
2. Go to Network tab
3. Look for failed requests
4. Check response status and body

### **React DevTools**
1. Install React DevTools extension
2. Inspect component props and state
3. Check component hierarchy

### **Supabase Console**
1. Go to https://supabase.com/dashboard
2. Select project: `supabase-indigo-umbrella`
3. Check:
   - SQL Editor for queries
   - Auth tab for users
   - Logs for errors

---

## 📊 Environment Variables

### **Development (.env.local)**
```env
VITE_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your-key-here
VITE_OPENAI_API_KEY=your-key-here
```

### **Production (Vercel)**
Set in Vercel Dashboard → Settings → Environment Variables

---

## 🧪 Testing

### **Test Login Flow**
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000
3. Click "Login"
4. Enter test credentials
5. Should redirect to dashboard

### **Test API Calls**
```bash
# Check if backend is running
curl http://localhost:5000/health

# Test auth endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📝 Useful Commands

```bash
# Development
npm run dev              # Start frontend
npm run server           # Start backend
npm run dev:all          # Start both

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint

# Database
npm run server           # Initialize database

# Deployment
npm run vercel:dev       # Vercel dev mode
npm run vercel:deploy    # Deploy to Vercel
```

---

## 🆘 Getting Help

1. **Check logs**: Browser console (F12) and terminal
2. **Read error messages**: They usually tell you what's wrong
3. **Check .env.local**: Verify all required variables are set
4. **Restart dev server**: Often fixes temporary issues
5. **Clear cache**: `rm -rf node_modules/.vite`
6. **Reinstall dependencies**: `npm install`

---

## ✅ Health Check

Run this to verify everything is working:

```bash
# 1. Check Node version
node --version  # Should be 18+

# 2. Check npm
npm --version

# 3. Check dependencies
npm list react react-dom

# 4. Start dev server
npm run dev

# 5. Open browser
# http://localhost:3000
```

If all steps pass, your environment is ready! 🎉

