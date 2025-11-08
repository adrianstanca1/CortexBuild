# 🚀 CortexBuild - Quick Start Guide

**Status**: ✅ All bugs fixed and ready to go!

---

## ⚡ 30-Second Setup

```bash
# 1. Install dependencies (already done)
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# http://localhost:3000
```

**That's it!** Your dev server is running. 🎉

---

## 🔐 Test Login

Use these credentials to test:

```
Email:    adrian.stanca1@gmail.com
Password: parola123
Role:     Super Admin
```

Or try:
```
Email:    adrian@ascladdingltd.co.uk
Password: lolozania1
Role:     Company Admin
```

---

## 📊 What's Working

✅ Dev server (port 3000)  
✅ Supabase connection  
✅ Authentication  
✅ React components  
✅ TypeScript  
✅ Tailwind CSS  
✅ Error handling  

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start frontend
npm run server           # Start backend (port 5000)
npm run dev:all          # Start both

# Production
npm run build            # Build for production
npm run preview          # Preview build

# Linting
npm run lint             # Check code quality

# Deployment
npm run vercel:deploy    # Deploy to Vercel
```

---

## 📁 Project Structure

```
CortexBuild/
├── components/          # React components
│   ├── screens/        # Dashboard screens
│   ├── developer/      # Developer tools
│   ├── admin/          # Admin dashboards
│   └── marketplace/    # Marketplace
├── lib/                # Libraries
│   ├── supabase/      # Supabase client
│   └── services/      # API services
├── hooks/              # Custom hooks
├── utils/              # Utilities
├── types.ts            # TypeScript types
├── App.tsx             # Main app
└── index.tsx           # Entry point
```

---

## 🎯 Key Features

### 👥 Three User Roles
- **Super Admin** - Platform control
- **Company Admin** - Company management
- **Developer** - Development tools

### 📱 Main Modules
- Projects & Tasks
- RFIs & Punch Lists
- Daily Logs & Photos
- Drawings & Documents
- Time Tracking
- Accounting
- AI Tools
- Marketplace

### 🛠️ Developer Tools
- SDK Developer Console
- API Builder
- Workflow Builder
- Git Integration
- Code Sandbox

---

## 🔧 Environment Variables

Already configured in `.env.local`:

```env
VITE_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:5000
```

---

## 🐛 Bugs Fixed Today

### ✅ Bug #1: Vite Dependencies
- **Problem**: Dev server failed to start
- **Solution**: Updated vite.config.ts with missing dependencies
- **Result**: Dev server now running smoothly

### ✅ Bug #2: Missing .env.local
- **Problem**: Supabase not configured
- **Solution**: Created .env.local with all required variables
- **Result**: Supabase client properly initialized

---

## 📚 Documentation

- **BUG_FIXES_REPORT.md** - Detailed bug analysis
- **TROUBLESHOOTING_GUIDE.md** - Common issues & solutions
- **FIXES_SUMMARY.md** - Complete summary
- **README.md** - Project overview

---

## 🆘 Troubleshooting

### Dev server won't start?
```bash
rm -rf node_modules/.vite
npm install
npm run dev
```

### Supabase not connecting?
- Check `.env.local` exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server

### Login not working?
- Verify backend is running: `npm run server`
- Check browser console for errors
- Use correct test credentials

---

## 🎓 Next Steps

1. **Explore the Dashboard**
   - Login with test account
   - Navigate different sections
   - Check out developer tools

2. **Test Features**
   - Create a project
   - Add tasks
   - Upload documents
   - Try AI features

3. **Build Something**
   - Create a custom app
   - Use the SDK
   - Deploy to marketplace

4. **Deploy**
   - Build: `npm run build`
   - Deploy: `npm run vercel:deploy`

---

## 💡 Pro Tips

- Use `npm run dev:all` to run frontend + backend together
- Press `h + enter` in dev server for help
- Check browser console (F12) for debug info
- Use React DevTools for component inspection
- Monitor Supabase dashboard for database issues

---

## 📞 Support

**Need help?**
1. Check TROUBLESHOOTING_GUIDE.md
2. Review BUG_FIXES_REPORT.md
3. Check browser console for errors
4. Verify environment variables

---

## ✨ You're All Set!

Your CortexBuild development environment is ready. Start building! 🚀

```bash
npm run dev
```

Happy coding! 💻

