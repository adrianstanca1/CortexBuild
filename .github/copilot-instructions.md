# CortexBuild AI Assistant Instructions

## Project Overview
CortexBuild (formerly ConstructAI) is a full-stack construction management platform built with React + TypeScript frontend and Express.js backend. It features multi-tenant architecture, AI integrations, and an SDK developer platform.

## Architecture & Key Components

### Tech Stack
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS
- **Backend**: Express.js + SQLite (better-sqlite3) + JWT auth
- **AI**: OpenAI, Google Gemini, Anthropic Claude integrations
- **Deployment**: Vercel with backend API routes

### Multi-Tenant Architecture
- Data isolation via `company_id` filtering in all queries
- Row Level Security (RLS) enforced at database level
- Tenant context managed through `contexts/TenantContext.tsx`
- See `MULTI_TENANT_ARCHITECTURE.md` for complete implementation

### Critical File Structure
```
App.tsx                    # Main app router with screen switching
server/index.ts           # Express server with auth + API routes
types.ts                  # Central type definitions (User, Project, etc.)
db.ts                     # Mock data arrays (USERS, PROJECTS, etc.)
server/database.ts        # SQLite database connection & queries
auth/authService.ts       # Frontend auth service with JWT handling
```

## Development Workflows

### Running the Application
```bash
npm run dev:all          # Start both frontend (3000) + backend (3001)
npm run dev              # Frontend only (uses Vercel API in prod)
npm run server           # Backend only
```

### Database Operations
- SQLite database: `cortexbuild.db` (auto-created)
- Schema: `server/schema.sql`
- Migrations: `server/migrations/`
- Use `server/database.ts` functions, never direct SQL in components

### Authentication Flow
1. Login via `auth/authService.ts` → POST `/api/auth/login`
2. JWT stored in localStorage as `constructai_token`
3. Token auto-attached to requests via axios interceptor
4. Multi-role system: `super_admin`, `company_admin`, `Project Manager`, etc.

## Project-Specific Patterns

### Screen Management
- Single-page app using `Screen` type union in `App.tsx`
- Screen switching via `useNavigation` hook
- Each screen component in `components/screens/`

### API Route Structure
```
server/routes/           # Modular route files
  ├── auth.ts           # Authentication endpoints
  ├── projects.ts       # Project CRUD
  ├── sdk.ts           # SDK developer features
  └── admin.ts         # Super admin functionality
```

### Component Organization
```
components/
  ├── screens/          # Full-screen views
  ├── layout/           # Sidebar, navigation, layout
  ├── sdk/             # SDK developer platform UI
  ├── ai/              # AI integration components
  └── shared/          # Reusable components
```

### State Management
- No global state management (Redux/Zustand)
- React Context for tenant/auth state
- Local component state + API calls pattern
- Use `useCallback` and `useMemo` for performance

### AI Integration Patterns
- AI features behind feature flags: `NEXT_PUBLIC_ENABLE_AI_AGENTS`
- Multiple AI providers in `server/services/`
- Chat interface via `components/chat/ChatbotWidget.tsx`
- SDK developer tools in `components/sdk/`

## Critical Conventions

### Database Queries
- Always filter by `company_id` for tenant isolation
- Use prepared statements in `server/database.ts`
- Never expose raw SQL to frontend
- Example: `const projects = db.getAllProjects(user.companyId)`

### Environment Variables
- Development: `.env.local` (gitignored)
- Production: Vercel environment variables
- API keys: `OPENAI_API_KEY`, `GEMINI_API_KEY`, etc.
- Database: Auto-configured for Vercel Postgres in production

### Error Handling
- Backend: Standard Express error middleware
- Frontend: `ErrorBoundary.tsx` for React errors
- Toast notifications via `hooks/useToast.ts`
- Logger utility in `utils/logger.ts`

### SDK Developer Platform
- API key management in `api_keys` table
- Webhook system for real-time events
- Sandbox environments for testing
- Third-party integrations (QuickBooks, Slack)
- See `SDK_DEVELOPER_CAPABILITIES.md` for full feature set

## Integration Points

### External Services
- **Supabase**: Alternative database option (schema in `supabase/`)
- **Vercel**: Primary deployment platform with serverless functions
- **AI APIs**: OpenAI, Google Gemini, Anthropic (configured per feature)

### WebSocket Integration
- Real-time updates via `server/websocket.ts`
- WebSocket setup in main server file
- Used for live collaboration features

## Testing & Debugging
- Use `mvn test` and `mvn verify` for Java components
- Database inspection: SQLite browser or `server/database.ts` debug functions
- API testing: `test-api.sh` script provided
- Frontend debugging: React DevTools + browser console

## Important Notes
- Project recently rebranded from "ConstructAI" to "CortexBuild"
- Extensive documentation in `.md` files (170+ implementation guides)
- Multi-language codebase with some Romanian comments/docs
- Legacy mock data in `db.ts` being migrated to real database
- Active development with frequent architecture changes

## Code Patterns & Examples

### Adding New Screens
1. Create screen component in `components/screens/`
2. Add screen type to `Screen` union in `types.ts`
3. Import and register in `App.tsx` renderScreen function
4. Use `useNavigation` hook for navigation
```typescript
const { navigateTo, goBack } = useNavigation();
navigateTo('new-screen', { param: 'value' });
```

### Creating API Routes
1. Create route file in `server/routes/`
2. Use `authenticateToken` middleware for protected routes
3. Filter by `company_id` from `req.user.companyId`
4. Register router in `server/index.ts`
```typescript
import { authenticateToken } from '../auth';

router.get('/items', authenticateToken, (req, res) => {
  const { companyId } = req.user;
  const items = db.getItems(companyId);
  res.json(items);
});
```

### Database Queries with Tenant Isolation
Always include `company_id` filter:
```typescript
// In server/database.ts
export const getProjects = (companyId: string) => {
  const stmt = db.prepare(
    'SELECT * FROM projects WHERE company_id = ? ORDER BY created_at DESC'
  );
  return stmt.all(companyId);
};
```

### Feature Flags Usage
Check feature flags before rendering/enabling features:
```typescript
// In component
const enableAI = process.env.NEXT_PUBLIC_ENABLE_AI_AGENTS === 'true';
const enableSDK = process.env.ENABLE_SDK_DEVELOPER === 'true';

// Conditional rendering
{enableAI && <AIFeatureComponent />}
```

### SDK Developer Platform Access
- Only users with `developer` or `super_admin` role can access SDK features
- Use `requireDeveloper` middleware in SDK routes
- SDK features accessible through `ProductionSDKDeveloperView` component
- API keys stored in `api_keys` table with hashed values

### Role-Based Access Control
Roles hierarchy (from highest to lowest):
1. `super_admin` - Platform-wide access, can manage all companies
2. `developer` - SDK platform access, can build integrations
3. `company_admin` - Full access within their company
4. `Project Manager` - Manage projects and teams
5. `Foreman` - Field operations
6. `Safety Officer` - Safety compliance
7. `Accounting Clerk` - Financial operations
8. `operative` - Basic field worker access

### WebSocket Real-time Updates
WebSocket server runs on same port as Express server:
```typescript
// Server-side broadcast
wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'update', data }));
  }
});
```

## Common Tasks

### Adding New Database Table
1. Add schema to `server/schema.sql`
2. Create migration file in `server/migrations/`
3. Add query functions to `server/database.ts`
4. Include `company_id` column for multi-tenant data
5. Add TypeScript interface to `types.ts`

### Implementing New AI Feature
1. Add AI service in `server/services/` (e.g., `openai-service.ts`)
2. Create API route in `server/routes/ai-chat.ts`
3. Add frontend component in `components/ai/`
4. Gate feature with `NEXT_PUBLIC_ENABLE_AI_AGENTS` flag

### Creating SDK Integration
1. Add integration schema to SDK tables via `initSdkTables()`
2. Create integration UI in `components/sdk/`
3. Add webhook handlers in `server/routes/sdk.ts`
4. Store OAuth tokens in `oauth_tokens` table (encrypted)

## Deployment Notes

### Vercel Deployment
- Frontend builds to `dist/` via Vite
- API routes served from `api/` directory (serverless functions)
- Backend routes proxied via `vercel.json` rewrites
- Environment variables set in Vercel dashboard
- Database: SQLite for development, Vercel Postgres for production

### Local Development
```bash
# Terminal 1 - Frontend (port 3000)
npm run dev

# Terminal 2 - Backend (port 3001)
npm run server

# Or run both together
npm run dev:all
```

### Default Login Credentials
```
Super Admin:
- Email: adrian.stanca1@gmail.com
- Password: parola123

Company Admin:
- Email: adrian@ascladdingltd.co.uk
- Password: Lolozania1

Developer:
- Email: dev@constructco.com
- Password: parola123
```

## Troubleshooting

### Database Issues
- Delete `cortexbuild.db*` files to reset database
- Run `npm run server` to reinitialize tables
- Check `server/schema.sql` for table definitions

### Authentication Errors
- Token stored in localStorage as `constructai_token`
- Check axios interceptor in `auth/authService.ts`
- Verify JWT_SECRET is set in environment

### Build Errors
- Ensure all dependencies: `npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npx tsc --noEmit`

### API Not Responding
- Verify backend running on port 3001
- Check CORS settings in `server/index.ts`
- Inspect Vite proxy config in `vite.config.ts`

## Performance Optimization Guidelines

### Frontend Performance

#### React Component Optimization
```typescript
// Use React.memo for expensive components that receive same props
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const filteredProjects = useMemo(() => {
  return projects.filter(p => p.status === 'active');
}, [projects]);

// Use useCallback for functions passed to child components
const handleProjectClick = useCallback((projectId: string) => {
  navigateTo('project-home', { projectId });
}, [navigateTo]);
```

#### Best Practices
- **Lazy Load Screens**: Use React.lazy() for screen components not immediately needed
- **Virtualize Long Lists**: Implement virtual scrolling for task lists, project lists (100+ items)
- **Debounce Search**: Debounce search inputs by 300ms to reduce API calls
- **Image Optimization**: Use lazy loading for project images and avatars

