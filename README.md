# 🏗️ CortexBuild
**The Complete Construction Industry Platform**

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Supabase](https://img.shields.io/badge/supabase-enabled-3ECF8E.svg)
![Vercel](https://img.shields.io/badge/vercel-deployed-black.svg)

## 🎯 Overview

CortexBuild is a revolutionary construction industry platform combining:

- **Development Environment** (IDE, Sandbox, Git, API/SDK)
- **Modular App Architecture** (6 pre-installed apps)
- **Publishing Workflow** (dev → test → review → publish)
- **Public Marketplace** with monetization
- **Multi-tenant SaaS** with complete RBAC

## ✨ Key Features

### 🎛️ Three-Tier User Hierarchy

#### 🔴 Super Admin
- Platform-wide control
- 12 admin sections
- User management across all companies
- System configuration
- Analytics & monitoring

#### 🟠 Company Admin
- Company-only control
- **15 management sections:**
  - **Office Operations (7 sections):** Projects, Teams, Billing, Analytics
  - **Field Operations (8 sections):** Daily logs, Safety, Quality, Time tracking

#### 🟢 Developer
- Pure development tools
- 8 development sections
- SDK access
- API builder
- Testing framework
- Git integration

### 📱 6 Pre-Installed Marketplace Apps

1. **📊 Project Dashboard** - Comprehensive project analytics
2. **💬 Team Chat** - Real-time team communication
3. **⏱️ Time Tracker** - Track time on tasks and projects
4. **📅 Team Calendar** - Shared scheduling
5. **✅ Task Manager** - Task and assignment management
6. **💰 Expense Tracker** - Budget and expense tracking

### 🖥️ MyApplications Desktop

- Full desktop environment
- Window management (drag, resize, minimize, maximize)
- Taskbar with active applications
- Multi-window support
- Sandbox for running marketplace apps

### 🔐 Complete RBAC System

**5 Roles:**
- `super_admin` - Platform-wide access
- `company_admin` - Company-wide access
- `developer` - Development tools only
- `supervisor` - Team management
- `operative` - Field operations

**Granular Permissions:**
- Row Level Security (RLS) in Supabase
- Multi-tenant data isolation
- Company-based access control

## 🚀 Technology Stack

### Frontend
- **React 19.2.0** - UI framework
- **Next.js 15.5.6** (Turbopack) - Full-stack React framework
- **TypeScript 5.9.3** - Type safety
- **Vite 6.2.0** - Build tool
- **Tailwind CSS 4.1.14** - Styling
- **Lucide React 0.545.0** - Icons

### Backend
- **Express.js** - API server
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database
- **JWT** - Authentication

### Database
- **Supabase PostgreSQL** - Cloud database
- **Row Level Security** - Multi-tenant isolation
- **Real-time subscriptions** - Live updates
- **Automatic backups** - Data protection

### Deployment
- **Vercel** - Frontend hosting
- **Supabase** - Database hosting
- **GitHub** - Version control

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (paid plan recommended)

### 1. Clone Repository
```bash
git clone https://github.com/adrianstanca1/CortexBuild.git
cd CortexBuild
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API
VITE_API_URL=http://localhost:3001
```

### 4. Setup Supabase Database

1. Go to Supabase SQL Editor
2. Copy content from `supabase/COMPLETE_SCHEMA.sql` (or run the schema creation scripts)
3. Paste and run in SQL Editor
4. Update password hashes:
```sql
UPDATE users SET password_hash = crypt('parola123', gen_salt('bf', 10))
WHERE email = 'adrian.stanca1@gmail.com';

UPDATE users SET password_hash = crypt('lolozania1', gen_salt('bf', 10))
WHERE email = 'adrian@ascladdingltd.co.uk';

UPDATE users SET password_hash = crypt('password123', gen_salt('bf', 10))
WHERE email = 'adrian.stanca1@icloud.com';
```

### 5. Start Development Server
```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## 🔑 Test Accounts

### 🔴 Super Admin
- **Email:** `adrian.stanca1@gmail.com`
- **Password:** `parola123`

### 🟠 Company Admin
- **Email:** `adrian@ascladdingltd.co.uk`
- **Password:** `lolozania1`

### 🟢 Developer
- **Email:** `adrian.stanca1@icloud.com`
- **Password:** `password123`

## 📚 Documentation

- **Supabase Setup Guide** - Complete database setup
- **Final Setup Instructions** - Production deployment
- **Login Credentials** - All test accounts
- **Platform Architecture** - System design
- **API Documentation** - API reference

## 🌐 Live Demo

**Production URL:** https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app

## 📁 Project Structure

```
CortexBuild/
├── src/                    # Source code
├── components/             # React components
│   ├── screens/           # Dashboard screens
│   ├── desktop/           # MyApplications desktop
│   ├── marketplace/       # Marketplace components
│   └── developer/         # Developer tools
├── lib/                   # Libraries
│   ├── supabase/         # Supabase client
│   ├── rbac/             # RBAC system
│   └── services/         # API services
├── server/                # Backend server
│   ├── routes/           # API routes
│   └── services/         # Business logic
├── supabase/             # Supabase configuration
│   ├── COMPLETE_SCHEMA.sql
│   └── migrations/
├── public/               # Static assets
└── dist/                 # Build output
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run server       # Start backend server
npm run lint         # Run ESLint
npm run test         # Run unit tests (Jest)
npm run vercel:prod  # Deploy to Vercel production
```

### Environment Variables

**Frontend (.env.local):**
```env
VITE_SUPABASE_URL - Supabase project URL
VITE_SUPABASE_ANON_KEY - Supabase anon key
VITE_API_URL - Backend API URL
VITE_GEMINI_API_KEY - Google Gemini AI API key (optional)
```

**Backend:**
```env
SUPABASE_SERVICE_KEY - Supabase service role key
JWT_SECRET - JWT signing secret
PORT - Server port (default: 3001)
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

**Or manually:**
```bash
vercel login
vercel --prod --yes
```

### Database (Supabase)

1. Create Supabase project
2. Run schema creation scripts
3. Configure RLS policies
4. Update password hashes

## 🔒 Version Protection

**Current Version:** v2.0.0

This version is protected with Git tags. To restore:
```bash
git checkout v2.0.0
```

## 📊 Database Schema

### Main Tables

- `companies` - Multi-tenant companies
- `users` - User accounts with RBAC
- `projects` - Construction projects
- `sdk_apps` - Marketplace applications
- `user_app_installations` - User app installs
- `company_app_installations` - Company app installs
- `app_review_history` - App review workflow
- `app_analytics` - App usage analytics
- `activities` - Audit log

## 🤝 Contributing

This is a private project. For access, contact the repository owner.

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Adrian Stanca**
- Email: adrian.stanca1@gmail.com
- GitHub: [@adrianstanca1](https://github.com/adrianstanca1)

## 🎉 Acknowledgments

- Built with ❤️ for the construction industry
- Powered by Supabase and Vercel
- Designed for scalability and performance

---

**Last Updated:** 2025-11-02 | **Version:** 2.0.0
