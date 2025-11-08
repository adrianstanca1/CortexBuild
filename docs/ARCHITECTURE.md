# CortexBuild Architecture Documentation

## System Overview

CortexBuild is a comprehensive construction industry SaaS platform built with modern web technologies. The system follows a role-based architecture with clear separation of concerns.

---

## Technology Stack

### Frontend
- **Framework:** React 19.2.0
- **Language:** TypeScript
- **Build Tool:** Vite 6.3.6
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Context + Hooks
- **HTTP Client:** Axios

### Backend
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth + JWT
- **Hosting:** Vercel
- **Real-time:** Supabase Realtime Subscriptions

### Performance
- **Code Splitting:** React.lazy() + Vite manual chunks
- **Lazy Loading:** IntersectionObserver + Service Worker
- **Caching:** HTTP headers + Service Worker
- **Minification:** Terser
- **Image Optimization:** WebP + Lazy loading

---

## Architecture Layers

### 1. Presentation Layer

**Components:**
- Dashboard components (UnifiedAdminDashboard, CompanyAdminDashboard, etc.)
- Screen components (ProjectsScreen, TasksScreen, etc.)
- UI components (LazyImage, LazyComponentWrapper, etc.)
- Admin components (UserManagement, CompanyManagement, etc.)

**Responsibilities:**
- Render UI
- Handle user interactions
- Display data
- Manage local component state

**Key Files:**
- `components/screens/` - Screen components
- `components/dashboard/` - Dashboard components
- `components/ui/` - Reusable UI components
- `components/admin/` - Admin-specific components

### 2. Business Logic Layer

**Services:**
- `lib/services/authService.ts` - Authentication logic
- `lib/services/serviceWorkerManager.ts` - Service Worker management
- `lib/services/cacheConfig.ts` - Cache configuration

**Utilities:**
- `utils/validation.ts` - Input validation
- `utils/logger.ts` - Logging utilities
- `utils/formatters.ts` - Data formatting

**Responsibilities:**
- Business logic
- Data transformation
- Validation
- Error handling

### 3. Data Access Layer

**Supabase Client:**
- `lib/supabase/client.ts` - Supabase initialization
- Direct table access via Supabase client

**Database Tables:**
- `users` - User accounts
- `companies` - Company information
- `projects` - Project data
- `tasks` - Task management
- `documents` - Document storage
- `payments` - Payment records
- `audit_logs` - Audit trail

**Responsibilities:**
- Database queries
- Data persistence
- Real-time subscriptions
- Transaction management

### 4. Infrastructure Layer

**Deployment:**
- Vercel for frontend hosting
- Supabase for backend services
- Service Worker for offline support

**Caching:**
- HTTP caching headers (vercel.json)
- Service Worker caching strategies
- Browser cache management

---

## Role-Based Architecture

### User Roles

1. **Super Admin**
   - Dashboard: UnifiedAdminDashboard
   - Access: Platform-wide system controls
   - Features: User management, company management, billing, system settings

2. **Company Admin**
   - Dashboard: CompanyAdminDashboardNew
   - Access: Single company management
   - Features: Team management, project oversight, billing

3. **Project Manager**
   - Dashboard: EnhancedDashboard
   - Access: Project-level operations
   - Features: Task management, team coordination, reporting

4. **Developer**
   - Dashboard: DeveloperDashboard
   - Access: SDK and API tools
   - Features: API management, webhook configuration, analytics

5. **Regular User**
   - Dashboard: EnhancedDashboard
   - Access: Day-to-day operations
   - Features: Task management, document access, collaboration

### Dashboard Separation

```
UnifiedAdminDashboard (Super Admin)
├── Platform metrics
├── User management
├── Company management
└── System settings

CompanyAdminDashboardNew (Company Admin)
├── Company metrics
├── Team management
├── Project overview
└── Billing

EnhancedDashboard (Regular Users)
├── Task management
├── Project overview
├── Performance charts
└── Quick actions

DeveloperDashboard (Developers)
├── API management
├── Webhook configuration
├── SDK documentation
└── Analytics
```

---

## Data Flow

### Authentication Flow

```
User Input (Email/Password)
    ↓
LoginForm Component
    ↓
authService.login()
    ↓
Supabase Auth
    ↓
JWT Token Generated
    ↓
Token Stored (localStorage)
    ↓
User Redirected to Dashboard
```

### API Request Flow

```
Component
    ↓
axios.create() with interceptors
    ↓
Add Authorization header
    ↓
Send Request to API
    ↓
Supabase RPC/Query
    ↓
Database Query
    ↓
Response returned
    ↓
Component State Updated
```

### Real-time Subscription Flow

