# 🚀 ASAgents Deployment Guide

## ✅ Current Status

- **Development Server**: ✅ Running on http://localhost:3000
- **Production Build**: ✅ Completed successfully
- **Dependencies**: ✅ All installed (51 packages)
- **TypeScript**: ⚠️ Some type warnings (non-critical)
- **Build Size**: 755.51 kB (gzipped: 187.90 kB)

---

## 📦 Quick Deployment Commands

### Option 1: IONOS Webspace (Default - Configured)
```bash
npm run deploy
# or
npm run deploy:ionos
```

This will:
1. Build the production version
2. Upload via SFTP to your IONOS server
3. Deploy to: access-5018479682.webspace-host.com

**Requirements**: `lftp` (will auto-install via Homebrew if missing)

---

### Option 2: Vercel (Recommended for Easy Setup)
```bash
npm run deploy:vercel
```

**First time setup**:
```bash
npm i -g vercel
vercel login
```

**Environment Variables to Set in Vercel Dashboard**:
- `VITE_GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GITHUB_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_ID`

---

### Option 3: Netlify
```bash
npm run deploy:netlify
```

**First time setup**:
```bash
npm i -g netlify-cli
netlify login
netlify init
```

---

### Option 4: Docker
```bash
npm run deploy:docker
```

Then run:
```bash
docker run -p 80:80 asagents:latest
```

---

### Option 5: Build Only (Manual Deployment)
```bash
npm run build:prod
```

Files will be in `dist/` folder. Upload these to any static hosting.

---

## 🔧 Pre-Deployment Checklist

- [x] Dependencies installed
- [x] Environment variables configured
- [x] Production build successful
- [x] Deployment scripts created
- [ ] Choose deployment target
- [ ] Test production build locally
- [ ] Deploy!

---

## 🧪 Test Production Build Locally

```bash
npm run build
npm run preview
```

This will serve the production build at http://localhost:4173

---

## 🌍 Deployment Targets Comparison

| Target | Setup Time | Cost | Best For |
|--------|-----------|------|----------|
| **IONOS** | ⚡ Ready | Paid | You already have this configured |
| **Vercel** | 5 min | Free tier | Fastest deployment, best DX |
| **Netlify** | 5 min | Free tier | Great CI/CD integration |
| **Docker** | 10 min | Variable | Self-hosted, full control |

---

## 📝 Environment Variables

### Required in Production:
```env
VITE_GEMINI_API_KEY=your-key
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### Optional:
```env
VITE_GITHUB_CLIENT_ID=for-oauth
VITE_GOOGLE_CLIENT_ID=for-oauth
VITE_OPENAI_API_KEY=optional
VITE_ANTHROPIC_API_KEY=optional
```

---

## 🐛 Debugging Tips

### Build fails?
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### TypeScript errors?
The app builds fine with TypeScript warnings. They're non-critical type mismatches.

### Deployment fails?
```bash
# Test dry run first
npm run deploy:dry-run

# Check credentials
cat .env.local | grep DEPLOY
```

---

## 🎯 Recommended Deployment Flow

### For Quick Test:
```bash
npm run deploy:vercel
```

### For Production:
```bash
# 1. Test locally
npm run preview

# 2. Deploy to IONOS (you have credentials)
npm run deploy:ionos

# 3. Verify deployment
# Visit: https://access-5018479682.webspace-host.com
```

---

## 📊 Build Analysis

Current build output:
- **Main Bundle**: 755.51 kB (187.90 kB gzipped)
- **HTML**: 8.38 kB (2.70 kB gzipped)
- **Optimization**: Consider code-splitting for better load times

Performance notes:
- ⚠️ Large bundle warning (>500 kB)
- ✅ Gzip compression reduces size by 75%
- 💡 Consider lazy loading for route-based code splitting

---

## 🔒 Security Notes

Before deploying:
1. ✅ `.env.local` is in `.gitignore`
2. ✅ API keys are using `VITE_` prefix (exposed to client)
3. ⚠️ Never commit `.env.local` to Git
4. ✅ Use environment-specific secrets in production

---

## 🚨 Known Issues & Fixes

### Issue: "supercluster" dependency missing
**Status**: ✅ FIXED
**Solution**: `npm install supercluster`

### Issue: TypeScript type warnings in MapView.tsx
**Status**: ⚠️ Non-critical
**Impact**: None - app builds and runs fine
**To Fix**: Update react-leaflet type definitions (optional)

### Issue: Large bundle size
**Status**: ⚠️ Warning
**Impact**: Slower initial load
**To Fix**: Implement code splitting (future optimization)

---

## 📱 Post-Deployment Testing

After deploying, test:
- [ ] Login functionality
- [ ] Map rendering (Leaflet)
- [ ] AI features (Gemini API)
- [ ] Real-time updates (Socket.IO)
- [ ] Geolocation features
- [ ] File uploads
- [ ] Mobile responsiveness

---

## 🎉 Ready to Deploy!

**Recommended next step**:
```bash
npm run deploy
```

This will deploy to your configured IONOS server automatically.

**Alternative (easier)**:
```bash
npm run deploy:vercel
```

This is the fastest way to get online with automatic SSL and CDN.

---

## 📞 Deployment Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test the build locally first: `npm run preview`
4. Run dry-run to diagnose: `npm run deploy:dry-run`

**Deployment script location**: `./deploy.sh`
**Configuration files**: 
- `.env.production` - Production environment
- `vercel.json` - Vercel configuration
- `netlify.toml` - Netlify configuration
- `nginx.conf` - Docker/Nginx configuration
