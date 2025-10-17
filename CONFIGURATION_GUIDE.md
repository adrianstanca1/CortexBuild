# 🔧 CortexBuild Configuration Guide

> Complete guide to the development environment, tooling, and best practices

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Development Stack](#development-stack)
3. [Configuration Files](#configuration-files)
4. [NPM Scripts](#npm-scripts)
5. [Code Quality Tools](#code-quality-tools)
6. [Git Hooks](#git-hooks)
7. [VS Code Setup](#vs-code-setup)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+ (recommended: v20+)
- **npm**: v9+ or **pnpm**: v8+
- **Git**: v2.30+
- **VS Code**: Latest version (recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "constructai (5)"

# Install dependencies
npm install

# Start development servers
npm run dev:all

# Or start separately
npm run dev      # Frontend (Vite) - http://localhost:3000
npm run server   # Backend (Express) - http://localhost:3001
```

### Quick Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run server           # Start Express backend
npm run dev:all          # Start both concurrently

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Format all files with Prettier
npm run validate         # Run all checks (types, lint, format)

# Deployment
npm run deploy           # Build and deploy to IONOS
npm run vercel:deploy    # Deploy to Vercel
npm run vercel:prod      # Deploy to Vercel production
```

---

## 💻 Development Stack

### Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.8.2 | Type safety |
| **Vite** | 6.2.0 | Build tool & dev server |
| **Tailwind CSS** | 4.1.14 | Utility-first CSS |
| **Express** | 5.1.0 | Backend API |
| **Better-SQLite3** | 12.4.1 | Database |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.37.0 | Code linting |
| **Prettier** | Latest | Code formatting |
| **Husky** | Latest | Git hooks |
| **lint-staged** | Latest | Staged files linting |
| **PostCSS** | 8.5.6 | CSS processing |
| **Autoprefixer** | 10.4.21 | CSS vendor prefixes |

---

## 📁 Configuration Files

### TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@components/*": ["./components/*"],
      "@lib/*": ["./lib/*"],
      "@utils/*": ["./utils/*"],
      "@hooks/*": ["./hooks/*"],
      "@types/*": ["./types/*"],
      "@styles/*": ["./styles/*"],
      "@assets/*": ["./assets/*"],
      "@server/*": ["./server/*"],
      "@config/*": ["./config/*"]
    }
  }
}
```

**Key Features:**
- ✅ Strict mode enabled for maximum type safety
- ✅ Path aliases for cleaner imports
- ✅ ES2022 target with ES2023 features
- ✅ React JSX automatic runtime (no React import needed)
- ✅ Bundler module resolution for Vite

**Usage:**
```typescript
// Instead of: import Button from '../../../components/Button'
import Button from '@components/Button';

// Instead of: import { formatDate } from '../../../utils/date'
import { formatDate } from '@utils/date';
```

---

### ESLint Configuration

**File:** `eslint.config.js`

ESLint 9 uses the new "flat config" format.

**Key Rules:**
- TypeScript strict type checking
- React 19 best practices
- React Hooks rules
- Accessibility warnings
- Consistent import order

**Usage:**
```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Check specific files
npx eslint src/components/Button.tsx
```

**Common Issues & Fixes:**

```typescript
// ❌ Bad: Unused variables
const [count, setCount] = useState(0);
// count is never used

// ✅ Good: Remove or prefix with underscore
const [_count, setCount] = useState(0);

// ❌ Bad: Missing dependency in useEffect
useEffect(() => {
  console.log(someVar);
}, []); // someVar not in deps

// ✅ Good: Include all dependencies
useEffect(() => {
  console.log(someVar);
}, [someVar]);
```

---

### Prettier Configuration

**File:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "endOfLine": "lf"
}
```

**Usage:**
```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check

# Format specific files
npx prettier --write src/components/**/*.tsx
```

**VS Code Integration:**
- Format on save is enabled in `.vscode/settings.json`
- Prettier is set as the default formatter

---

### Vite Configuration

**File:** `vite.config.ts`

**Key Features:**
- Development server on port 3000
- API proxy to backend (port 3001)
- Hot Module Replacement (HMR)
- Advanced code splitting
- Manual chunking for optimized bundles
- Path alias resolution
- Production optimizations

**Chunking Strategy:**
```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'router': ['react-router-dom'],
  'ui-vendor': ['lucide-react'],
  'form-vendor': ['react-hook-form'],
  'data-vendor': ['axios']
}
```

**API Proxy:**
```typescript
// In your code, use relative URLs:
fetch('/api/users')  // Proxied to http://localhost:3001/api/users
```

---

### Tailwind CSS Configuration

**File:** `tailwind.config.js`

**Custom Theme:**

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... full palette
        900: '#1e3a8a',
      },
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-in': 'slideIn 0.3s ease-out',
    },
  },
}
```

**Usage:**
```tsx
// Custom colors
<div className="bg-primary-500 text-primary-50">

