# ASAgents Construction Management Platform - AI Coding Instructions

This is a full-stack construction management platform built with React/TypeScript frontend, Node.js/Express backend, and MySQL database, featuring AI integration, multi-tenant architecture, and enterprise-grade security.

## Architecture Overview

### Full-Stack Architecture
- **Frontend**: React 18 + TypeScript with Vite build system and proxy to backend API
- **Backend**: Node.js + Express with TypeScript, enterprise manager pattern architecture
- **Database**: MySQL with migration system and multi-tenant schema
- **AI Integration**: Google Gemini API for construction-specific AI features
- **Authentication**: JWT-based with refresh tokens and role-based access control
- **Real-time**: WebSocket integration for live dashboard updates

### Key Architectural Patterns

#### Enterprise Manager Pattern (Backend)
The backend uses a 5-manager architecture in `server/src/managers/`:
```typescript
// Always use managers for backend operations
import { SecurityManager } from '../managers/SecurityManager.js';
import { APIManager } from '../managers/APIManager.js';
```

#### Dual Data Layer (Frontend)
- **Production**: `services/authClient.ts` + `services/backendApiService.ts` → hits backend API
- **Development/Offline**: `services/mockApi.ts` → localStorage with offline queue
- Frontend automatically falls back to mock API if backend unavailable

## Critical Development Workflows

### Backend Development
```bash
# Terminal 1 - Start backend API server
cd server && npm run dev  # Port 4000

# Terminal 2 - Start frontend with backend integration
cp .env.example .env.local
echo "VITE_API_BASE_URL=http://localhost:4000" >> .env.local
npm run dev  # Port 5173 with proxy to :4000/api
```

### Database Operations
```bash
# Run migrations (creates/updates schema)
cd server && npm run migrate

# Connect to MySQL and check tables
mysql -u root -p asagents_db
```

### Authentication Flow
Multi-provider auth with fallback chain:
1. OAuth (GitHub/Google) via `services/authClient.ts`
2. JWT-based login with refresh tokens
3. Mock auth for development/offline

## Project-Specific Patterns

### Multi-Tenant Data Access
All backend operations require tenant context:
```typescript
// Backend: Always include tenant_id in queries
const projects = await db.query('SELECT * FROM projects WHERE tenant_id = ?', [tenantId]);

// Frontend: AuthContext provides tenant automatically
const { user, company } = useAuth(); // company = tenant context
```

### Role-Based Component Access
```typescript
// Use ViewAccessBoundary for entire views
<ViewAccessBoundary view="admin" fallback={<AccessDenied />}>
  <AdminDashboard />
</ViewAccessBoundary>

// Use hasPermission() for granular checks
if (hasPermission(Permission.EDIT_PROJECTS)) {
  return <EditButton />;
}
```

### Backend API Integration Pattern
```typescript
// Always use try/catch with proper error handling
try {
  const result = await backendApiService.createProject(projectData);
  addToast('Project created successfully', 'success');
} catch (error) {
  // Falls back to mock API automatically
  console.error('API Error:', error);
  addToast('Using offline mode', 'warning');
}
```

## Integration Points & Dependencies

### Frontend-Backend Communication
- **Proxy Setup**: Vite dev server proxies `/api` to `localhost:4000`
- **API Gateway**: `services/backendApiService.ts` handles all backend calls
- **Fallback**: Automatic fallback to `mockApi.ts` if backend unavailable

### Database Schema Structure
13 core tables with proper foreign key relationships:
- `tenants` → `users` → `projects` → `tasks`
- `companies`, `expenses`, `equipment`, `safety_incidents`
- Multi-tenant isolation via `tenant_id` columns

### Security Implementation
- **AES-256-GCM encryption** for sensitive data in `SecurityManager`
- **Rate limiting** per endpoint and user in `APIManager`
- **Input validation** using `services/validationService.ts`
- **OWASP security headers** in backend middleware

## Essential Files & Components

### Backend Architecture
- `server/src/index.ts` - Main server with WebSocket integration
- `server/src/managers/` - Enterprise manager pattern (Security, API, Config, etc.)
- `server/src/routes/` - API endpoints organized by domain
- `server/migrations/` - Database schema migrations

### Frontend Core
- `App.tsx` - Main app with multi-tenant routing and OAuth callbacks
- `contexts/AuthContext.tsx` - Authentication state with tenant context
- `services/authClient.ts` - Production auth client
- `services/mockApi.ts` - Development/offline data layer

### Key Integration Services
- `services/backendApiService.ts` - Backend API gateway
- `services/validationService.ts` - Security validation (SQL injection, XSS)
- `services/ai.ts` - Gemini AI with construction domain context

## Development Commands

```bash
# Frontend only (uses mock data)
npm run dev

# Full stack (requires backend)
cd server && npm run dev  # Terminal 1
npm run dev               # Terminal 2 with VITE_API_BASE_URL set

# Database setup
cd server && npm run migrate

# Production build
npm run build:production

# Testing
npm run test              # Frontend tests
cd server && npm test     # Backend tests

# Deployment
npm run deploy:vercel     # Vercel with environment variables
npm run deploy:ionos      # IONOS hosting deployment
```

Always check for backend availability in development and handle the dual data layer appropriately. The platform supports both online (backend) and offline (localStorage) operation modes.