```
Component Mount
    ↓
Subscribe to Supabase channel
    ↓
Listen for changes (INSERT, UPDATE, DELETE)
    ↓
Callback triggered
    ↓
Component state updated
    ↓
UI re-renders
    ↓
Component Unmount
    ↓
Unsubscribe from channel
```

---

## Database Schema

### Core Tables

#### users
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- name (VARCHAR)
- role (ENUM: super_admin, company_admin, project_manager, developer, user)
- company_id (UUID, FK)
- password (VARCHAR, hashed)
- avatar (VARCHAR)
- status (ENUM: active, inactive, suspended)
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

#### companies
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- address (VARCHAR)
- subscription_tier (ENUM: free, starter, pro, enterprise)
- status (ENUM: active, inactive, suspended)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### projects
```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- company_id (UUID, FK)
- status (ENUM: active, completed, archived)
- start_date (DATE)
- end_date (DATE)
- budget (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### tasks
```sql
- id (UUID, PK)
- project_id (UUID, FK)
- title (VARCHAR)
- description (TEXT)
- status (ENUM: todo, in_progress, completed)
- priority (ENUM: low, medium, high, critical)
- assigned_to (UUID, FK)
- due_date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### documents
```sql
- id (UUID, PK)
- name (VARCHAR)
- file_path (VARCHAR)
- file_type (VARCHAR)
- file_size (INTEGER)
- category (VARCHAR)
- project_id (UUID, FK)
- uploaded_by (UUID, FK)
- version (INTEGER)
- created_at (TIMESTAMP)
```

#### payments
```sql
- id (UUID, PK)
- company_id (UUID, FK)
- amount (DECIMAL)
- currency (VARCHAR)
- status (ENUM: pending, completed, failed)
- payment_method (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### audit_logs
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- action (VARCHAR)
- resource_type (VARCHAR)
- resource_id (UUID)
- details (JSONB)
- ip_address (VARCHAR)
- user_agent (VARCHAR)
- status (ENUM: success, failure, warning)
- created_at (TIMESTAMP)
```

---

## Performance Architecture

### Code Splitting Strategy

```
Main Bundle (88.44 KB gzip)
├── React core
├── App component
├── Authentication
└── Routing

Lazy Chunks (1-50 KB each)
├── Dashboard components
├── Admin components
├── Development tools
└── Marketplace
```

### Caching Strategy

```
HTTP Caching (vercel.json)
├── HTML: 1 hour (must-revalidate)
├── Static assets: 1 year (immutable)
├── Images: 1 year (immutable)
└── API: No cache (must-revalidate)

Service Worker Caching
├── Cache-first: Static assets, images
├── Network-first: API calls, HTML
└── Offline fallback: Cached pages
```

### Image Optimization

```
Original Image
    ↓
LazyImage Component
    ├── Native lazy loading
    ├── IntersectionObserver
    ├── WebP format (25-35% smaller)
    └── Blur-up effect
    ↓
Optimized Image
```

---

## Security Architecture

### Authentication & Authorization

1. **JWT Tokens**
   - Issued by Supabase Auth
   - Stored in localStorage
   - Sent in Authorization header
   - Validated on each request

2. **Role-Based Access Control (RBAC)**
   - 5 user roles with specific permissions
   - Dashboard separation by role
   - API endpoint protection

3. **Password Security**
   - SHA-256 hashing
   - Secure password validation
   - Password reset flow

### Data Protection

1. **Row Level Security (RLS)**
   - Supabase RLS policies
   - User can only access their data
   - Company admins access company data

2. **Audit Logging**
   - All user actions logged
   - Audit trail for compliance
   - IP address and user agent tracking

3. **HTTPS/TLS**
   - All traffic encrypted
   - Vercel SSL certificates
   - Secure headers configured

---

## Scalability Considerations

### Horizontal Scaling
- Stateless frontend (Vercel)
- Database scaling (Supabase)
- CDN for static assets

### Vertical Scaling
- Code splitting reduces initial load
- Lazy loading improves performance
- Service Worker enables offline mode

### Database Optimization
- Indexed queries
- Connection pooling
- Query optimization

---

## Monitoring & Observability

### Logging
- Client-side logging (console)
- Server-side logging (Supabase)
- Audit trail (audit_logs table)

### Performance Monitoring
- Core Web Vitals tracking
- Bundle size monitoring
- Cache hit rate tracking

### Error Tracking
- Error boundaries
- Try-catch blocks
- Error logging service

---

## Next Steps

- See [API Documentation](./API_DOCUMENTATION.md) for endpoint details
- See [Component Documentation](./COMPONENT_DOCUMENTATION.md) for UI components
- See [Deployment Guide](./DEPLOYMENT.md) for production setup