// Custom animations
<div className="animate-fade-in">

// Responsive design
<div className="text-sm md:text-base lg:text-lg">

// Dark mode
<div className="bg-white dark:bg-gray-900">
```

**Tailwind v4 Note:**
Uses `@tailwindcss/postcss` plugin instead of `tailwindcss` directly.

---

### PostCSS Configuration

**File:** `postcss.config.js`

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': { /* minification options */ }
    } : {})
  }
}
```

**Features:**
- Tailwind CSS v4 processing
- Autoprefixer for browser compatibility
- CSS minification in production
- Source maps in development

---

## 📜 NPM Scripts

### Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start Vite dev server (port 3000) |
| `server` | `tsx server/index.ts` | Start Express backend (port 3001) |
| `dev:all` | `concurrently ...` | Start both frontend and backend |

**Usage:**
```bash
# Start everything
npm run dev:all

# Or start separately in different terminals
npm run dev      # Terminal 1
npm run server   # Terminal 2
```

---

### Build Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build |
| `clean` | `rm -rf dist node_modules/.vite` | Clean build artifacts |
| `clean:all` | `rm -rf dist node_modules ...` | Clean everything |

**Build Output:**
```bash
npm run build

# Output: dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── vendor-[hash].js
```

---

### Code Quality Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `lint` | `eslint .` | Lint code |
| `lint:fix` | `eslint . --fix` | Auto-fix lint issues |
| `type-check` | `tsc --noEmit` | Check TypeScript types |
| `type-check:watch` | `tsc --noEmit --watch` | Watch mode type checking |
| `format` | `prettier --write ...` | Format all files |
| `format:check` | `prettier --check ...` | Check formatting |
| `validate` | Runs all checks | Type check + lint + format |

**Recommended Workflow:**
```bash
# Before committing
npm run validate

# Or run individually
npm run type-check
npm run lint:fix
npm run format
```

---

### Deployment Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `deploy` | `npm run build && node deploy-ionos.js` | Deploy to IONOS |
| `vercel:dev` | `vercel dev` | Vercel local development |
| `vercel:deploy` | `vercel` | Deploy to Vercel preview |
| `vercel:prod` | `vercel --prod` | Deploy to Vercel production |

---

## 🎯 Code Quality Tools

### ESLint

**Purpose:** Static code analysis to find and fix problems

**Configuration:** `eslint.config.js` (ESLint 9 flat config)

**Rules Enabled:**
- TypeScript strict type checking
- React 19 best practices
- React Hooks rules
- Unused variable detection
- Consistent code style
- Accessibility warnings

**Common Commands:**
```bash
# Lint all files
npm run lint

# Auto-fix fixable issues
npm run lint:fix

# Lint specific file
npx eslint src/components/Button.tsx

# Lint and show rule names
npx eslint --format=stylish src/
```

**Ignoring Rules:**
```typescript
// Disable for a line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();

// Disable for a block
/* eslint-disable @typescript-eslint/no-explicit-any */
const data: any = fetchData();
const result: any = processData();
/* eslint-enable @typescript-eslint/no-explicit-any */

// Disable for entire file (use sparingly!)
/* eslint-disable */
```

---

### Prettier

**Purpose:** Opinionated code formatter for consistent style

**Configuration:** `.prettierrc`

**Formatting Rules:**
- Single quotes for strings
- Semicolons required
- 2-space indentation
- 100 character line width
- Trailing commas (ES5 compatible)
- LF line endings

**Common Commands:**
```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check

# Format specific files
npx prettier --write "src/**/*.tsx"

# Format specific file
npx prettier --write src/components/Button.tsx
```

**VS Code Integration:**
- Formats automatically on save
- Formats on paste (optional)
- Uses Prettier extension

---

### TypeScript

**Purpose:** Static type checking for JavaScript

**Configuration:** `tsconfig.json`

**Strict Mode Features:**
- `noImplicitAny`: No implicit `any` types
- `strictNullChecks`: Null and undefined are distinct types
- `strictFunctionTypes`: Strict function type checking
- `strictBindCallApply`: Strict bind/call/apply
- `strictPropertyInitialization`: Class properties must be initialized
- `noImplicitThis`: No implicit `this` type
- `alwaysStrict`: Emit "use strict"

**Common Commands:**
```bash
# Type check all files
npm run type-check

# Watch mode (continuously check)
npm run type-check:watch

# Type check specific file
npx tsc --noEmit src/components/Button.tsx
```