### Backend Performance
- Prefer prepared statements created once and reused; avoid constructing SQL strings per request.
- Wrap multi-step writes in transactions (`db.transaction`) to keep tenant data consistent.
- Use the capability helpers in `server/utils/capabilities.ts` to short-circuit expensive operations when quotas are exhausted.
- When returning lists, cap results (`LIMIT ?`) and expose pagination tokens; default to 25 records.
- Cache static metadata lookups in-memory (e.g., feature flags) but always bust cache when `updated_at` changes.

### API Design Tips
- Always return `{ success: boolean, ...payload }` to keep frontend handling consistent.
- Map database rows into camelCase before returning to the client.
- For long-running tasks, queue work (see `server/services/agentkit.ts`) and respond with a job id to poll later.
- Log developer-specific actions via `logDeveloperEvent` so they appear in observability dashboards.

## Testing Strategy

### Automated Tests
- Run `npm run lint` before committing (fails today due to legacy issues; do not introduce new warnings).
- Frontend: prefer component tests with Vitest + React Testing Library (see `components/**/*.test.tsx`).
- Backend: use supertest against `server/index.ts` to exercise Express routes.
- Seed test data using helpers in `server/seed-data.sql` to keep fixtures predictable.

### Manual Verification
- Always validate new dashboard widgets under `developer`, `super_admin`, and `company_admin` roles.
- Use `test-api.sh` to smoke test REST endpoints after schema changes.
- When AI features change, run through the scripted scenarios in `AI_INTEGRATION_TESTING_GUIDE.md`.

## Security Checklist
- Never return sensitive columns (API keys, passwords) from the database helpers.
- Use `requireSandboxAccess`/`requireDeveloper` middleware in new developer routes.
- When adding environment variables, document them in `metadata.json` and update `.env.example`.
- Escape user-provided HTML or markdown before rendering; rely on `react-markdown` with sanitizers enabled.
- Validate payload shapes with zod schemas where available (`server/utils/validation.ts`).

## AI Workflow Notes
- AI providers are abstracted behind `server/services/ai.ts`; always call through the service, never directly from routes.
- Respect provider-specific quotas defined in `server/utils/capabilities.ts`.
- Store AI execution logs via `logDeveloperEvent` for auditability.
- When introducing new prompt templates, add them to `AI_CORE_CONNECTIVITY_REDESIGN.md` so the team can review tone and context.

## Copilot Usage
- Include context-rich comments before complex logic blocks so Copilot can infer intent.
- Keep functions under ~120 lines; split helpers into `utils/` when patterns repeat.
- When Copilot suggests code, verify multi-tenant safety (filters, capabilities, auth) before accepting.
- Document any shortcuts or temporary mocks in the relevant `.md` status file so future contributors know limitations.

## Developer Dashboard Guidelines
- Route all new dashboard data through the summary loader (`/developer/dashboard/summary`) first; fall back endpoints must mirror its shape.
- Memoize computed metrics (`useMemo`) and describe callbacks (`useCallback`) so charts and tables avoid unnecessary re-renders.
- Keep cards composable: prefer small helper components taking `title`, `value`, and `icon` props rather than duplicating JSX.
- Show loading, empty, and error states explicitly—never leave a blank container when the API fails.
- Respect capability limits (`capabilities.canPublishModules`, `maxSandboxRunsPerDay`) and surface quota messaging in the UI.

## Observability & Logging
- Use `logDeveloperEvent` for every sandbox, builder, or deployment action to ensure the activity feed stays accurate.
- In backend routes, log structured payloads (objects) rather than strings so analytics can group events reliably.
- Prefer toast notifications plus console warnings on the frontend when simulations fail; avoid swallowing errors.
- Expose timestamps in ISO format so they can be parsed consistently on the client.

## Database & Seed Management
- Add new tables to `server/schema.sql` and `server/seed-data.sql` together; keep IDs deterministic (`seed-123`) for test reproducibility.
- If a migration mutates existing data, document the intent in `server/migrations/README.md` and bump the seed version in `metadata.json`.
- Use helper methods in `server/database.ts` for inserts/updates and extend them when new columns are introduced.

## Multi-Tenant QA Checklist
- Test each feature as `super_admin`, `developer`, and `company_admin`; verify role-based sections hide gracefully for other roles.
- Confirm tenants cannot access data from other companies by spot-checking API responses when switching tokens.
- Run through a sandbox simulation, builder save, and module publish in sequence to ensure capability tracking decrements correctly.

## Dashboard Role Segmentation
- Centralise role-based routing in `components/screens/UnifiedDashboardScreen.tsx`; if you introduce a new role, update the `switch` there first.
- Super admins expect cross-tenant metrics (`/admin/sdk/*`, `server/routes/admin.ts`), developers need builder/sandbox insights, company admins focus on project and financial health—keep widgets scoped accordingly.
- Gate premium panels behind capability flags (e.g., `capabilities.canAccessSandbox`) so the same component can serve multiple tiers without duplication.
- When adding navigation tabs, ensure their labels include emoji or concise descriptors to match existing UX conventions (`💻 Developer Hub`, `📊 Developer Dashboard`).

## Dashboard Feature Matrix
- **Super Admin**: include platform telemetry, tenant management actions, SDK oversight cards, and AI ecosystem controls.
- **Developer**: prioritise builder modules, sandbox runs, API usage, agent status, and quick links into `ProductionSDKDeveloperView`.
- **Company Admin**: surface project pipeline, financial KPIs, compliance tasks, and cross-team alerts; hide SDK-specific modules unless `enableDeveloperPortal` flag is present.
- **Field Roles (Foreman, Safety Officer, Operative)**: streamline dashboards to mobile-friendly summaries (shifts, incidents, safety checklists) and keep heavy analytics off these views.

## Dashboard Enhancement Playbook
- Start with data contracts: document the expected payload in `DASHBOARD_IMPROVEMENTS.md` before wiring UI.
- Build reusable stat card components with props for `trend`, `unit`, `state` (success/warning/error) so styling remains consistent.
- For new charts, prefer lightweight SVG-based visuals or existing chart helpers in `components/dashboard/PerformanceCharts.tsx`; avoid heavy chart libraries unless justified.
- Ensure quick actions call through `navigateTo` or backend APIs defined in `server/routes/*` rather than dummy `console.log` handlers.
- Add contextual help (tooltips, info badges) for complex metrics so different user classes understand what they're seeing.
- **Bundle Size**: Monitor dist/ folder size, keep under 500KB for main bundle

#### Screen Navigation Performance
```typescript
// Navigation stack is lightweight - uses screen type unions
// Avoid passing large objects in params, use IDs instead
navigateTo('task-detail', { taskId: '123' }); // ✅ Good
navigateTo('task-detail', { task: fullTaskObject }); // ❌ Avoid
```

### Backend Performance

