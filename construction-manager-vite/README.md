# Construction Manager - Vite Version

A modern construction project management system built with Vite, React, TypeScript, and Tailwind CSS. This application features a complete Role-Based Access Control (RBAC) system for managing construction projects, teams, tasks, and resources.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control (RBAC)** - 5 distinct user roles with granular permissions
- **Authentication System** - Secure login with persistent sessions
- **Protected Routes** - Role-based route protection and automatic redirection
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Modern Stack** - Built with the latest React 19, Vite 7, and TypeScript

### User Roles & Dashboards

#### 1. **Admin Dashboard**
- Complete system overview
- User management capabilities
- Financial tracking and reporting
- Project statistics and team overview
- Full access to all features

#### 2. **Project Manager Dashboard**
- Active projects overview
- Budget tracking and financial metrics
- Progress monitoring
- Team coordination
- Resource allocation

#### 3. **Foreman Dashboard**
- Daily operations management
- Task scheduling and assignment
- Material inventory tracking
- Worker coordination
- Equipment management

#### 4. **Worker Dashboard**
- Assigned tasks view
- Time logging capabilities
- Safety reminders and alerts
- Personal work schedule
- Task progress updates

#### 5. **Client Dashboard**
- Project progress tracking
- Budget vs actual spending
- Timeline and milestones
- Recent updates feed
- Project documentation access

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1
- **Build Tool**: Vite 7.1
- **Language**: TypeScript 5.9
- **Routing**: React Router 7.9
- **State Management**: Zustand 5.0
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🔐 Authentication

The application uses a mock authentication system for demonstration purposes. In production, replace with your actual API endpoints.

### Test Users

Login with any email and select a role:

- **Admin**: Full system access
- **Project Manager**: Project and team management
- **Foreman**: Daily operations and task management
- **Worker**: Task viewing and time logging
- **Client**: Project progress viewing

### RBAC System

The system implements 24 granular permissions across 5 roles:

**Permissions Include:**
- `view_all_projects`, `create_project`, `edit_project`, `delete_project`
- `manage_users`, `view_financials`, `edit_financials`
- `view_tasks`, `create_task`, `edit_task`, `delete_task`, `assign_task`
- `view_reports`, `view_team`, `manage_team`
- `view_materials`, `manage_materials`
- `view_timesheets`, `edit_timesheets`, `approve_timesheets`
- `view_own_project`, `view_own_tasks`

## 📁 Project Structure

```
construction-manager-vite/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   └── layout/
│   │       └── DashboardLayout.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── UnauthorizedPage.tsx
│   │   └── dashboard/
│   │       ├── admin/
│   │       ├── project-manager/
│   │       ├── foreman/
│   │       ├── worker/
│   │       └── client/
│   ├── stores/
│   │   └── authStore.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   ├── task.ts
│   │   ├── material.ts
│   │   └── timesheet.ts
│   ├── lib/
│   │   └── mockData.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

## 🔑 Key Components

### Authentication Store (`authStore.ts`)
- Zustand-based state management
- Persistent authentication with localStorage
- Permission checking utilities
- Role-based access control

### Protected Route Component
```typescript
<ProtectedRoute requiredRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

### Path Aliases
The project uses `@/` as an alias for the `src/` directory:
```typescript
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types/auth';
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

Build output will be in the `dist/` directory.

### Environment Variables
Create a `.env` file for environment-specific configuration:
```env
VITE_API_URL=your_api_url
VITE_APP_NAME=Construction Manager
```

### Deployment Platforms

**Vercel** (Recommended)
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📊 Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Vite Config
- Path aliases configured for `@/` imports
- React plugin with Fast Refresh
- Optimized production builds

### TypeScript Config
- Strict mode enabled
- ES2022 target
- Bundler module resolution
- Path mappings for aliases

### Tailwind CSS
- Custom color schemes
- Responsive breakpoints
- Dark mode support (configurable)

## 🎨 Styling

The application uses Tailwind CSS with custom configurations. Key features:
- Utility-first CSS framework
- Custom design tokens
- Responsive design utilities
- Dark mode ready

## 🔐 Security Considerations

**Current Implementation** (Development/Demo):
- Mock authentication system
- Client-side role management
- LocalStorage for session persistence

**Production Recommendations**:
- Implement server-side authentication
- Use HTTP-only cookies for tokens
- Add CSRF protection
- Implement refresh token rotation
- Add rate limiting
- Validate permissions server-side

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contact the administrator for contribution guidelines.

## 📞 Support

For support and questions, contact your system administrator.

---

**Built with ❤️ using Vite, React, and TypeScript**