**Common Type Patterns:**
```typescript
// Function types
const add = (a: number, b: number): number => a + b;

// Object types
interface User {
  id: string;
  name: string;
  email?: string; // Optional
}

// Array types
const users: User[] = [];
const ids: Array<string> = [];

// Union types
type Status = 'pending' | 'active' | 'inactive';

// Generic types
function identity<T>(value: T): T {
  return value;
}

// React component types
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

---

## 🪝 Git Hooks

**Tool:** Husky + lint-staged

**Purpose:** Run automated checks before committing to catch issues early

### Pre-commit Hook

**File:** `.husky/pre-commit`

**Actions Performed:**
1. Run `lint-staged` on staged files
   - ESLint auto-fix on TypeScript/JavaScript files
   - Prettier formatting on all files
2. Run TypeScript type check on entire project

**Configuration:** `.lintstagedrc.json`

```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

### How It Works

```bash
# When you commit
git add .
git commit -m "feat: add new feature"

# Automatically runs:
# 1. ESLint --fix on staged TS/TSX files
# 2. Prettier --write on staged files
# 3. TypeScript type check
# 4. If all pass, commit succeeds
# 5. If any fail, commit is blocked
```

### Bypassing Hooks (Use Sparingly!)

```bash
# Skip pre-commit hook (not recommended!)
git commit --no-verify -m "emergency fix"

# Or
git commit -n -m "emergency fix"
```

**Note:** Only bypass hooks in emergencies. Always run `npm run validate` manually if you bypass.

---

## 🔧 VS Code Setup

### Required Extensions

Install these extensions for the best experience:

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - Integrates ESLint into VS Code
   - Shows inline error/warning messages
   - Auto-fix on save

2. **Prettier** (`esbenp.prettier-vscode`)
   - Code formatter
   - Format on save enabled
   - Consistent code style

3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Autocomplete for Tailwind classes
   - CSS preview on hover
   - Linting for class names

4. **TypeScript Vue Plugin** (`Vue.volar`)
   - Enhanced TypeScript support
   - Better IntelliSense

### Workspace Settings

**File:** `.vscode/settings.json`

**Key Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true
}
```

**Features Enabled:**
- ✅ Format on save with Prettier
- ✅ Auto-fix ESLint issues on save
- ✅ TypeScript inlay hints for better code understanding
- ✅ Tailwind CSS autocomplete and validation
- ✅ Path IntelliSense for path aliases
- ✅ Bracket pair colorization
- ✅ Git integration

### Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Format document | `Shift + Option + F` | `Shift + Alt + F` |
| Quick fix | `Cmd + .` | `Ctrl + .` |
| Go to definition | `F12` | `F12` |
| Peek definition | `Option + F12` | `Alt + F12` |
| Rename symbol | `F2` | `F2` |
| Quick open file | `Cmd + P` | `Ctrl + P` |
| Command palette | `Cmd + Shift + P` | `Ctrl + Shift + P` |

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: Port 3000 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
vite --port 3001
```

---

#### Issue: TypeScript errors after install

**Error:**
```
Cannot find module '@components/Button' or its corresponding type declarations.
```

**Solutions:**
```bash
# Restart TypeScript server in VS Code
# Cmd + Shift + P -> "TypeScript: Restart TS Server"

# Or rebuild node_modules
rm -rf node_modules
npm install

# Check tsconfig.json paths are correct
```

---

#### Issue: ESLint not working

**Error:**
```
ESLint is disabled since its execution has not been approved or denied yet.
```

**Solutions:**
1. Click on "ESLint" in status bar
2. Select "Allow Everywhere"
3. Reload VS Code window

Or:
```bash
# Check ESLint is installed
npm ls eslint

# Reinstall if needed
npm install --save-dev eslint
```

---

#### Issue: Prettier conflicts with ESLint

**Error:**
```
Delete `␍` prettier/prettier
```

**Solutions:**
```bash
# Run prettier first, then ESLint
npm run format
npm run lint:fix

# Or update .prettierrc to match ESLint rules
```

---

#### Issue: Tailwind classes not working

**Error:** Tailwind classes have no effect

**Solutions:**
```bash
# Check PostCSS config uses @tailwindcss/postcss
# File: postcss.config.js
# Should be: '@tailwindcss/postcss': {}

# Restart dev server
npm run dev

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

#### Issue: Git hooks not running

**Error:** Pre-commit hook doesn't execute

**Solutions:**
```bash
# Ensure Husky is installed
npx husky install

# Make hook executable
chmod +x .husky/pre-commit

# Check Git config
git config core.hooksPath

# Should output: .husky
```

---

### Performance Issues

#### Slow TypeScript checks

```bash
# Use incremental compilation
# Already enabled in tsconfig.json

# Restart TS server in VS Code
# Cmd + Shift + P -> "TypeScript: Restart TS Server"

# Exclude unnecessary files in tsconfig.json
"exclude": ["node_modules", "dist", "**/*.spec.ts"]
```

---

#### Slow Vite dev server

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Optimize dependencies
# Add to vite.config.ts:
optimizeDeps: {
  include: ['react', 'react-dom', 'react-router-dom']
}

# Use esbuild for faster transpilation
# Already configured in vite.config.ts
```