#### Database Query Optimization
```typescript
// ✅ Use prepared statements (cached query plans)
const stmt = db.prepare('SELECT * FROM projects WHERE company_id = ?');
const projects = stmt.all(companyId);

// ✅ Create indexes for frequently queried columns
db.exec(`CREATE INDEX IF NOT EXISTS idx_projects_company 
         ON projects(company_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_project 
         ON tasks(project_id, status)`);

// ✅ Limit results for large datasets
const stmt = db.prepare(
  'SELECT * FROM tasks WHERE company_id = ? ORDER BY created_at DESC LIMIT 100'
);

// ❌ Avoid N+1 queries - fetch related data in single query
// Instead of querying tasks for each project, use JOIN
const stmt = db.prepare(`
  SELECT p.*, t.* 
  FROM projects p 
  LEFT JOIN tasks t ON t.project_id = p.id 
  WHERE p.company_id = ?
`);
```

#### API Response Optimization
- Keep response payloads under 100KB
- Paginate list endpoints (default 50 items per page)
- Use field selection to return only needed data
- Implement ETags for cacheable resources

#### Connection Pooling
```typescript
// SQLite with WAL mode (already configured)
db.pragma('journal_mode = WAL'); // Write-Ahead Logging
db.pragma('synchronous = NORMAL'); // Balance safety/performance
db.pragma('cache_size = 10000'); // 10MB cache
```

### WebSocket Performance
- Batch updates instead of sending individual messages
- Throttle high-frequency events (position updates, typing indicators)
- Close idle connections after 30 minutes
- Use binary protocol for large payloads

### Monitoring & Profiling
```typescript
// Add timing logs for slow operations
console.time('getAllProjects');
const projects = db.getAllProjects(companyId);
console.timeEnd('getAllProjects'); // Log if > 100ms
```

## Security Best Practices (Multi-Tenant)

### Critical Security Rules

#### 1. **ALWAYS Filter by company_id**
```typescript
// ✅ CORRECT - Every query must filter by tenant
export const getProjects = (companyId: string) => {
  const stmt = db.prepare(
    'SELECT * FROM projects WHERE company_id = ?'
  );
  return stmt.all(companyId);
};

// ❌ WRONG - Never query without tenant filter
export const getAllProjects = () => {
  return db.prepare('SELECT * FROM projects').all(); // SECURITY BREACH!
};
```

#### 2. **Validate company_id from JWT Token**
```typescript
// In middleware
router.get('/projects', authenticateToken, (req, res) => {
  // ✅ Extract company_id from authenticated user token
  const { companyId } = req.user; // From JWT payload
  
  // ✅ Never trust company_id from request body/params
  // const { companyId } = req.body; // ❌ SECURITY BREACH!
  
  const projects = db.getProjects(companyId);
  res.json(projects);
});
```

#### 3. **Row Level Security (RLS) Enforcement**
All database tables with tenant data MUST have:
- `company_id` column (NOT NULL)
- Foreign key constraint to `companies` table
- Cascade delete: `ON DELETE CASCADE`
- Index on `company_id` for performance

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  company_id TEXT NOT NULL,
  -- other columns
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
CREATE INDEX idx_tasks_company ON tasks(company_id);
```

#### 4. **API Key Security (SDK Platform)**
```typescript
// ✅ Hash API keys before storing
const keyHash = await bcrypt.hash(apiKey, 10);
db.prepare('INSERT INTO api_keys (key_hash, key_prefix) VALUES (?, ?)')
  .run(keyHash, apiKey.substring(0, 8));

// ✅ Verify keys using hash comparison
const apiKey = req.headers['x-api-key'];
const storedHash = db.getApiKeyHash(keyPrefix);
const valid = await bcrypt.compare(apiKey, storedHash);

// ❌ Never store plain text API keys
```

#### 5. **JWT Token Security**
```typescript
// ✅ Use strong JWT secret (32+ bytes)
const JWT_SECRET = process.env.JWT_SECRET; // From environment
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

// ✅ Set reasonable expiration
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

// ✅ Validate token on every request
const decoded = jwt.verify(token, JWT_SECRET);
```

#### 6. **Password Security**
```typescript
// ✅ Use bcrypt with appropriate cost factor
const hash = await bcrypt.hash(password, 10); // Cost factor 10

// ✅ Enforce password requirements
if (password.length < 8) {
  throw new Error('Password must be at least 8 characters');
}

// ❌ Never log or expose passwords
console.log('User password:', password); // NEVER DO THIS!
```

#### 7. **Input Validation & Sanitization**
```typescript
// ✅ Validate all user inputs
if (!email.includes('@')) {
  return res.status(400).json({ error: 'Invalid email' });
}

// ✅ Use parameterized queries (prevents SQL injection)
db.prepare('SELECT * FROM users WHERE email = ?').get(email);

// ❌ Never concatenate SQL strings
db.exec(`SELECT * FROM users WHERE email = '${email}'`); // SQL INJECTION!
```

#### 8. **Role-Based Access Control (RBAC)**
```typescript
// ✅ Check permissions before operations
const requireRole = (allowedRoles: string[]) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage
router.delete('/projects/:id', 
  authenticateToken, 
  requireRole(['super_admin', 'company_admin']), 
  deleteProject
);
```

#### 9. **Webhook Secret Validation**
```typescript
// ✅ Verify webhook signatures with HMAC
import crypto from 'crypto';

const verifyWebhookSignature = (payload: string, signature: string, secret: string) => {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
};
```

#### 10. **Environment Variable Security**
```typescript
// ✅ Never commit .env.local to git (already in .gitignore)
// ✅ Use different secrets for dev/staging/production
// ✅ Rotate secrets regularly (quarterly)
// ✅ Use Vercel environment variables for production

// ❌ Never hardcode secrets in code
const apiKey = 'sk-1234567890'; // NEVER DO THIS!
```

### Security Checklist for New Features

- [ ] All database queries filter by `company_id` from JWT token
- [ ] API endpoints use `authenticateToken` middleware
- [ ] User inputs are validated and sanitized
- [ ] Passwords are hashed with bcrypt (cost factor 10+)
- [ ] API keys are hashed before storage
- [ ] Role checks implemented for privileged operations
- [ ] No sensitive data in logs or error messages
- [ ] CORS configured to allow only trusted origins
- [ ] Rate limiting on authentication endpoints
- [ ] SQL injection prevented via parameterized queries

### Common Security Vulnerabilities to Avoid

1. **Cross-Tenant Data Leakage**: Always filter by `company_id`
2. **Authentication Bypass**: Never skip `authenticateToken` middleware
3. **Privilege Escalation**: Validate roles before admin operations
4. **SQL Injection**: Use prepared statements, never string concatenation
5. **Insecure API Keys**: Hash keys, use prefixes for identification
6. **Token Theft**: Use httpOnly cookies or secure localStorage
7. **CORS Misconfiguration**: Whitelist specific origins, not `*`
8. **Information Disclosure**: Don't expose stack traces in production

## CI/CD Pipeline Configuration

### Vercel Deployment Pipeline

CortexBuild uses Vercel for continuous deployment with automatic builds on git push.

#### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

#### Environment Setup
```bash
# Development
.env.local (gitignored)

# Production (Vercel Dashboard)
Settings → Environment Variables:
- POSTGRES_URL
- JWT_SECRET
- OPENAI_API_KEY
- GEMINI_API_KEY
- ANTHROPIC_API_KEY
- NEXT_PUBLIC_ENABLE_AI_AGENTS
- ENABLE_SDK_DEVELOPER
```

#### Build Process
1. **Git Push**: Push to `main` branch triggers build
2. **Install**: `npm install` installs dependencies
3. **Build**: `npm run build` creates production bundle in `dist/`
4. **Serverless Functions**: API routes in `api/` deployed as serverless functions
5. **Deploy**: Frontend served from CDN, API routes as edge functions

#### Pre-deployment Checklist
- [ ] All tests passing locally: `npm run test`
- [ ] TypeScript compilation successful: `npx tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`
- [ ] Environment variables configured in Vercel dashboard
- [ ] Database migrations applied
- [ ] API endpoints tested with `test-api.sh`

#### Deployment Commands
```bash
# Preview deployment (branch)
vercel

# Production deployment
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

#### Rollback Strategy
```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote [deployment-url]

# Or redeploy specific commit
git checkout <commit-hash>
vercel --prod
```

#### GitHub Actions (Optional Setup)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Database Migration Pipeline
```bash
# Create migration
touch server/migrations/$(date +%Y%m%d%H%M%S)_description.sql

# Run migrations locally
npm run server  # Automatically runs pending migrations

# Production migrations
# Deploy migration SQL via Vercel Postgres Query interface
# Or use migration service in server/init-database.ts
```

## Error Handling and Logging Patterns

### Frontend Error Handling

#### React Error Boundary
```typescript
// Wrap app with ErrorBoundary
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>

// ErrorBoundary catches React component errors
// Located in components/ErrorBoundary.tsx
```

#### API Error Handling
```typescript
// Standard error handling pattern
try {
  const response = await api.get('/projects');
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Network or HTTP error
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const errorMessage = error.response.data.error || 'Request failed';
      
      if (statusCode === 401) {
        // Redirect to login
        authService.logout();
        navigateTo('auth');
      } else if (statusCode === 403) {
        toast.showError('Access Denied', errorMessage);
      } else {
        toast.showError('Error', errorMessage);
      }
    } else if (error.request) {
      // Request made but no response
      toast.showError('Network Error', 'Unable to reach server');
    }
  } else {
    // Non-Axios error
    toast.showError('Error', error.message);
  }
  
  // Log error for debugging
  logger.logError(error, { endpoint: '/projects' });
  
  throw error; // Re-throw if needed
}
```

#### Toast Notifications
```typescript
// Use toast for user-facing errors
import { useToast } from './hooks/useToast';

const { showSuccess, showError, showWarning } = useToast();

showSuccess('Project Created', 'Your project has been created successfully');
showError('Failed to Save', 'Please check your internet connection');
showWarning('Unsaved Changes', 'You have unsaved changes');
```

### Backend Error Handling

#### Express Error Middleware
```typescript
// In server/index.ts - add at the end after all routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  // Don't expose internal errors in production
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack })
  });
});
```

#### Route-Level Error Handling
```typescript
// Standard pattern for all routes
router.get('/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { id } = req.params;
    
    const project = db.getProject(id, companyId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error: any) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});
```

#### Database Error Handling
```typescript
// Wrap database operations in try-catch
export const getProjects = (companyId: string) => {
  try {
    const stmt = db.prepare(
      'SELECT * FROM projects WHERE company_id = ? ORDER BY created_at DESC'
    );
    return stmt.all(companyId);
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch projects');
  }
};
```

### Logging Patterns

#### Using Logger Utility
```typescript
import { logger } from './utils/logger';

// Info logging
logger.info('User logged in', { userId: user.id });

// Error logging with context
logger.error('Payment failed', { 
  userId: user.id, 
  amount: 100, 
  error: error.message 
});

// Performance logging
const startTime = Date.now();
const result = await expensiveOperation();
logger.logPerformance('expensiveOperation', Date.now() - startTime);

// User action logging
logger.logUserAction('create_project', { 
  projectId: project.id, 
  projectName: project.name 
}, user.id);

// API call logging
logger.logApiCall('/api/projects', 'GET', 200, 150, user.id);
```

#### Structured Logging Format
```typescript
// All logs follow this structure
{
  timestamp: "2025-10-09T12:34:56.789Z",
  level: "info",
  message: "User action: create_project",
  context: {
    projectId: "proj-123",
    projectName: "Tower A"
  },
  userId: "user-456",
  sessionId: "session-789"
}
```

#### Production Logging
```typescript
// In production, send logs to external service
// Configure in utils/logger.ts sendToLoggingService()

// Example integrations:
// - Sentry for error tracking
// - LogRocket for session replay
// - DataDog for application monitoring
// - CloudWatch Logs (AWS)
// - Vercel Analytics
```

#### Log Levels
- **DEBUG**: Development details, verbose output
- **INFO**: Normal operations, user actions
- **WARN**: Warnings, degraded performance, recoverable errors
- **ERROR**: Errors, exceptions, failures

#### What to Log
✅ **DO Log**:
- User authentication attempts (success/failure)
- Database queries performance (if > 100ms)
- API endpoint calls with status codes
- User actions (create, update, delete)
- Error messages and stack traces
- Performance metrics

❌ **DON'T Log**:
- Passwords or password hashes
- API keys or secrets
- Personal identifiable information (PII) in production
- Full request/response bodies in production
- Credit card or payment details

## API Documentation Standards

### Endpoint Documentation Format

Each API endpoint should document:

#### 1. **Endpoint Header**
```markdown
### POST /api/projects
Create a new project for the authenticated user's company.
```

#### 2. **Authentication**
```markdown
**Authentication**: Required (JWT Bearer token)
**Required Role**: `company_admin`, `Project Manager`, `super_admin`
```

#### 3. **Request Format**
```markdown
**Request Body**:
```json
{
  "name": "Tower A Construction",
  "location": "123 Main St, City, State",
  "description": "50-story mixed-use building",
  "startDate": "2025-01-15",
  "endDate": "2027-12-31",
  "budget": 50000000,
  "clientId": 123
}
```

**Validation**:
- `name`: Required, 3-100 characters
- `location`: Required, max 255 characters
- `budget`: Optional, positive number
- `startDate`: Required, ISO date format
```

#### 4. **Response Format**
```markdown
**Response** (201 Created):
```json
{
  "success": true,
  "project": {
    "id": 456,
    "companyId": "comp-1",
    "name": "Tower A Construction",
    "status": "planning",
    "createdAt": "2025-10-09T12:00:00.000Z"
  }
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "budget": "Budget must be positive"
  }
}
```
```

