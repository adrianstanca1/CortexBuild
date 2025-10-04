# Quick Reference - ASAgents Construction Platform

## 🚀 Deployment Info

**Production URL**: https://asagents-final-8dc7s1bfk-adrian-b7e84541.vercel.app
**Version**: 2.5.0
**Status**: ✅ Live and Operational

## 📦 Project Location

```
/Users/admin/Desktop/asagents---final (3)/
```

## ⚡ Quick Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Build
npm run build           # Build for production
npm run preview         # Preview production build

# Deploy
vercel --prod           # Deploy to Vercel production
```

## 🔑 Environment Variables

Located in `.env.local`:
- `VITE_OPENAI_API_KEY` - OpenAI API key ✅
- `VITE_GEMINI_API_KEY` - Google Gemini API key ✅

## 📊 Key Statistics

- **Total Components**: 55
- **Total Services**: 6
- **Total Files**: 104
- **Build Size**: 920KB
- **Build Time**: ~3 seconds

## 📁 Essential Files

- `README.md` - Main documentation
- `PROJECT_STATUS.md` - Complete project status
- `DEPLOYMENT_SUMMARY.md` - Latest deployment details
- `package.json` - Dependencies and scripts

## 🛠️ Tech Stack

- React 19.2.0
- TypeScript
- Vite
- Tailwind CSS
- Leaflet Maps
- OpenAI + Gemini AI

## ✨ Core Features

1. **Dashboard** - Comprehensive project overview
2. **Field Operations** - Daily logs, RFIs, plans viewer
3. **Project Management** - Tasks, documents, equipment
4. **Financial** - Budget tracking, invoices, estimates
5. **AI Tools** - Advisor, search, analytics, reports

## 🔧 Troubleshooting

**Build fails?**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**Deploy fails?**
```bash
vercel --prod --force
```

**Local dev issues?**
```bash
npm run dev -- --host
```

## 📞 Support

- Check inline code documentation
- Review PROJECT_STATUS.md
- See component files for specific features

## 🎯 Next Development Steps

1. Backend API integration
2. Database setup (PostgreSQL/Supabase)
3. Real WebSocket server
4. User authentication system
5. Mobile app (React Native)

---

**Last Updated**: January 2025
**Maintained By**: ASAgents Development Team
