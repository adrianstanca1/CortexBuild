# 🚀 ASAgents Ultimate - Full Stack Integration Guide

## Architecture Overview

ASAgents Ultimate uses a **dual-backend architecture** for maximum flexibility and feature separation:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    React + TypeScript                        │
│                      (Port 5173)                             │
└────────────┬─────────────────────────┬─────────────────────┘
             │                         │
             ├─────────────┐  ┌────────┴──────────┐
             │             │  │                   │
┌────────────▼───────┐  ┌──▼──▼──────────────┐  │
│   BACKEND API      │  │   SERVER API       │  │
│   Port 3000        │  │   Port 4000        │  │
│                    │  │                    │  │
│ • Projects         │  │ • Dashboard        │  │
│ • Documents        │  │ • Analytics        │  │
│ • Equipment        │  │ • Tasks            │  │
│ • Invoices         │  │ • Notifications    │  │
│ • Reports          │  │ • Multi-tenancy    │  │
│ • Time Tracking    │  │ • System Health    │  │
│ • Workflows        │  │ • Companies        │  │
└────────────────────┘  └────────────────────┘
```

## 🎯 Quick Start

### Option 1: Start All Services (Recommended)

```bash
cd ~/ASAgents-Ultimate
./start-dev.sh
```

This starts:
- Frontend (Port 5173) - React + Vite
- Backend API (Port 3000) - Core business logic
- Server API (Port 4000) - Advanced features

### Option 2: Start Services Individually

**Terminal 1 - Frontend:**
```bash
cd ~/ASAgents-Ultimate
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd ~/ASAgents-Ultimate/backend
npm run dev
```

**Terminal 3 - Server:**
```bash
cd ~/ASAgents-Ultimate/server
npm run dev
```

## 📡 API Endpoints

### Backend API (Port 3000)

Base URL: `http://localhost:3000/api`

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - Logout

#### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/stats` - Get project statistics

#### Documents
- `GET /documents` - List documents
- `POST /documents/upload` - Upload document
- `GET /documents/:id` - Get document
- `DELETE /documents/:id` - Delete document

#### Equipment
- `GET /equipment` - List equipment
- `POST /equipment` - Add equipment
- `PUT /equipment/:id` - Update equipment
- `DELETE /equipment/:id` - Delete equipment

#### Invoices
- `GET /invoices` - List invoices
- `POST /invoices` - Create invoice
- `PUT /invoices/:id` - Update invoice
- `POST /invoices/:id/pay` - Pay invoice

### Server API (Port 4000)

Base URL: `http://localhost:4000/api`

#### System
- `GET /system/health` - Health check
- `GET /system/status` - System status
- `GET /system/metrics` - System metrics

#### Dashboard
- `GET /dashboard/overview` - Dashboard overview
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/recent` - Recent activities

#### Analytics
- `GET /analytics/overview` - Analytics overview
- `GET /analytics/projects` - Project analytics
- `GET /analytics/revenue` - Revenue analytics
- `GET /analytics/performance` - Performance metrics

#### Tasks
- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/complete` - Mark task complete

#### Notifications
- `GET /notifications` - List notifications
- `POST /notifications/:id/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the root directory:

```env
# Backend API
VITE_BACKEND_URL=http://localhost:3000/api
VITE_BACKEND_WS=ws://localhost:3000

# Server API
VITE_SERVER_URL=http://localhost:4000/api
VITE_SERVER_WS=ws://localhost:4000