#### 5. **Error Codes**
```markdown
**Possible Errors**:
- `400` - Validation failed
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - Client not found
- `500` - Server error
```

#### 6. **Rate Limiting**
```markdown
**Rate Limit**: 100 requests per minute per user
**Headers**:
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 95`
- `X-RateLimit-Reset: 1696867200`
```

#### 7. **Example Request**
```markdown
**Example cURL**:
```bash
curl -X POST https://api.cortexbuild.com/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tower A Construction",
    "location": "123 Main St",
    "budget": 50000000
  }'
```

**Example JavaScript**:
```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Tower A Construction',
    location: '123 Main St',
    budget: 50000000
  })
});

const data = await response.json();
```
```

### API Testing Script
```bash
# test-api.sh usage
chmod +x test-api.sh

# Test login
./test-api.sh login

# Test projects endpoint
./test-api.sh projects

# Test with custom token
TOKEN="your-jwt-token" ./test-api.sh projects
```

### API Versioning
- Current version: v1 (implicit)
- Future versions: `/api/v2/projects`
- Maintain backward compatibility for at least 6 months
- Deprecation warnings in response headers: `X-API-Deprecated: true`

### OpenAPI/Swagger Documentation
```typescript
// Future enhancement: Generate OpenAPI spec
// Use tools like: swagger-jsdoc, tsoa
// Host at: /api/docs
```

## SDK Developer Platform - Deep Dive

### Overview
The SDK Developer Platform enables developers to build custom integrations, AI-powered tools, and automation workflows for CortexBuild. It includes an AI code builder, workflow engine, webhook system, and marketplace.

### Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│              SDK Developer Platform                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ AI Builder   │  │ Workflows    │  │ Agent Mgmt   │ │
│  │ Code Gen     │  │ Automation   │  │ Training     │ │
│  │ Monaco       │  │ Triggers     │  │ Deployment   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Marketplace  │  │ Analytics    │  │ Integrations │ │
│  │ Modules      │  │ Usage Stats  │  │ QuickBooks   │ │
│  │ Templates    │  │ Performance  │  │ Slack, etc.  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ✅ API Key Management                                  │
│  ✅ Webhook System with HMAC signatures                 │
│  ✅ Sandbox Environments for testing                    │
└─────────────────────────────────────────────────────────┘
```

### SDK Database Tables

#### Core Tables
```sql
-- API Keys for SDK authentication
api_keys (id, user_id, key_hash, key_prefix, scopes, is_active, expires_at)

-- Webhooks for real-time events
webhooks (id, user_id, company_id, url, events, secret, is_active)

-- Third-party integrations
integrations (id, user_id, company_id, provider, credentials, config)

-- Sandbox environments
sandbox_environments (id, developer_id, name, config, status)

-- SDK Workflows
sdk_workflows (id, developer_id, name, definition, is_active)

-- SDK Apps/Modules
sdk_apps (id, developer_id, name, description, version, code, status)

-- Webhook delivery logs
webhook_logs (id, webhook_id, event_type, payload, response_status)

-- OAuth tokens (encrypted)
oauth_tokens (integration_id, access_token, refresh_token, expires_at)
```

### SDK Application Examples

#### 1. RFI Auto-Responder AI Agent
Automatically analyzes RFIs and generates intelligent response drafts.

```typescript
// components/sdk/apps/RFIAutoResponder.tsx
import { useEffect, useState } from 'react';
import { openai } from '@/server/services/openai';

interface RFIAutoResponderProps {
  apiKey: string;
  companyId: string;
}

export const RFIAutoResponder: React.FC<RFIAutoResponderProps> = ({ apiKey, companyId }) => {
  const [rfis, setRfis] = useState([]);
  const [processing, setProcessing] = useState(false);

  const analyzeRFI = async (rfi: any) => {
    setProcessing(true);
    try {
      // Use AI to analyze RFI and generate response
      const prompt = `
        Analyze this RFI and provide a professional response:
        Subject: ${rfi.subject}
        Question: ${rfi.question}
        Context: ${rfi.description}
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a construction project assistant.' },
          { role: 'user', content: prompt }
        ]
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('RFI analysis error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="sdk-app rfi-responder">
      <h3>RFI Auto-Responder</h3>
      {/* UI for managing RFI responses */}
    </div>
  );
};
```

**Server-side webhook handler:**
```typescript
// server/routes/sdk-apps/rfi-responder.ts
import { Router } from 'express';
import { authenticateToken, requireDeveloper } from '../auth';
import { analyzeRFI } from '../services/ai/rfi-analyzer';

const router = Router();

