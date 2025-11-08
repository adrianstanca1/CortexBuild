# 🚀 CortexBuild - Quick Start Guide

## ⚡ Start in 3 Commands

```bash
cd /Users/admin/main/CortexBuild
npm install
npm run dev:all
```

## 🌐 Access Your App

**Frontend:** http://localhost:5174/ (or http://localhost:3000)
**Backend:** http://localhost:3001/api

## 🔑 Demo Login

```
Email:    admin@cortexbuild.com
Password: admin123
```

## 📊 What You'll See

1. **Dashboard** - Project stats, quick actions
2. **Projects** - All construction projects
3. **Tasks** - Kanban board
4. **AI Chat** - Click icon (bottom right)
5. **Marketplace** - Browse & install apps

## 🎭 All Available Dashboards

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Super Admin | admin@cortexbuild.com | admin123 | Everything |
| Company Admin | company@demo.com | company123 | Company + Projects |
| Developer | developer@demo.com | dev123 | SDK & Tools |
| Project Manager | pm@demo.com | pm123 | Projects |
| Field Worker | worker@demo.com | worker123 | Daily Tasks |
| Client | client@demo.com | client123 | View Only |

## 🔌 API Quick Test

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cortexbuild.com","password":"admin123"}'

# Get projects (use token from login response)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/projects
```

## 📚 Full Documentation

- `COMPLETE_APP_OVERVIEW.md` - Complete technical docs
- `APP_DEMO_GUIDE.md` - Interactive walkthrough
- `YOUR_COMPLETE_APP.md` - Feature summary

## ✅ What's Included

- ✅ 15+ Dashboards
- ✅ 100+ API Endpoints
- ✅ 40+ Database Tables
- ✅ 400+ React Components
- ✅ AI Integration (Gemini)
- ✅ Real-Time Collaboration
- ✅ Developer SDK
- ✅ Global Marketplace

## 🎉 You're Ready!

Your complete construction management platform is ready to use!

**Start exploring:** http://localhost:5174/

