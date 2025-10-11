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
- Password: Cumparavinde1

Company Admin:
- Email: casey@constructco.com
- Password: password123
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