router.post('/rfi-responder/analyze', authenticateToken, requireDeveloper, async (req, res) => {
  try {
    const { rfiId } = req.body;
    const { companyId } = req.user;

    const rfi = db.getRFI(rfiId, companyId);
    if (!rfi) {
      return res.status(404).json({ error: 'RFI not found' });
    }

    const suggestedResponse = await analyzeRFI(rfi);

    res.json({
      success: true,
      rfiId,
      suggestedResponse,
      confidence: 0.85
    });
  } catch (error) {
    console.error('RFI analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

export default router;
```

#### 2. Safety Incident Predictor
ML-powered safety incident prediction based on historical data.

```typescript
// components/sdk/apps/SafetyPredictor.tsx
interface SafetyPredictorConfig {
  analysisWindow: number; // days
  alertThreshold: number; // 0-1
  notificationChannels: string[];
}

export const SafetyPredictor: React.FC = () => {
  const [riskScore, setRiskScore] = useState(0);
  const [predictions, setPredictions] = useState([]);

  const analyzeSafetyRisk = async () => {
    const response = await api.post('/sdk/safety-predictor/analyze', {
      projectId: currentProject.id,
      historicalDays: 90
    });

    setRiskScore(response.data.riskScore);
    setPredictions(response.data.predictions);
  };

  return (
    <div className="sdk-app safety-predictor">
      <div className="risk-gauge">
        <h3>Current Risk Level</h3>
        <div className={`score ${riskScore > 0.7 ? 'high' : 'low'}`}>
          {(riskScore * 100).toFixed(1)}%
        </div>
      </div>
      
      <div className="predictions">
        <h4>Predicted Incidents (Next 30 Days)</h4>
        {predictions.map(pred => (
          <div key={pred.id} className="prediction-card">
            <span className="type">{pred.type}</span>
            <span className="probability">{(pred.probability * 100).toFixed(0)}%</span>
            <span className="area">{pred.area}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**ML Analysis Service:**
```typescript
// server/services/ml/safety-predictor.ts
import { db } from '../database';

interface SafetyIncident {
  date: string;
  type: string;
  severity: number;
  weather: string;
  workersOnSite: number;
}

export const predictSafetyRisk = async (projectId: string, companyId: string) => {
  // Fetch historical incident data
  const incidents = db.getIncidents(projectId, companyId);
  const weather = await fetchWeatherData();
  const workforce = db.getWorkforceStats(projectId);

  // Simple risk calculation (can be replaced with ML model)
  const recentIncidents = incidents.filter(i => 
    Date.now() - new Date(i.date).getTime() < 30 * 24 * 60 * 60 * 1000
  );

  const riskFactors = {
    incidentRate: recentIncidents.length / 30,
    weatherRisk: weather.condition === 'rain' ? 1.5 : 1.0,
    workforceSize: workforce.total > 50 ? 1.2 : 1.0
  };

  const riskScore = Math.min(
    (riskFactors.incidentRate * riskFactors.weatherRisk * riskFactors.workforceSize) / 10,
    1.0
  );

  return {
    riskScore,
    predictions: generatePredictions(incidents, riskScore),
    recommendations: generateRecommendations(riskScore)
  };
};
```

#### 3. QuickBooks Integration App
Bi-directional sync between CortexBuild and QuickBooks Online.

```typescript
// components/sdk/apps/QuickBooksSync.tsx
interface QuickBooksConfig {
  autoSync: boolean;
  syncInterval: number; // minutes
  syncEntities: ('invoices' | 'clients' | 'expenses')[];
}

export const QuickBooksSync: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const connectQuickBooks = async () => {
    // OAuth flow
    const authUrl = await api.get('/sdk/integrations/quickbooks/auth-url');
    window.location.href = authUrl.data.url;
  };

  const syncNow = async () => {
    setSyncStatus('syncing');
    try {
      const result = await api.post('/sdk/integrations/quickbooks/sync', {
        entities: ['invoices', 'clients']
      });
      
      setLastSync(new Date());
      setSyncStatus('idle');
      toast.success(`Synced ${result.data.count} records`);
    } catch (error) {
      setSyncStatus('error');
      toast.error('Sync failed');
    }
  };

  return (
    <div className="sdk-app quickbooks-sync">
      <div className="connection-status">
        {connected ? (
          <div className="connected">
            <CheckCircle className="text-green-500" />
            <span>Connected to QuickBooks</span>
          </div>
        ) : (
          <button onClick={connectQuickBooks} className="btn-primary">
            Connect QuickBooks
          </button>
        )}
      </div>

      {connected && (
        <div className="sync-controls">
          <button onClick={syncNow} disabled={syncStatus === 'syncing'}>
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </button>
          
          {lastSync && (
            <p className="last-sync">
              Last synced: {lastSync.toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
```

#### 4. Automated Daily Report Generator
Generates and emails daily project reports automatically.

```typescript
// components/sdk/apps/DailyReportGenerator.tsx
interface ReportConfig {
  recipients: string[];
  schedule: string; // cron format
  sections: ('progress' | 'safety' | 'budget' | 'tasks')[];
  format: 'pdf' | 'html' | 'markdown';
}

export const DailyReportGenerator: React.FC = () => {
  const [config, setConfig] = useState<ReportConfig>({
    recipients: [],
    schedule: '0 17 * * *', // 5 PM daily
    sections: ['progress', 'safety', 'budget', 'tasks'],
    format: 'pdf'
  });

  const generatePreview = async () => {
    const preview = await api.post('/sdk/reports/preview', {
      projectId: currentProject.id,
      sections: config.sections
    });

    // Show preview modal
  };

  const saveConfiguration = async () => {
    await api.post('/sdk/reports/configure', config);
    toast.success('Report configuration saved');
  };

  return (
    <div className="sdk-app report-generator">
      <h3>Daily Report Configuration</h3>
      
      <div className="config-section">
        <label>Recipients</label>
        <input 
          type="email" 
          placeholder="email@example.com"
          onKeyPress={e => {
            if (e.key === 'Enter') {
              setConfig({
                ...config,
                recipients: [...config.recipients, e.currentTarget.value]
              });
            }
          }}
        />
        <div className="recipient-list">
          {config.recipients.map(email => (
            <span key={email} className="badge">{email}</span>
          ))}
        </div>
      </div>

      <div className="config-section">
        <label>Report Sections</label>
        {['progress', 'safety', 'budget', 'tasks'].map(section => (
          <label key={section} className="checkbox">
            <input 
              type="checkbox"
              checked={config.sections.includes(section as any)}
              onChange={e => {
                if (e.target.checked) {
                  setConfig({ ...config, sections: [...config.sections, section as any] });
                } else {
                  setConfig({ ...config, sections: config.sections.filter(s => s !== section) });
                }
              }}
            />
            {section}
          </label>
        ))}
      </div>

      <div className="actions">
        <button onClick={generatePreview} className="btn-secondary">
          Preview Report
        </button>
        <button onClick={saveConfiguration} className="btn-primary">
          Save & Activate
        </button>
      </div>
    </div>
  );
};
```

#### 5. Cost Overrun Detector
AI-powered budget analysis and overrun prediction.

```typescript
// components/sdk/apps/CostOverrunDetector.tsx
export const CostOverrunDetector: React.FC = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const analyzeProjectCosts = async () => {
      const response = await api.post('/sdk/cost-analyzer/analyze', {
        projectId: currentProject.id
      });

      setAnalysis(response.data.analysis);
      setAlerts(response.data.alerts);
    };

    analyzeProjectCosts();
  }, [currentProject.id]);

  return (
    <div className="sdk-app cost-detector">
      <div className="budget-health">
        <h3>Budget Health Score</h3>
        <div className={`score ${analysis?.score < 70 ? 'warning' : 'good'}`}>
          {analysis?.score}/100
        </div>
      </div>

      <div className="alerts">
        <h4>Cost Alerts</h4>
        {alerts.map(alert => (
          <div key={alert.id} className={`alert ${alert.severity}`}>
            <AlertTriangle />
            <div>
              <strong>{alert.category}</strong>
              <p>{alert.message}</p>
              <span className="amount">${alert.amount.toLocaleString()} over budget</span>
            </div>
          </div>
        ))}
      </div>

      <div className="projections">
        <h4>30-Day Projection</h4>
        <div className="chart">
          {/* Cost projection chart */}
        </div>
      </div>
    </div>
  );
};
```

### SDK Workflow Automation Examples

#### Workflow 1: Invoice Payment Reminder
```typescript
const invoiceReminderWorkflow = {
  id: 'invoice-reminder-001',
  name: 'Overdue Invoice Reminder',
  trigger: {
    type: 'schedule',
    cron: '0 9 * * *' // Daily at 9 AM
  },
  steps: [
    {
      id: 'fetch-overdue',
      type: 'query',
      action: 'getOverdueInvoices',
      params: { daysOverdue: 7 }
    },
    {
      id: 'send-reminders',
      type: 'notification',
      action: 'sendEmail',
      template: 'invoice-reminder',
      recipients: 'invoice.client.email'
    },
    {
      id: 'log-activity',
      type: 'audit',
      action: 'logEvent',
      event: 'reminder_sent'
    }
  ]
};
```

#### Workflow 2: Safety Incident Alert
```typescript
const safetyIncidentWorkflow = {
  id: 'safety-incident-001',
  name: 'Immediate Safety Alert',
  trigger: {
    type: 'webhook',
    event: 'incident.created'
  },
  conditions: [
    { field: 'severity', operator: 'gte', value: 'high' }
  ],
  steps: [
    {
      id: 'notify-managers',
      type: 'notification',
      channels: ['sms', 'email', 'slack'],
      recipients: 'project.safety_officers'
    },
    {
      id: 'create-report',
      type: 'document',
      action: 'generateIncidentReport',
      format: 'pdf'
    },
    {
      id: 'update-dashboard',
      type: 'ui',
      action: 'showAlert',
      priority: 'critical'
    }
  ]
};
```

### Webhook Event System

#### Available Webhook Events
```typescript
// Project Events
'project.created'
'project.updated'
'project.completed'
'project.status_changed'

// Task Events
'task.created'
'task.assigned'
'task.completed'
'task.overdue'

// Financial Events
'invoice.created'
'invoice.sent'
'invoice.paid'
'invoice.overdue'
'expense.approved'

// Safety Events
'incident.reported'
'inspection.completed'
'safety.violation'

// Document Events
'document.uploaded'
'document.approved'
'drawing.revised'
```

#### Webhook Implementation
```typescript
// server/services/webhooks/dispatcher.ts
import crypto from 'crypto';
import axios from 'axios';

export const dispatchWebhook = async (
  webhook: Webhook,
  event: string,
  data: any
) => {
  const payload = JSON.stringify({
    event,
    timestamp: Date.now(),
    data,
    company_id: webhook.company_id,
    user_id: webhook.user_id
  });

  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(payload)
    .digest('hex');

  try {
    const response = await axios.post(webhook.url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-CortexBuild-Event': event,
        'X-CortexBuild-Signature': signature,
        'X-CortexBuild-Timestamp': Date.now().toString(),
        'X-CortexBuild-Webhook-Id': webhook.id
      },
      timeout: 10000 // 10 second timeout
    });

    // Log successful delivery
    await logWebhookDelivery(webhook.id, event, payload, response.status, null);
    
    return { success: true, status: response.status };
  } catch (error: any) {
    // Log failed delivery
    await logWebhookDelivery(
      webhook.id,
      event,
      payload,
      error.response?.status || 0,
      error.message
    );

    // Auto-disable after 10 consecutive failures
    const failures = await getConsecutiveFailures(webhook.id);
    if (failures >= 10) {
      await disableWebhook(webhook.id);
    }

    return { success: false, error: error.message };
  }
};
```

### SDK API Endpoints Reference

#### Workflow Management
```typescript
// Create workflow
POST /api/sdk/workflows
Body: { name, definition, is_active }

// List workflows
GET /api/sdk/workflows

// Update workflow
PUT /api/sdk/workflows/:id
Body: { name, definition, is_active }

// Delete workflow
DELETE /api/sdk/workflows/:id

// Execute workflow manually
POST /api/sdk/workflows/:id/execute
Body: { input_data }
```

#### App Management
```typescript
// Create SDK app
POST /api/sdk/apps
Body: { name, description, code, version }

// Publish app to marketplace
POST /api/sdk/apps/:id/publish

// Install app
POST /api/sdk/apps/:id/install

// Uninstall app
DELETE /api/sdk/apps/:id/uninstall
```

#### Sandbox Operations
```typescript
// Create sandbox
POST /api/sdk/sandbox
Body: { name, config }

// Run code in sandbox
POST /api/sdk/sandbox/:id/run
Body: { code, timeout }

// Get sandbox logs
GET /api/sdk/sandbox/:id/logs

// Delete sandbox
DELETE /api/sdk/sandbox/:id
```

### SDK Best Practices

#### 1. API Key Management
```typescript
// ✅ DO: Rotate API keys regularly
const rotateApiKey = async (oldKeyId: string) => {
  const newKey = await api.post('/sdk/api-keys/rotate', { oldKeyId });
  // Update applications with new key
  await updateApplicationCredentials(newKey.key);
  // Revoke old key after grace period
  setTimeout(() => revokeKey(oldKeyId), 7 * 24 * 60 * 60 * 1000); // 7 days
};

// ❌ DON'T: Hardcode API keys in frontend
const apiKey = 'cortex_sk_123456789'; // NEVER DO THIS
```

#### 2. Webhook Security
```typescript
// ✅ DO: Always verify webhook signatures
const verifyWebhook = (req: Request): boolean => {
  const signature = req.headers['x-cortexbuild-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// ❌ DON'T: Process webhooks without verification
app.post('/webhook', (req, res) => {
  processWebhookData(req.body); // SECURITY RISK!
});
```

#### 3. Rate Limiting
```typescript
// ✅ DO: Implement rate limiting for SDK apps
import rateLimit from 'express-rate-limit';

const sdkLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this API key'
});

app.use('/api/sdk', sdkLimiter);
```

#### 4. Error Handling in SDK Apps
```typescript
// ✅ DO: Provide detailed error information
try {
  const result = await api.post('/sdk/workflow/execute', data);
  return result.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    logger.error('SDK workflow execution failed', {
      workflowId: data.workflowId,
      statusCode: error.response?.status,
      errorMessage: error.response?.data?.error
    });
    
    throw new Error(`Workflow failed: ${error.response?.data?.error || 'Unknown error'}`);
  }
  throw error;
}
```

### SDK Marketplace Guidelines

#### Publishing an App
1. **Complete Metadata**: Name, description, category, screenshots
2. **Version Semantic Versioning**: Follow semver (1.0.0)
3. **Documentation**: Include README with setup instructions
4. **Testing**: Provide test credentials or sandbox mode
5. **Support**: Include support email or documentation link

#### App Categories
- **AI & Automation**: AI agents, workflow automations
- **Integrations**: Third-party service connectors
- **Analytics**: Custom dashboards and reports
- **Safety**: Safety monitoring and compliance tools
- **Financial**: Budget tracking, invoice management
- **Productivity**: Task management, scheduling tools

## Advanced Platform Development

### AI Integration Architecture

#### Multi-Provider AI System
CortexBuild supports multiple AI providers with automatic fallback:

```typescript
// server/services/ai/unified-ai-service.ts
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

interface AIProvider {
  name: 'openai' | 'gemini' | 'anthropic';
  priority: number;
  available: boolean;
}

export class UnifiedAIService {
  private providers: AIProvider[] = [
    { name: 'openai', priority: 1, available: !!process.env.OPENAI_API_KEY },
    { name: 'gemini', priority: 2, available: !!process.env.GEMINI_API_KEY },
    { name: 'anthropic', priority: 3, available: !!process.env.ANTHROPIC_API_KEY }
  ];

  async chat(messages: Array<{role: string, content: string}>, options = {}) {
    const sortedProviders = this.providers
      .filter(p => p.available)
      .sort((a, b) => a.priority - b.priority);

    for (const provider of sortedProviders) {
      try {
        const response = await this.callProvider(provider.name, messages, options);
        return { success: true, data: response, provider: provider.name };
      } catch (error) {
        console.warn(`Provider ${provider.name} failed, trying next...`);
        continue;
      }
    }

    throw new Error('All AI providers failed');
  }

  private async callProvider(
    provider: 'openai' | 'gemini' | 'anthropic',
    messages: any[],
    options: any
  ) {
    switch (provider) {
      case 'openai':
        return this.callOpenAI(messages, options);
      case 'gemini':
        return this.callGemini(messages, options);
      case 'anthropic':
        return this.callAnthropic(messages, options);
    }
  }

  private async callOpenAI(messages: any[], options: any) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000
    });
    return response.choices[0].message.content;
  }

  private async callGemini(messages: any[], options: any) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: options.model || 'gemini-pro' });
    
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async callAnthropic(messages: any[], options: any) {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.maxTokens || 2000,
      messages
    });
    return response.content[0].text;
  }
}

export const aiService = new UnifiedAIService();
```

#### AI Agent Framework
```typescript
// server/services/ai/agent-framework.ts
interface AgentConfig {
  name: string;
  systemPrompt: string;
  tools: AgentTool[];
  memory: boolean;
  temperature: number;
}

interface AgentTool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
}

export class AIAgent {
  private config: AgentConfig;
  private conversationHistory: Array<{role: string, content: string}> = [];

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async execute(userMessage: string, context?: any) {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Build messages with system prompt
    const messages = [
      { role: 'system', content: this.config.systemPrompt },
      ...this.conversationHistory
    ];

    // Get AI response
    const response = await aiService.chat(messages, {
      temperature: this.config.temperature
    });

    // Check if AI wants to use a tool
    const toolCall = this.parseToolCall(response.data);
    if (toolCall) {
      const toolResult = await this.executeTool(toolCall);
      
      // Add tool result to conversation
      this.conversationHistory.push({
        role: 'assistant',
        content: `Tool used: ${toolCall.name}\nResult: ${JSON.stringify(toolResult)}`
      });

      // Get final response with tool result
      return this.execute(`Based on the tool result, provide final answer`, context);
    }

    // Add assistant response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response.data
    });

    return response.data;
  }

  private parseToolCall(response: string): any {
    // Parse if AI response contains tool call
    const toolCallRegex = /TOOL_CALL:\s*(\w+)\((.*)\)/;
    const match = response.match(toolCallRegex);
    
    if (match) {
      return {
        name: match[1],
        params: JSON.parse(match[2] || '{}')
      };
    }
    
    return null;
  }

  private async executeTool(toolCall: any) {
    const tool = this.config.tools.find(t => t.name === toolCall.name);
    if (!tool) {
      throw new Error(`Tool ${toolCall.name} not found`);
    }
    
    return tool.execute(toolCall.params);
  }

  clearMemory() {
    this.conversationHistory = [];
  }
}

// Example: RFI Analysis Agent
export const createRFIAnalysisAgent = () => {
  return new AIAgent({
    name: 'RFI Analyzer',
    systemPrompt: `You are a construction RFI analysis expert. Analyze RFIs and provide:
      1. Summary of the request
      2. Required information to respond
      3. Suggested response draft
      4. Potential risks or concerns
      Format responses professionally.`,
    tools: [
      {
        name: 'searchProjectDocs',
        description: 'Search project documents for relevant information',
        parameters: { query: 'string' },
        execute: async (params) => {
          // Implementation to search docs
          return { documents: [] };
        }
      },
      {
        name: 'getProjectHistory',
        description: 'Get historical RFIs and responses for context',
        parameters: { projectId: 'string' },
        execute: async (params) => {
          // Implementation to get history
          return { history: [] };
        }
      }
    ],
    memory: true,
    temperature: 0.3
  });
};
```

### Advanced Database Patterns

#### Database Connection Pooling
```typescript
// server/database-pool.ts
import Database from 'better-sqlite3';

class DatabasePool {
  private pool: Database.Database[] = [];
  private readonly poolSize = 5;
  private inUse: Set<Database.Database> = new Set();

  constructor(dbPath: string) {
    for (let i = 0; i < this.poolSize; i++) {
      const db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
      db.pragma('cache_size = 10000');
      db.pragma('foreign_keys = ON');
      this.pool.push(db);
    }
  }

  acquire(): Database.Database {
    const available = this.pool.find(db => !this.inUse.has(db));
    if (!available) {
      throw new Error('No available database connections');
    }
    this.inUse.add(available);
    return available;
  }

  release(db: Database.Database) {
    this.inUse.delete(db);
  }

  async execute<T>(fn: (db: Database.Database) => T): Promise<T> {
    const db = this.acquire();
    try {
      return fn(db);
    } finally {
      this.release(db);
    }
  }

  close() {
    this.pool.forEach(db => db.close());
  }
}

export const dbPool = new DatabasePool('./cortexbuild.db');
```

#### Query Builder Pattern
```typescript
// server/utils/query-builder.ts
export class QueryBuilder {
  private table: string;
  private whereConditions: string[] = [];
  private whereParams: any[] = [];
  private selectFields: string[] = ['*'];
  private orderByClause: string = '';
  private limitClause: string = '';

  constructor(table: string) {
    this.table = table;
  }

  select(...fields: string[]): this {
    this.selectFields = fields;
    return this;
  }

  where(condition: string, ...params: any[]): this {
    this.whereConditions.push(condition);
    this.whereParams.push(...params);
    return this;
  }

  whereIn(field: string, values: any[]): this {
    const placeholders = values.map(() => '?').join(', ');
    this.whereConditions.push(`${field} IN (${placeholders})`);
    this.whereParams.push(...values);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByClause = `ORDER BY ${field} ${direction}`;
    return this;
  }

  limit(count: number, offset: number = 0): this {
    this.limitClause = `LIMIT ${count} OFFSET ${offset}`;
    return this;
  }

  build(): { sql: string; params: any[] } {
    const fields = this.selectFields.join(', ');
    let sql = `SELECT ${fields} FROM ${this.table}`;

    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }

    if (this.orderByClause) {
      sql += ` ${this.orderByClause}`;
    }

    if (this.limitClause) {
      sql += ` ${this.limitClause}`;
    }

    return { sql, params: this.whereParams };
  }

  execute(db: Database.Database): any[] {
    const { sql, params } = this.build();
    return db.prepare(sql).all(...params);
  }
}

// Usage example
const projects = new QueryBuilder('projects')
  .select('id', 'name', 'status', 'budget')
  .where('company_id = ?', companyId)
  .where('status = ?', 'active')
  .orderBy('created_at', 'DESC')
  .limit(50)
  .execute(db);
```

#### Transaction Management
```typescript
// server/utils/transaction-manager.ts
export class TransactionManager {
  constructor(private db: Database.Database) {}

  async execute<T>(fn: (db: Database.Database) => T): Promise<T> {
    const transaction = this.db.transaction(fn);
    try {
      return transaction();
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Example: Create project with related data
  async createProjectWithData(projectData: any, tasksData: any[], membersData: any[]) {
    return this.execute((db) => {
      // Insert project
      const projectStmt = db.prepare(`
        INSERT INTO projects (company_id, name, location, budget, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const projectResult = projectStmt.run(
        projectData.companyId,
        projectData.name,
        projectData.location,
        projectData.budget,
        'active'
      );
      const projectId = projectResult.lastInsertRowid;

      // Insert tasks
      const taskStmt = db.prepare(`
        INSERT INTO tasks (project_id, title, description, status)
        VALUES (?, ?, ?, ?)
      `);
      tasksData.forEach(task => {
        taskStmt.run(projectId, task.title, task.description, 'todo');
      });

      // Insert team members
      const memberStmt = db.prepare(`
        INSERT INTO project_team (project_id, user_id, role)
        VALUES (?, ?, ?)
      `);
      membersData.forEach(member => {
        memberStmt.run(projectId, member.userId, member.role);
      });

      return { projectId, taskCount: tasksData.length, memberCount: membersData.length };
    });
  }
}
```

### Real-Time Collaboration Features

#### WebSocket Message Types
```typescript
// server/websocket-types.ts
export type WebSocketMessage =
  | { type: 'user_joined'; data: { userId: string; userName: string; projectId: string } }
  | { type: 'user_left'; data: { userId: string; projectId: string } }
  | { type: 'task_updated'; data: { taskId: string; updates: any; userId: string } }
  | { type: 'document_edited'; data: { documentId: string; changes: any; userId: string } }
  | { type: 'chat_message'; data: { message: string; userId: string; projectId: string } }
  | { type: 'cursor_position'; data: { x: number; y: number; userId: string } }
  | { type: 'typing_indicator'; data: { userId: string; isTyping: boolean } };

interface WebSocketClient {
  ws: WebSocket;
  userId: string;
  companyId: string;
  projectId?: string;
  lastActivity: Date;
}
```

#### Collaboration Manager
```typescript
// server/services/collaboration-manager.ts
import { WebSocket } from 'ws';

export class CollaborationManager {
  private clients: Map<string, WebSocketClient> = new Map();
  private projectRooms: Map<string, Set<string>> = new Map();

  addClient(clientId: string, client: WebSocketClient) {
    this.clients.set(clientId, client);
    
    if (client.projectId) {
      this.joinProjectRoom(clientId, client.projectId);
    }
  }

  removeClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (client?.projectId) {
      this.leaveProjectRoom(clientId, client.projectId);
    }
    this.clients.delete(clientId);
  }

  joinProjectRoom(clientId: string, projectId: string) {
    if (!this.projectRooms.has(projectId)) {
      this.projectRooms.set(projectId, new Set());
    }
    this.projectRooms.get(projectId)!.add(clientId);

    // Notify others in room
    this.broadcastToProject(projectId, {
      type: 'user_joined',
      data: {
        userId: this.clients.get(clientId)!.userId,
        userName: 'User Name', // Fetch from database
        projectId
      }
    }, clientId);
  }

  leaveProjectRoom(clientId: string, projectId: string) {
    this.projectRooms.get(projectId)?.delete(clientId);
    
    // Notify others
    this.broadcastToProject(projectId, {
      type: 'user_left',
      data: {
        userId: this.clients.get(clientId)!.userId,
        projectId
      }
    }, clientId);
  }

  broadcastToProject(projectId: string, message: WebSocketMessage, excludeClient?: string) {
    const clientIds = this.projectRooms.get(projectId);
    if (!clientIds) return;

    const payload = JSON.stringify(message);
    clientIds.forEach(clientId => {
      if (clientId !== excludeClient) {
        const client = this.clients.get(clientId);
        if (client?.ws.readyState === WebSocket.OPEN) {
          client.ws.send(payload);
        }
      }
    });
  }

  broadcastToCompany(companyId: string, message: WebSocketMessage) {
    const payload = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.companyId === companyId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }

  getActiveUsers(projectId: string): string[] {
    const clientIds = this.projectRooms.get(projectId);
    if (!clientIds) return [];

    return Array.from(clientIds)
      .map(id => this.clients.get(id)?.userId)
      .filter(Boolean) as string[];
  }
}

export const collaborationManager = new CollaborationManager();
```

### Caching Strategy

#### Redis-Like In-Memory Cache
```typescript
// server/services/cache-service.ts
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Helper: Get or compute
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await computeFn();
    this.set(key, value, ttlSeconds);
    return value;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

export const cache = new CacheService();

// Usage examples
// Cache user data
cache.set(`user:${userId}`, userData, 600); // 10 minutes

// Cache project list
const projects = await cache.getOrCompute(
  `company:${companyId}:projects`,
  async () => db.getAllProjects(companyId),
  300 // 5 minutes
);

// Invalidate cache on update
cache.delete(`company:${companyId}:projects`);
```

### Advanced Search & Filtering

#### Full-Text Search Implementation
```typescript
// server/services/search-service.ts
export class SearchService {
  constructor(private db: Database.Database) {
    this.initializeSearchTables();
  }

  private initializeSearchTables() {
    // Create FTS5 virtual table for full-text search
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS projects_fts
      USING fts5(id, name, description, location, content='projects', content_rowid='id');

      CREATE TRIGGER IF NOT EXISTS projects_fts_insert AFTER INSERT ON projects
      BEGIN
        INSERT INTO projects_fts(rowid, id, name, description, location)
        VALUES (new.id, new.id, new.name, new.description, new.location);
      END;

      CREATE TRIGGER IF NOT EXISTS projects_fts_update AFTER UPDATE ON projects
      BEGIN
        UPDATE projects_fts
        SET name = new.name, description = new.description, location = new.location
        WHERE rowid = new.id;
      END;

      CREATE TRIGGER IF NOT EXISTS projects_fts_delete AFTER DELETE ON projects
      BEGIN
        DELETE FROM projects_fts WHERE rowid = old.id;
      END;
    `);
  }

  searchProjects(companyId: string, query: string, options: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}): any[] {
    const { limit = 50, offset = 0, status } = options;

    let sql = `
      SELECT 
        p.*,
        highlight(projects_fts, 1, '<mark>', '</mark>') as highlighted_name,
        rank
      FROM projects_fts
      JOIN projects p ON p.id = projects_fts.id
      WHERE projects_fts MATCH ? AND p.company_id = ?
    `;

    const params: any[] = [query, companyId];

    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY rank LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return this.db.prepare(sql).all(...params);
  }

  // Advanced filters
  advancedSearch(companyId: string, filters: {
    query?: string;
    status?: string[];
    budgetMin?: number;
    budgetMax?: number;
    startDateFrom?: string;
    startDateTo?: string;
    projectManagerId?: string;
  }): any[] {
    const builder = new QueryBuilder('projects')
      .where('company_id = ?', companyId);

    if (filters.query) {
      // Use FTS for text search
      builder.where('id IN (SELECT id FROM projects_fts WHERE projects_fts MATCH ?)', filters.query);
    }

    if (filters.status && filters.status.length > 0) {
      builder.whereIn('status', filters.status);
    }

    if (filters.budgetMin !== undefined) {
      builder.where('budget >= ?', filters.budgetMin);
    }

    if (filters.budgetMax !== undefined) {
      builder.where('budget <= ?', filters.budgetMax);
    }

    if (filters.startDateFrom) {
      builder.where('start_date >= ?', filters.startDateFrom);
    }

    if (filters.startDateTo) {
      builder.where('start_date <= ?', filters.startDateTo);
    }

    if (filters.projectManagerId) {
      builder.where('project_manager_id = ?', filters.projectManagerId);
    }

    return builder.orderBy('created_at', 'DESC').execute(this.db);
  }
}

export const searchService = new SearchService(db);
```

### Background Job Processing

#### Job Queue System
```typescript
// server/services/job-queue.ts
interface Job {
  id: string;
  type: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

export class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private processing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(private handlers: Map<string, (data: any) => Promise<any>>) {}

  addJob(type: string, data: any, maxAttempts: number = 3): string {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.jobs.set(jobId, {
      id: jobId,
      type,
      data,
      attempts: 0,
      maxAttempts,
      status: 'pending',
      createdAt: new Date()
    });

    return jobId;
  }

  start() {
    if (this.processing) return;
    
    this.processing = true;
    this.processingInterval = setInterval(() => this.processJobs(), 5000);
  }

  stop() {
    this.processing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  private async processJobs() {
    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending' && job.attempts < job.maxAttempts);

    for (const job of pendingJobs) {
      await this.processJob(job);
    }
  }

  private async processJob(job: Job) {
    job.status = 'processing';
    job.attempts++;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = 'failed';
      job.error = `No handler for job type: ${job.type}`;
      return;
    }

    try {
      await handler(job.data);
      job.status = 'completed';
      job.processedAt = new Date();
    } catch (error: any) {
      console.error(`Job ${job.id} failed:`, error);
      
      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
        job.error = error.message;
      } else {
        job.status = 'pending'; // Retry
      }
    }
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  getJobsByStatus(status: Job['status']): Job[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }
}

// Initialize job queue with handlers
const jobHandlers = new Map<string, (data: any) => Promise<any>>([
  ['send_email', async (data) => {
    // Email sending logic
    console.log('Sending email to:', data.to);
    // await emailService.send(data);
  }],
  ['generate_report', async (data) => {
    // Report generation logic
    console.log('Generating report for project:', data.projectId);
    // await reportService.generate(data);
  }],
  ['sync_integration', async (data) => {
    // Integration sync logic
    console.log('Syncing integration:', data.integrationId);
    // await integrationService.sync(data);
  }],
  ['process_webhook', async (data) => {
    // Webhook processing logic
    console.log('Processing webhook:', data.webhookId);
    // await webhookService.process(data);
  }]
]);

export const jobQueue = new JobQueue(jobHandlers);

// Start processing
jobQueue.start();

// Usage
const jobId = jobQueue.addJob('send_email', {
  to: 'user@example.com',
  subject: 'Project Update',
  body: 'Your project has been updated'
});
```

### Analytics & Reporting Engine

#### Analytics Service
```typescript
// server/services/analytics-service.ts
export class AnalyticsService {
  constructor(private db: Database.Database) {}

  // Project Analytics
  getProjectAnalytics(projectId: string, companyId: string) {
    return {
      overview: this.getProjectOverview(projectId, companyId),
      timeline: this.getProjectTimeline(projectId, companyId),
      budget: this.getBudgetAnalysis(projectId, companyId),
      team: this.getTeamProductivity(projectId, companyId),
      risks: this.getRiskAnalysis(projectId, companyId)
    };
  }

  private getProjectOverview(projectId: string, companyId: string) {
    const project = this.db.prepare(`
      SELECT 
        p.*,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
        COUNT(DISTINCT CASE WHEN t.due_date < date('now') AND t.status != 'completed' THEN t.id END) as overdue_tasks,
        COUNT(DISTINCT tm.user_id) as team_size,
        SUM(te.hours) as total_hours
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN project_team tm ON tm.project_id = p.id
      LEFT JOIN time_entries te ON te.project_id = p.id
      WHERE p.id = ? AND p.company_id = ?
      GROUP BY p.id
    `).get(projectId, companyId);

    return {
      ...project,
      completion_percentage: project.total_tasks > 0 
        ? Math.round((project.completed_tasks / project.total_tasks) * 100)
        : 0
    };
  }

  private getProjectTimeline(projectId: string, companyId: string) {
    return this.db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as tasks_created,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as tasks_completed
      FROM tasks
      WHERE project_id = ? 
      AND project_id IN (SELECT id FROM projects WHERE company_id = ?)
      GROUP BY date(created_at)
      ORDER BY date DESC
      LIMIT 30
    `).all(projectId, companyId);
  }

  private getBudgetAnalysis(projectId: string, companyId: string) {
    const budget = this.db.prepare(`
      SELECT 
        p.budget,
        COALESCE(SUM(e.amount), 0) as spent,
        p.budget - COALESCE(SUM(e.amount), 0) as remaining,
        CASE 
          WHEN p.budget > 0 THEN ROUND((COALESCE(SUM(e.amount), 0) / p.budget) * 100, 2)
          ELSE 0
        END as spent_percentage
      FROM projects p
      LEFT JOIN expenses e ON e.project_id = p.id
      WHERE p.id = ? AND p.company_id = ?
      GROUP BY p.id
    `).get(projectId, companyId);

    // Spending by category
    const byCategory = this.db.prepare(`
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM expenses
      WHERE project_id = ?
      AND project_id IN (SELECT id FROM projects WHERE company_id = ?)
      GROUP BY category
      ORDER BY total DESC
    `).all(projectId, companyId);

    return { ...budget, byCategory };
  }

  private getTeamProductivity(projectId: string, companyId: string) {
    return this.db.prepare(`
      SELECT 
        u.id,
        u.name,
        COUNT(DISTINCT t.id) as tasks_assigned,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed,
        SUM(te.hours) as hours_logged,
        ROUND(AVG(CASE WHEN t.status = 'completed' THEN 
          julianday(t.updated_at) - julianday(t.created_at)
        END), 2) as avg_completion_days
      FROM users u
      JOIN project_team pt ON pt.user_id = u.id
      LEFT JOIN tasks t ON t.assigned_to = u.id AND t.project_id = pt.project_id
      LEFT JOIN time_entries te ON te.user_id = u.id AND te.project_id = pt.project_id
      WHERE pt.project_id = ? 
      AND pt.project_id IN (SELECT id FROM projects WHERE company_id = ?)
      GROUP BY u.id, u.name
      ORDER BY tasks_completed DESC
    `).all(projectId, companyId);
  }

  private getRiskAnalysis(projectId: string, companyId: string) {
    const risks = [];

    // Budget risk
    const budgetData: any = this.db.prepare(`
      SELECT budget, 
        COALESCE((SELECT SUM(amount) FROM expenses WHERE project_id = ?), 0) as spent
      FROM projects 
      WHERE id = ? AND company_id = ?
    `).get(projectId, projectId, companyId);

    if (budgetData && budgetData.spent > budgetData.budget * 0.9) {
      risks.push({
        type: 'budget',
        severity: 'high',
        message: 'Budget is 90% consumed',
        recommendation: 'Review expenses and adjust budget forecast'
      });
    }

    // Schedule risk
    const overdueCount: any = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE project_id = ? 
      AND due_date < date('now') 
      AND status != 'completed'
    `).get(projectId);

    if (overdueCount && overdueCount.count > 5) {
      risks.push({
        type: 'schedule',
        severity: 'medium',
        message: `${overdueCount.count} overdue tasks`,
        recommendation: 'Prioritize overdue tasks and adjust timeline'
      });
    }

    return risks;
  }

  // Company-wide analytics
  getCompanyDashboard(companyId: string, dateRange: { from: string; to: string }) {
    return {
      projects: this.getCompanyProjectStats(companyId, dateRange),
      financial: this.getCompanyFinancials(companyId, dateRange),
      team: this.getCompanyTeamStats(companyId, dateRange),
      trends: this.getCompanyTrends(companyId, dateRange)
    };
  }

  private getCompanyProjectStats(companyId: string, dateRange: any) {
    return this.db.prepare(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_projects,
        SUM(budget) as total_budget,
        AVG(CASE 
          WHEN status = 'completed' THEN 
            julianday(updated_at) - julianday(created_at)
        END) as avg_project_duration
      FROM projects
      WHERE company_id = ?
      AND created_at BETWEEN ? AND ?
    `).get(companyId, dateRange.from, dateRange.to);
  }

  private getCompanyFinancials(companyId: string, dateRange: any) {
    return this.db.prepare(`
      SELECT 
        COALESCE(SUM(i.amount), 0) as revenue,
        COALESCE(SUM(e.amount), 0) as expenses,
        COALESCE(SUM(i.amount), 0) - COALESCE(SUM(e.amount), 0) as profit,
        COUNT(DISTINCT i.id) as invoices_sent,
        COUNT(DISTINCT CASE WHEN i.status = 'paid' THEN i.id END) as invoices_paid
      FROM companies c
      LEFT JOIN projects p ON p.company_id = c.id
      LEFT JOIN invoices i ON i.project_id = p.id AND i.created_at BETWEEN ? AND ?
      LEFT JOIN expenses e ON e.project_id = p.id AND e.created_at BETWEEN ? AND ?
      WHERE c.id = ?
    `).get(dateRange.from, dateRange.to, dateRange.from, dateRange.to, companyId);
  }

  private getCompanyTeamStats(companyId: string, dateRange: any) {
    return this.db.prepare(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.role = 'Project Manager' THEN u.id END) as managers,
        COUNT(DISTINCT pt.project_id) as active_projects,
        SUM(te.hours) as total_hours_logged
      FROM users u
      LEFT JOIN project_team pt ON pt.user_id = u.id
      LEFT JOIN time_entries te ON te.user_id = u.id AND te.created_at BETWEEN ? AND ?
      WHERE u.company_id = ?
    `).get(dateRange.from, dateRange.to, companyId);
  }

  private getCompanyTrends(companyId: string, dateRange: any) {
    // Monthly trends
    return this.db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as projects_started,
        SUM(budget) as total_budget
      FROM projects
      WHERE company_id = ?
      AND created_at BETWEEN ? AND ?
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month
    `).all(companyId, dateRange.from, dateRange.to);
  }
}

export const analyticsService = new AnalyticsService(db);
```

### Notification System

#### Multi-Channel Notification Service
```typescript
// server/services/notification-service.ts
interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  channels: ('in_app' | 'email' | 'sms' | 'push')[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: any;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  constructor(private db: Database.Database) {
    this.initializeNotificationTable();
  }

  private initializeNotificationTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        channels TEXT NOT NULL,
        priority TEXT NOT NULL,
        data TEXT,
        read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id)
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
    `);
  }

  async send(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store in database
    this.db.prepare(`
      INSERT INTO notifications (id, user_id, company_id, type, title, message, channels, priority, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      notification.userId,
      notification.data?.companyId || '',
      notification.type,
      notification.title,
      notification.message,
      JSON.stringify(notification.channels),
      notification.priority,
      JSON.stringify(notification.data || {})
    );

    // Send via selected channels
    for (const channel of notification.channels) {
      await this.sendViaChannel(channel, notification);
    }

    // Send real-time via WebSocket if user is online
    if (notification.channels.includes('in_app')) {
      collaborationManager.broadcastToUser(notification.userId, {
        type: 'notification',
        data: { id, ...notification }
      });
    }

    return id;
  }

  private async sendViaChannel(channel: string, notification: any) {
    switch (channel) {
      case 'email':
        await this.sendEmail(notification);
        break;
      case 'sms':
        await this.sendSMS(notification);
        break;
      case 'push':
        await this.sendPush(notification);
        break;
    }
  }

  private async sendEmail(notification: any) {
    // Email sending implementation
    console.log('Sending email notification:', notification.title);
    // await emailService.send({
    //   to: notification.userId,
    //   subject: notification.title,
    //   body: notification.message
    // });
  }

  private async sendSMS(notification: any) {
    // SMS sending implementation
    console.log('Sending SMS notification:', notification.title);
  }

  private async sendPush(notification: any) {
    // Push notification implementation
    console.log('Sending push notification:', notification.title);
  }

  getUserNotifications(userId: string, options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}): any[] {
    const { unreadOnly = false, limit = 50, offset = 0 } = options;

    let sql = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    
    const params: any[] = [userId];

    if (unreadOnly) {
      sql += ` AND read = 0`;
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return this.db.prepare(sql).all(...params);
  }

  markAsRead(notificationId: string, userId: string) {
    this.db.prepare(`
      UPDATE notifications 
      SET read = 1 
      WHERE id = ? AND user_id = ?
    `).run(notificationId, userId);
  }

  markAllAsRead(userId: string) {
    this.db.prepare(`
      UPDATE notifications 
      SET read = 1 
      WHERE user_id = ? AND read = 0
    `).run(userId);
  }

  getUnreadCount(userId: string): number {
    const result: any = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND read = 0
    `).get(userId);
    
    return result.count;
  }
}

export const notificationService = new NotificationService(db);

// Usage examples
// Task assigned notification
await notificationService.send({
  userId: 'user-123',
  type: 'info',
  title: 'New Task Assigned',
  message: 'You have been assigned to task: Fix roof leak',
  channels: ['in_app', 'email'],
  priority: 'normal',
  data: {
    taskId: 'task-456',
    projectId: 'proj-789',
    companyId: 'comp-1'
  }
});

// Urgent safety incident
await notificationService.send({
  userId: 'manager-123',
  type: 'error',
  title: 'Safety Incident Reported',
  message: 'A safety incident has been reported on Site A',
  channels: ['in_app', 'email', 'sms'],
  priority: 'urgent',
  data: {
    incidentId: 'inc-123',
    projectId: 'proj-789',
    companyId: 'comp-1'
  }
});
```