---

#### Large bundle size

```bash
# Analyze bundle
npm run build
npx vite-bundle-visualizer

# Check manual chunks in vite.config.ts
# Separate large libraries into their own chunks

# Use dynamic imports for code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

---

## ✨ Best Practices

### Code Organization

```
src/
├── components/        # Reusable UI components
│   ├── base44/       # Base44 admin components
│   ├── admin/        # Admin-specific components
│   ├── sdk/          # SDK-related components
│   └── workflow/     # Workflow components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
├── styles/           # Global styles
├── assets/           # Images, fonts, etc.
└── config/           # Configuration files
```

---

### Component Structure

```tsx
// Good component structure
import React, { useState, useEffect } from 'react';
import { Button } from '@components/Button';
import { formatDate } from '@utils/date';
import type { User } from '@types/user';

interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Effect logic
  }, [user.id]);

  const handleEdit = () => {
    setLoading(true);
    onEdit(user.id);
  };

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      <p className="text-sm text-gray-500">
        Joined: {formatDate(user.createdAt)}
      </p>
      <Button onClick={handleEdit} loading={loading}>
        Edit User
      </Button>
    </div>
  );
};
```

---

### Type Safety

```typescript
// ✅ Good: Strong typing
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ❌ Bad: Weak typing
async function fetchUser(id: any): Promise<any> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

---

### Error Handling

```typescript
// ✅ Good: Comprehensive error handling
async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Delete user error:', error);
    throw error; // Re-throw for caller to handle
  }
}

// ❌ Bad: Silent failures
async function deleteUser(id: string) {
  const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  return response.json();
}
```

---

### Performance Optimization

```tsx
// ✅ Good: Memoization and optimization
import { memo, useMemo, useCallback } from 'react';

interface ListProps {
  items: Item[];
  onItemClick: (id: string) => void;
}

export const List = memo<ListProps>(({ items, onItemClick }) => {
  // Memoize expensive calculations
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Memoize callbacks
  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <div>
      {sortedItems.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onClick={handleClick}
        />
      ))}
    </div>
  );
});

// ❌ Bad: No optimization
export const List = ({ items, onItemClick }) => {
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div>
      {sortedItems.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onClick={(id) => onItemClick(id)}
        />
      ))}
    </div>
  );
};
```

---

### Commit Messages

Follow Conventional Commits:

```bash
# Feature
git commit -m "feat: add user profile page"

# Bug fix
git commit -m "fix: resolve login redirect issue"

# Documentation
git commit -m "docs: update API documentation"

# Style
git commit -m "style: format code with prettier"

# Refactor
git commit -m "refactor: simplify user service logic"

# Performance
git commit -m "perf: optimize database queries"

# Test
git commit -m "test: add unit tests for auth service"

# Chore
git commit -m "chore: update dependencies"
```

---

## 📚 Additional Resources

### Documentation

- **React 19**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vite**: https://vite.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **ESLint**: https://eslint.org/docs
- **Prettier**: https://prettier.io/docs

### Internal Docs

- `BASE44_WORKSPACE_OVERVIEW.md` - Complete workspace features
- `API_DOCUMENTATION.md` - API endpoints reference
- `DEPLOYMENT_INSTRUCTIONS.md` - Deployment guide
- `IMPLEMENTATION_GUIDE.md` - Development guide

---

## 🎯 Summary Checklist

Before pushing code, ensure:

- [ ] `npm run type-check` passes (no TypeScript errors)
- [ ] `npm run lint` passes (no ESLint errors)
- [ ] `npm run format:check` passes (code is formatted)
- [ ] `npm run build` succeeds (production build works)
- [ ] All tests pass (if applicable)
- [ ] Commit messages follow conventions
- [ ] Pre-commit hooks are working
- [ ] Code is reviewed (if working in a team)

**Quick validate command:**
```bash
npm run validate && npm run build
```

---

## 💡 Pro Tips

1. **Use path aliases** for cleaner imports
2. **Run type-check in watch mode** while developing
3. **Format on save** is your friend (enabled in VS Code)
4. **Commit often** with meaningful messages
5. **Pre-commit hooks** catch issues early
6. **Use Tailwind IntelliSense** for faster development
7. **Check bundle size** periodically with `npm run build`
8. **Clear caches** if things seem broken
9. **Restart TypeScript server** when IntelliSense breaks
10. **Keep dependencies updated** with `npm outdated`

---

**Questions or Issues?**

- Check the [Troubleshooting](#troubleshooting) section
- Review error messages carefully
- Search existing documentation
- Ask the team for help

---

*Last Updated: October 9, 2025*  
*Version: 2.0.0*  
*Workspace: constructai (5)*
