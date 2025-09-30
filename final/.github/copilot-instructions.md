# Copilot Instructions for Construction Management App

This is a React/TypeScript construction management application with AI integration, role-based access control, and offline-first architecture.

## Architecture Overview

- **Frontend**: React 18 + TypeScript with Vite build system
- **AI Integration**: Google Gemini API (`@google/genai`) for construction-specific AI features
- **State Management**: Context API with `AuthContext` for authentication/authorization
- **Data Layer**: Mock API service with localStorage persistence and offline queue (`services/mockApi.ts`)
- **UI**: Component library in `components/ui/` with role-based view access
- **Maps**: Leaflet integration for project location mapping

## Key Patterns & Conventions

### Component Organization

```
components/
├── ui/           # Reusable UI components (Button, Card, etc.)
├── auth/         # Authentication flows
├── layout/       # Layout components (Header, Sidebar, ViewAccessBoundary)
├── financials/   # Financial module components
└── [ViewName].tsx # Main view components (Dashboard, ProjectsView, etc.)
```

### Service Layer Architecture

- `mockApi.ts` - Central data access with offline queue and caching
- `ai.ts` - Gemini AI integration with construction domain prompts
- `auth.ts` - Authentication/authorization with permission checking
- `cacheService.ts` - Client-side caching with expiration
- `validationService.ts` - Input validation and security

### Permission-Based Access Control

Use `hasPermission()` from `services/auth.ts` and `ViewAccessBoundary` component:

```tsx
import { hasPermission } from "../services/auth";
import { Permission } from "../types";

// Check permissions
if (hasPermission(Permission.EDIT_PROJECTS)) {
  // Show edit UI
}

// Wrap components with access control
<ViewAccessBoundary view="projects" fallback={<AccessDenied />}>
  <ProjectsView />
</ViewAccessBoundary>;
```

### Offline-First Data Handling

All write operations queue offline and sync when online. Check `useOfflineSync` hook:

```tsx
const { isOnline } = useOfflineSync(addToast);
// Operations automatically queue in localStorage when offline
```

### AI Integration Pattern

Construction-specific AI prompts are in `services/ai.ts`. Key functions:

- `generateProjectInsights()` - Project analysis
- `generateSafetyRecommendations()` - Safety incident analysis
- `generateCostEstimate()` - Cost estimation
- `generateDailySummary()` - Daily progress summaries

### Error Handling

Use `utils/errorHandling.ts` utilities:

```tsx
import { wrapError, withRetry } from "../utils/errorHandling";

// Wrap operations with retry logic
const result = await withRetry(() => api.createProject(data), {
  maxAttempts: 3,
  baseDelay: 1000,
});
```

## Development Workflows

### Local Development

```bash
npm install
cp .env.example .env.local  # Set VITE_GEMINI_API_KEY
npm run dev
```

### Testing

```bash
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Deployment

Multiple deployment targets via `scripts/deploy.js`:

```bash
npm run deploy:vercel      # Vercel deployment
npm run deploy:netlify     # Netlify deployment
npm run deploy:dry-run     # Test deployment config
```

## Important Integration Points

### Role-Based Views

Each user role has specific dashboard and access patterns defined in `utils/viewAccess.ts`. Always check user permissions before rendering sensitive components.

### Map Integration

Project locations use `react-leaflet` with clustering via `use-supercluster`. Map components are in `components/MapView.tsx` and `components/ProjectsMapView.tsx`.

### Mock Data Structure

Realistic construction data is in `services/mockData.ts` with full project hierarchies, user roles, equipment tracking, and financial records.

### AI Context

When working with AI features, construction industry context is pre-loaded. The app handles project management, safety compliance, cost estimation, and workforce planning specific to construction workflows.

## File Naming & Imports

- Use relative imports (`../services/mockApi`)
- Components use PascalCase files (`ProjectsView.tsx`)
- Services use camelCase (`mockApi.ts`)
- Always import types from `./types.ts`
- Use lazy loading for heavy components in `App.tsx`
