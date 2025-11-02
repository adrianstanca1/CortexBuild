# CortexBuild Developer Onboarding Guide

## Welcome to CortexBuild!

This guide will help you get up to speed with the CortexBuild codebase and development workflow.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Key Concepts](#key-concepts)
5. [Common Tasks](#common-tasks)
6. [Debugging & Troubleshooting](#debugging--troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18+ (check with `node --version`)
- npm or yarn
- Git
- VS Code (recommended)
- Supabase account

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/adrianstanca1/CortexBuild.git
cd CortexBuild

# 2. Install dependencies
npm install

# 3. Create .env.local file
cp .env.example .env.local

# 4. Configure environment variables
# Edit .env.local with your Supabase credentials

# 5. Start development server
npm run dev

# 6. Open browser
# Navigate to http://localhost:5173
```

### Verify Setup

```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version   # Should be 9+

# Run build
npm run build   # Should complete without errors

# Run tests
npm run test    # Should pass
```

---

## Project Structure

```
CortexBuild/
├── components/              # React components
│   ├── screens/            # Screen/page components
│   ├── dashboard/          # Dashboard components
│   ├── admin/              # Admin components
│   ├── ui/                 # Reusable UI components
│   ├── auth/               # Authentication components
│   └── development/        # Developer tools
├── lib/                    # Utility libraries
│   ├── supabase/          # Supabase client
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── types/                 # TypeScript type definitions
├── public/                # Static assets
│   └── service-worker.js  # Service Worker
├── docs/                  # Documentation
├── App.tsx                # Root component
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies
└── vercel.json            # Vercel configuration
```

### Key Directories

**components/screens/**
- Page-level components
- One component per screen
- Handle routing and navigation

**components/dashboard/**
- Dashboard-specific components
- Reusable dashboard widgets
- Performance-optimized

**lib/services/**
- Business logic
- API integration
- Data transformation

**lib/supabase/**
- Supabase client initialization
- Database queries
- Real-time subscriptions

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Create and checkout new branch
git checkout -b feature/your-feature-name

# Follow naming convention:
# feature/description - New feature
# fix/description - Bug fix
# docs/description - Documentation
# perf/description - Performance improvement
```

### 2. Make Changes

```bash
# Edit files
# Run development server
npm run dev

# Check for errors
npm run build

# Run tests
npm run test
```

### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Add new feature description"

# Follow commit convention:
# feat: New feature
# fix: Bug fix
# docs: Documentation
# perf: Performance improvement
# refactor: Code refactoring
# test: Test changes
```

### 4. Push and Create PR

```bash
# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Add description and link related issues
```

### 5. Code Review

- Wait for review
- Address feedback
- Update PR as needed
- Merge when approved

---

## Key Concepts

### Role-Based Architecture

CortexBuild uses strict role separation:

```typescript
// 5 user roles
type UserRole = 
  | 'super_admin'      // Platform-wide admin
  | 'company_admin'    // Company-level admin
  | 'project_manager'  // Project-level manager
  | 'developer'        // SDK/API developer
  | 'user'             // Regular user

// Each role has specific dashboard
// No feature overlap between roles
```

### Dashboard Separation

```typescript
// Super Admin - Platform-wide controls
UnifiedAdminDashboard

// Company Admin - Company management
CompanyAdminDashboardNew

// Regular Users - Day-to-day work
EnhancedDashboard

// Developers - SDK/API tools
DeveloperDashboard
```

### Authentication Flow

```typescript
// 1. User logs in
authService.login(email, password)

// 2. Supabase validates credentials
// 3. JWT token returned
// 4. Token stored in localStorage
// 5. Token sent in Authorization header
// 6. User redirected to dashboard
```

### Real-time Subscriptions

```typescript
// Subscribe to table changes
const subscription = supabase
  .channel('projects-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'projects' },
    (payload) => {
      // Handle changes
      console.log('Project updated:', payload);
    }
  )
  .subscribe();

// Cleanup on unmount
subscription.unsubscribe();
```

---

## Common Tasks

### Add a New Component

```typescript
// 1. Create component file
// components/ui/MyComponent.tsx

import React from 'react';

interface MyComponentProps {
  title: string;
  isDarkMode?: boolean;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  isDarkMode = true
}) => {
  return (
    <div className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>
      <h1>{title}</h1>
    </div>
  );
};

// 2. Export from index
// components/ui/index.ts
export { MyComponent } from './MyComponent';

// 3. Use in other components
import { MyComponent } from '../ui';

<MyComponent title="Hello" isDarkMode={true} />
```

### Add a New API Endpoint

```typescript
// 1. Create service function
// lib/services/myService.ts

import { supabase } from '../supabase/client';

export async function getMyData(id: string) {
  const { data, error } = await supabase
    .from('my_table')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// 2. Use in component
import { getMyData } from '../services/myService';

useEffect(() => {
  getMyData(id).then(setData);
}, [id]);
```

### Add a New Screen

```typescript
// 1. Create screen component
// components/screens/MyScreen.tsx

import React from 'react';

interface MyScreenProps {
  currentUser: User;
}

export const MyScreen: React.FC<MyScreenProps> = ({ currentUser }) => {
  return (
    <div>
      <h1>My Screen</h1>
    </div>
  );
};

// 2. Add to App.tsx routing
const screenComponents: Record<Screen, React.ComponentType<any>> = {
  'my-screen': MyScreen,
  // ... other screens
};

// 3. Navigate to screen
navigateToModule('my-screen', {});
```

### Add Tests

```typescript
// 1. Create test file
// components/ui/MyComponent.test.tsx

import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});

// 2. Run tests
npm run test

// 3. Check coverage
npm run test:coverage
```

---

## Debugging & Troubleshooting

### Common Issues

**Issue:** Build fails with TypeScript errors
```bash
# Check for type errors
npm run build

# Fix errors in code
# Rebuild
npm run build
```

**Issue:** Service Worker not updating
```bash
# Clear browser cache
# DevTools > Application > Clear storage
# Refresh page
```

**Issue:** Database queries fail
```bash
# Check Supabase connection
# Verify RLS policies
# Check network tab in DevTools
```

**Issue:** Component not rendering
```bash
# Check browser console for errors
# Verify component props
# Check React DevTools
```

### Debugging Tools

**Browser DevTools**
- Console: Check for errors
- Network: Check API calls
- Application: Check Service Worker
- React DevTools: Check component state

**VS Code Extensions**
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (API testing)

**Supabase Dashboard**
- View database tables
- Check RLS policies
- View real-time subscriptions
- Check logs

---

## Performance Tips

### Code Splitting
- Use React.lazy() for heavy components
- Vite automatically splits chunks
- Check bundle size: `npm run build`

### Lazy Loading
- Use LazyImage for images
- Use LazyComponentWrapper for heavy components
- Check Network tab for lazy loading

### Caching
- Service Worker caches static assets
- HTTP headers cache for 1 year
- Browser cache for repeat visits

### Optimization
- Minimize re-renders
- Use useMemo for expensive calculations
- Use useCallback for event handlers
- Avoid inline functions

---

## Resources

### Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [Component Documentation](./COMPONENT_DOCUMENTATION.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)

### External Resources
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

### Team Resources
- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions
- Pull Requests: Submit code changes

---

## Getting Help

1. **Check Documentation** - Start with docs/
2. **Search Issues** - Check GitHub issues
3. **Ask in Discussions** - GitHub discussions
4. **Contact Team** - Reach out to team members

---

## Next Steps

1. Set up your development environment
2. Read the Architecture documentation
3. Explore the codebase
4. Pick a small task to start
5. Create a feature branch
6. Make your first contribution!

Welcome to the team! 🚀

