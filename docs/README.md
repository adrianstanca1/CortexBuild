# CortexBuild Documentation

Welcome to the CortexBuild documentation! This comprehensive guide covers everything you need to know about the platform.

---

## 📚 Documentation Index

### For New Developers
Start here if you're new to the project:
- **[Developer Onboarding Guide](./DEVELOPER_ONBOARDING.md)** - Get started with the codebase
  - Initial setup and prerequisites
  - Project structure overview
  - Development workflow
  - Common tasks and debugging

### For API Integration
If you're building integrations or using the API:
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
  - Authentication methods
  - All available endpoints
  - Request/response formats
  - Error handling and rate limiting
  - Webhook configuration

### For Frontend Development
If you're working on UI components:
- **[Component Documentation](./COMPONENT_DOCUMENTATION.md)** - React component guide
  - Core components
  - Dashboard components
  - UI components
  - Lazy loading components
  - Admin components
  - Usage examples and props

### For System Design
If you need to understand the architecture:
- **[Architecture Documentation](./ARCHITECTURE.md)** - System design and structure
  - Technology stack
  - Architecture layers
  - Role-based architecture
  - Data flow diagrams
  - Database schema
  - Performance architecture
  - Security architecture

### For Deployment
If you're deploying to production:
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment
  - Environment setup
  - Deployment steps
  - Production checklist
  - Troubleshooting
  - Monitoring and maintenance
  - Rollback procedures

---

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/adrianstanca1/CortexBuild.git
cd CortexBuild
npm install
cp .env.example .env.local
# Configure .env.local with your Supabase credentials
```

### 2. Start Development
```bash
npm run dev
# Open http://localhost:5173
```

### 3. Build for Production
```bash
npm run build
npm run preview
```

### 4. Run Tests
```bash
npm run test
npm run test:coverage
```

---

## 📋 Key Information

### Technology Stack
- **Frontend:** React 19.2.0 + TypeScript + Vite
- **Backend:** Supabase PostgreSQL
- **Hosting:** Vercel
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

### Project Statistics
- **Main Bundle:** 88.44 KB (gzip: 24.28 KB)
- **Total Gzipped:** ~570 KB
- **Build Time:** 12.02 seconds
- **Test Coverage:** 32 passing tests
- **Components:** 50+ React components

### Performance Optimizations
- ✅ Code splitting with Vite
- ✅ Lazy loading with React.lazy()
- ✅ Image optimization with WebP
- ✅ Service Worker for offline support
- ✅ HTTP caching headers
- ✅ Terser minification

### Security Features
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Row-level security (RLS)
- ✅ Audit logging
- ✅ HTTPS/TLS encryption
- ✅ Security headers

---

## 👥 User Roles

CortexBuild supports 5 user roles with strict separation:

1. **Super Admin** - Platform-wide system controls
2. **Company Admin** - Single company management
3. **Project Manager** - Project-level operations
4. **Developer** - SDK and API tools
5. **Regular User** - Day-to-day operations

Each role has its own dashboard with role-appropriate features.

---

## 🔄 Development Workflow

### Branch Naming
```
feature/description     - New feature
fix/description        - Bug fix
docs/description       - Documentation
perf/description       - Performance improvement
```

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
perf: Improve performance
refactor: Refactor code
test: Add tests
```

### Pull Request Process
1. Create feature branch
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Wait for review
6. Address feedback
7. Merge when approved

---

## 📊 Project Structure

```
CortexBuild/
├── components/          # React components
├── lib/                # Utility libraries
├── types/              # TypeScript types
├── public/             # Static assets
├── docs/               # Documentation (you are here)
├── App.tsx             # Root component
├── vite.config.ts      # Build configuration
├── tsconfig.json       # TypeScript config
├── package.json        # Dependencies
└── vercel.json         # Deployment config
```

---

## 🔗 Important Links

### External Resources
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

### Project Links
- [GitHub Repository](https://github.com/adrianstanca1/CortexBuild)
- [Production URL](https://constructai-5-kmg76x929-adrian-b7e84541.vercel.app)
- [Vercel Dashboard](https://vercel.com)
- [Supabase Dashboard](https://supabase.com)

---

## ❓ FAQ

### Q: How do I add a new component?
A: See [Component Documentation](./COMPONENT_DOCUMENTATION.md) for examples.

### Q: How do I call an API endpoint?
A: See [API Documentation](./API_DOCUMENTATION.md) for all available endpoints.

### Q: How do I deploy to production?
A: See [Deployment Guide](./DEPLOYMENT.md) for step-by-step instructions.

### Q: How do I understand the system architecture?
A: See [Architecture Documentation](./ARCHITECTURE.md) for detailed diagrams and explanations.

### Q: How do I get started as a new developer?
A: See [Developer Onboarding Guide](./DEVELOPER_ONBOARDING.md) for setup and workflow.

---

## 🐛 Reporting Issues

Found a bug? Have a feature request?

1. Check existing [GitHub Issues](https://github.com/adrianstanca1/CortexBuild/issues)
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots/logs if applicable

---

## 💡 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

See [Developer Onboarding Guide](./DEVELOPER_ONBOARDING.md) for detailed workflow.

---

## 📞 Support

Need help?

1. **Check Documentation** - Start with the relevant guide above
2. **Search Issues** - Check GitHub issues for similar problems
3. **Ask Questions** - Use GitHub discussions
4. **Contact Team** - Reach out to team members

---

## 📝 Documentation Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| API Documentation | ✅ Complete | 2024-01-15 |
| Component Documentation | ✅ Complete | 2024-01-15 |
| Architecture Documentation | ✅ Complete | 2024-01-15 |
| Deployment Guide | ✅ Complete | 2024-01-15 |
| Developer Onboarding | ✅ Complete | 2024-01-15 |

---

## 🎯 Next Steps

1. **New Developer?** → Start with [Developer Onboarding Guide](./DEVELOPER_ONBOARDING.md)
2. **Building API Integration?** → Read [API Documentation](./API_DOCUMENTATION.md)
3. **Working on UI?** → Check [Component Documentation](./COMPONENT_DOCUMENTATION.md)
4. **Need to Deploy?** → Follow [Deployment Guide](./DEPLOYMENT.md)
5. **Understanding System?** → Study [Architecture Documentation](./ARCHITECTURE.md)

---

## 📄 License

CortexBuild is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices.

**Last Updated:** January 15, 2024
**Version:** 1.0.0