# Frontend
VITE_API_BASE_URL=http://localhost:4000

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_AI_FEATURES=true
VITE_ALLOW_MOCK_FALLBACK=true
```

## 💻 Using the API in Components

### Example 1: Authentication

```typescript
import { useAuth } from './hooks/useAuth';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password');
    if (result.success) {
      // Navigate to dashboard
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

### Example 2: Projects

```typescript
import { useProjects } from './hooks/useProjects';

function ProjectsList() {
  const { projects, isLoading, create, update, remove } = useProjects();

  const handleCreate = async () => {
    await create({
      name: 'New Project',
      description: 'Project description',
      status: 'active'
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
      <button onClick={handleCreate}>Create Project</button>
    </div>
  );
}
```

### Example 3: Dashboard

```typescript
import { useDashboard } from './hooks/useDashboard';

function Dashboard() {
  const { stats, overview, recent, isLoading } = useDashboard();

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Active Projects: {stats.activeProjects}</div>
      <div>Total Revenue: ${stats.totalRevenue}</div>
      <div>Active Tasks: {stats.activeTasks}</div>
    </div>
  );
}
```

### Example 4: Connection Status

```typescript
import { ConnectionStatus } from './components/ConnectionStatus';

function App() {
  return (
    <div>
      <ConnectionStatus />
      {/* Rest of your app */}
    </div>
  );
}
```

## 🧪 Testing Connectivity

### Manual Test

Visit these URLs to verify services are running:

- Frontend: http://localhost:5173
- Backend Health: http://localhost:3000/api/health
- Server Health: http://localhost:4000/api/system/health

### Automated Test

```typescript
import { integrationTester } from './utils/integrationTester';

// Run all tests
const results = await integrationTester.runAllTests();
console.log('Tests passed:', results.success);
```

### Using cURL

```bash
# Test Backend
curl http://localhost:3000/api/health

# Test Server
curl http://localhost:4000/api/system/health

# Test Projects API
curl http://localhost:3000/api/projects

# Test Dashboard API
curl http://localhost:4000/api/dashboard/stats
```

## 📁 Project Structure

```
ASAgents-Ultimate/
├── config/
│   └── api.config.ts         # API endpoints configuration
├── lib/
│   └── apiClient.ts          # HTTP client for API calls
├── services/
│   └── integratedApiService.ts  # Service layer for API calls
├── hooks/
│   ├── useAuth.ts            # Authentication hook
│   ├── useProjects.ts        # Projects management hook
│   ├── useDashboard.ts       # Dashboard data hook
│   └── useTasks.ts           # Tasks management hook
├── components/
│   └── ConnectionStatus.tsx  # Connection status indicator
├── backend/                  # Backend API (Port 3000)
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── database/        # Database layer
│   └── package.json
├── server/                   # Server API (Port 4000)
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Advanced services
│   │   └── managers/        # System managers
│   └── package.json
└── start-dev.sh             # Start all services script
```

## 🔐 Authentication Flow

1. User submits credentials via `useAuth()` hook
2. Frontend sends POST request to `/auth/login` on both backends
3. Backend validates credentials and returns JWT token
4. Token stored in localStorage and used for subsequent requests
5. All API calls include `Authorization: Bearer <token>` header

## 🌐 Real-time Features

WebSocket connections available at:
- Backend WS: `ws://localhost:3000/ws`
- Server WS: `ws://localhost:4000/ws`

```typescript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build

# Build server
cd server && npm run build
```

### Vercel Deployment

```bash
# Deploy to Vercel
vercel --prod
```

The deployment will include:
- Frontend static files from `/dist`
- Serverless functions for API routes

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Backend Not Responding

1. Check backend logs: `tail -f logs/backend.log`
2. Verify backend is running: `curl http://localhost:3000/api/health`
3. Check CORS configuration in backend/src/index.ts

### Server Not Responding

1. Check server logs: `tail -f logs/server.log`
2. Verify server is running: `curl http://localhost:4000/api/system/health`
3. Check environment variables in server/.env

### CORS Errors

Ensure both backends allow requests from frontend origin:

```typescript
// In backend/server configuration
cors({
  origin: 'http://localhost:5173',
  credentials: true
})
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Express.js Documentation](https://expressjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. ✅ All three services running (check with `./start-dev.sh`)
2. ✅ Frontend accessible at http://localhost:5173
3. ✅ Backend health check passes
4. ✅ Server health check passes
5. ✅ No CORS errors in browser console
6. ✅ API calls return expected data
7. ✅ Authentication flow works
8. ✅ Real-time updates working

## 🤝 Contributing

When adding new features:

1. Add endpoint configuration to `config/api.config.ts`
2. Create service method in `services/integratedApiService.ts`
3. Create React hook if needed (in `hooks/`)
4. Implement backend route (in `backend/src/routes/`)
5. Update this documentation

---

**Happy Coding! 🚀**
