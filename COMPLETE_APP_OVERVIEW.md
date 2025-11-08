# 🏗️ CortexBuild - Complete Application Overview

## 📊 Executive Summary

**CortexBuild** is a comprehensive construction management platform with AI capabilities, real-time collaboration, and multi-tenant architecture.

- **Total Files:** 2,200+ TypeScript/JavaScript files
- **Backend API Routes:** 34 route modules
- **Frontend Components:** 400+ React components
- **Dashboards:** 15+ role-based dashboards
- **Database:** SQLite + Supabase (PostgreSQL)
- **Tech Stack:** React 19, TypeScript, Node.js, Express, Vite

---

## 🎯 Core Features

### 1. **Multi-Role Dashboards**
- ✅ Super Admin Dashboard (Platform Management)
- ✅ Company Admin Dashboard (Company Operations)
- ✅ Project Manager Dashboard (Project Oversight)
- ✅ Developer Dashboard (API & SDK Management)
- ✅ Field Worker Dashboard (Daily Operations)
- ✅ Client Dashboard (Project Visibility)

### 2. **Project Management**
- Projects & Milestones
- Tasks & Assignments
- RFIs (Requests for Information)
- Daily Site Logs
- Document Management
- Photo Documentation
- Plans & Drawings Viewer

### 3. **Financial Management**
- Invoicing System
- Purchase Orders
- Budget Tracking
- Subcontractor Management
- Payment Applications
- Cost Tracking

### 4. **AI & Automation**
- AI Chat Assistant (Gemini Integration)
- Smart Tool Recommendations
- Automated Workflows
- AI Code Generation
- Risk Analysis
- Safety Analysis

### 5. **Developer Platform**
- SDK & API Management
- Marketplace (Apps & Widgets)
- Custom Module Development
- AgentKit (AI Agent Framework)
- Workflow Automation Studio
- Integration Hub

---

## 🏛️ Architecture

```
CortexBuild/
├── Frontend (React + TypeScript)
│   ├── App.tsx (Main Application Router)
│   ├── components/ (400+ components)
│   │   ├── screens/ (50+ screen components)
│   │   ├── dashboards/ (15+ dashboards)
│   │   ├── admin/ (Admin components)
│   │   ├── developer/ (Developer tools)
│   │   ├── ErrorBoundaries/ (Error handling)
│   │   └── ui/ (Reusable UI components)
│   ├── contexts/ (React contexts)
│   ├── hooks/ (Custom hooks)
│   └── services/ (API clients)
│
├── Backend (Node.js + Express)
│   ├── server/
│   │   ├── routes/ (34 API route modules)
│   │   ├── middleware/ (Auth, validation, rate limiting)
│   │   ├── services/ (Business logic)
│   │   └── utils/ (Helper functions)
│   ├── database/ (SQLite schemas)
│   └── lib/ (AI integrations)
│
├── Database
│   ├── SQLite (Local development)
│   └── Supabase (Production PostgreSQL)
│
└── Configuration
    ├── vite.config.ts
    ├── tsconfig.json
    ├── jest.config.cjs
    └── docker-compose.yml
```

---

## 📱 Frontend Components

### **Main Dashboards**

#### 1. **Super Admin Dashboard** (`components/admin/SuperAdminDashboardV2.tsx`)
- Platform-wide analytics
- User management (all companies)
- Company management
- System settings
- Audit logs
- AI agents management
- Subscription management

#### 2. **Company Admin Dashboard** (`components/screens/company/CompanyAdminDashboardV2.tsx`)
**Office Operations:**
- Project Management
- Team Management
- Document Management
- App Marketplace
- Analytics & Reports
- Billing & Invoicing
- Client Management
- Company Settings

**Field Operations:**
- Tasks & Assignments
- Daily Site Logs
- RFIs & Issues
- Safety Reports
- Quality Control
- Time Tracking
- Photo Documentation
- Equipment Tracking
- Material Procurement

#### 3. **Developer Dashboard** (`components/screens/developer/DeveloperDashboardV2.tsx`)
- API Documentation
- SDK Management
- App Development
- Testing Tools
- Database Viewer
- Git Integration
- Performance Monitoring
- Usage Analytics

#### 4. **Project Manager Dashboard**
- Project Overview
- Task Management
- Resource Allocation
- Budget Tracking
- Progress Reports
- Team Collaboration

#### 5. **Field Worker Dashboard** (`components/screens/MyDayScreen.tsx`)
- My Tasks
- Daily Logs
- Photo Upload
- Time Entry
- Safety Checklists
- Equipment Checkout

#### 6. **Client Dashboard**
- Project Status
- Milestones
- Budget & Invoices
- Document Access
- Progress Photos
- Communication

### **Screen Components** (50+ Screens)

#### Core Screens
- `AuthScreen.tsx` - Authentication
- `MyDayScreen.tsx` - Daily overview
- `ProjectsScreen.tsx` - Project list
- `TaskDetailScreen.tsx` - Task details
- `DailyLogScreen.tsx` - Daily logs
- `DocumentsScreen.tsx` - Document viewer
- `DrawingsScreen.tsx` - CAD drawings
- `PlansViewerScreen.tsx` - Plan viewer
- `PhotoGalleryScreen.tsx` - Photo management
- `AnalyticsScreen.tsx` - Analytics dashboard
- `NotificationsScreen.tsx` - Notifications
- `SettingsScreen.tsx` - Settings

#### Management Screens
- `ClientsManagement.tsx` - Client management
- `CompaniesManagement.tsx` - Company management
- `InvitationsManagement.tsx` - User invitations
- `AIAgentsManagement.tsx` - AI agent config
- `AuditLogViewer.tsx` - Audit logs
- `PlansManagement.tsx` - Plan management

#### Developer Screens
- `DeveloperWorkspaceScreen.tsx` - Dev workspace
- `ConstructionAutomationStudio.tsx` - Automation builder
- `SimpleDeveloperConsole.tsx` - Dev console
- `EnhancedDeveloperConsole.tsx` - Advanced console

#### Field Screens
- `PunchListScreen.tsx` - Punch list
- `DayworkSheetDetailScreen.tsx` - Daywork sheets
- `DeliveryScreen.tsx` - Delivery tracking
- `RFIsScreen.tsx` - RFI management

### **Specialized Components**

#### AI Components
- `AIAdvisor.tsx` - AI assistant
- `AISearchModal.tsx` - AI-powered search
- `AISiteInspector.tsx` - Site inspection AI
- `ChatbotWidget.tsx` - Chat interface
- `SmartConstructionAssistant.tsx` - Construction AI

#### Financial Components
- `InvoicesView.tsx` - Invoice management
- `BudgetManager.tsx` - Budget tracking
- `CostEstimator.tsx` - Cost estimation
- `PaymentApplicationManager.tsx` - Payment apps

#### Project Components
- `ProjectDetailView.tsx` - Project details
- `ProjectsMapView.tsx` - Project map
- `KanbanBoard.tsx` - Kanban view
- `GanttChart.tsx` - Gantt timeline

#### Collaboration Components
- `RealtimeCollaboration.tsx` - Live collaboration
- `ChatView.tsx` - Team chat
- `VideoConference.tsx` - Video calls

---

## 🔌 Backend API Routes

### **1. Authentication & Users** (`server/routes/admin.ts`)
```typescript
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
```

### **2. Projects** (`server/routes/projects.ts`)
```typescript
GET    /api/projects              // List projects
POST   /api/projects              // Create project
GET    /api/projects/:id          // Get project
PUT    /api/projects/:id          // Update project
DELETE /api/projects/:id          // Delete project
GET    /api/projects/:id/stats    // Project statistics
```

### **3. Tasks** (`server/routes/tasks.ts`)
```typescript
GET    /api/tasks                 // List tasks
POST   /api/tasks                 // Create task
GET    /api/tasks/:id             // Get task
PUT    /api/tasks/:id             // Update task
DELETE /api/tasks/:id             // Delete task
POST   /api/tasks/:id/assign      // Assign task
POST   /api/tasks/:id/complete    // Complete task
```

### **4. Clients** (`server/routes/clients.ts`)
```typescript
GET    /api/clients               // List clients
POST   /api/clients               // Create client
GET    /api/clients/:id           // Get client
PUT    /api/clients/:id           // Update client
DELETE /api/clients/:id           // Delete client
```

### **5. Invoices** (`server/routes/invoices.ts`)
```typescript
GET    /api/invoices              // List invoices
POST   /api/invoices              // Create invoice
GET    /api/invoices/:id          // Get invoice
PUT    /api/invoices/:id          // Update invoice
DELETE /api/invoices/:id          // Delete invoice
POST   /api/invoices/:id/send     // Send invoice
POST   /api/invoices/:id/pay      // Mark as paid
```

### **6. RFIs** (`server/routes/rfis.ts`)
```typescript
GET    /api/rfis                  // List RFIs
POST   /api/rfis                  // Create RFI
GET    /api/rfis/:id              // Get RFI
PUT    /api/rfis/:id              // Update RFI
DELETE /api/rfis/:id              // Delete RFI
POST   /api/rfis/:id/respond      // Respond to RFI
```

### **7. Documents** (`server/routes/documents.ts`)
```typescript
GET    /api/documents             // List documents
POST   /api/documents             // Upload document
GET    /api/documents/:id         // Get document
DELETE /api/documents/:id         // Delete document
GET    /api/documents/:id/download // Download document
```

### **8. Time Entries** (`server/routes/time-entries.ts`)
```typescript
GET    /api/time-entries          // List entries
POST   /api/time-entries          // Create entry
GET    /api/time-entries/:id      // Get entry
PUT    /api/time-entries/:id      // Update entry
DELETE /api/time-entries/:id      // Delete entry
POST   /api/time-entries/:id/approve // Approve entry
```

### **9. Milestones** (`server/routes/milestones.ts`)
```typescript
GET    /api/milestones            // List milestones
POST   /api/milestones            // Create milestone
GET    /api/milestones/:id        // Get milestone
PUT    /api/milestones/:id        // Update milestone
DELETE /api/milestones/:id        // Delete milestone
```

### **10. Subcontractors** (`server/routes/subcontractors.ts`)
```typescript
GET    /api/subcontractors        // List subcontractors
POST   /api/subcontractors        // Create subcontractor
GET    /api/subcontractors/:id    // Get subcontractor
PUT    /api/subcontractors/:id    // Update subcontractor
DELETE /api/subcontractors/:id    // Delete subcontractor
```

### **11. Purchase Orders** (`server/routes/purchase-orders.ts`)
```typescript
GET    /api/purchase-orders       // List POs
POST   /api/purchase-orders       // Create PO
GET    /api/purchase-orders/:id   // Get PO
PUT    /api/purchase-orders/:id   // Update PO
DELETE /api/purchase-orders/:id   // Delete PO
POST   /api/purchase-orders/:id/approve // Approve PO
```

### **12. AI Chat** (`server/routes/ai-chat.ts`)
```typescript
POST   /api/ai/chat               // Send message
GET    /api/ai/chat/history       // Get history
DELETE /api/ai/chat/history       // Clear history
POST   /api/ai/suggest            // Get suggestions
GET    /api/ai/usage              // Get usage stats
```

### **13. Marketplace** (`server/routes/marketplace.ts`)
```typescript
GET    /api/marketplace/apps      // List apps
GET    /api/marketplace/apps/:id  // Get app
POST   /api/marketplace/apps/:id/install // Install app
DELETE /api/marketplace/apps/:id/uninstall // Uninstall
GET    /api/marketplace/widgets   // List widgets
```

### **14. Global Marketplace** (`server/routes/global-marketplace.ts`)
```typescript
GET    /api/global-marketplace/apps // Browse apps
POST   /api/global-marketplace/apps/:id/purchase // Purchase
GET    /api/global-marketplace/developers // List developers
POST   /api/global-marketplace/publish // Publish app
```

### **15. SDK & Developer** (`server/routes/sdk.ts`)
```typescript
// Developer Profile
GET    /api/sdk/profile           // Get profile
PATCH  /api/sdk/profile           // Update profile
POST   /api/sdk/profile/api-key   // Generate API key

// Apps
GET    /api/sdk/apps              // List apps
POST   /api/sdk/apps              // Create app
PATCH  /api/sdk/apps/:id/status   // Update status

// Workflows
GET    /api/sdk/workflows         // List workflows
POST   /api/sdk/workflows         // Create workflow

// Code Generation
POST   /api/sdk/generate          // Generate code with AI
GET    /api/sdk/models/:provider  // Get AI models

// Analytics
GET    /api/sdk/analytics/usage   // Get usage
POST   /api/sdk/analytics/log     // Log usage

// Collaboration
POST   /api/sdk/collaboration/sessions // Create session
POST   /api/sdk/collaboration/cursor // Update cursor
POST   /api/sdk/collaboration/comments // Add comment

// Templates
GET    /api/sdk/templates         // Get templates
POST   /api/sdk/templates         // Create template
```

### **16. AgentKit** (`server/routes/agentkit.ts`)
```typescript
GET    /api/agentkit/agents       // List AI agents
POST   /api/agentkit/agents       // Create agent
POST   /api/agentkit/agents/:id/execute // Execute agent
GET    /api/agentkit/tools        // List tools
```

### **17. Workflows** (`server/routes/workflows.ts`)
```typescript
GET    /api/workflows             // List workflows
POST   /api/workflows             // Create workflow
POST   /api/workflows/:id/execute // Execute workflow
GET    /api/workflows/:id/logs    // Get logs
```

### **18. Automations** (`server/routes/automations.ts`)
```typescript
GET    /api/automations           // List automations
POST   /api/automations           // Create automation
PUT    /api/automations/:id       // Update automation
DELETE /api/automations/:id       // Delete automation
POST   /api/automations/:id/trigger // Trigger automation
```

### **19. Integrations** (`server/routes/integrations.ts`)
```typescript
GET    /api/integrations          // List integrations
POST   /api/integrations/:name/connect // Connect
DELETE /api/integrations/:name/disconnect // Disconnect
GET    /api/integrations/:name/sync // Sync data
```

### **20. Smart Tools** (`server/routes/smart-tools.ts`)
```typescript
GET    /api/smart-tools           // List tools
POST   /api/smart-tools/:id/execute // Execute tool
GET    /api/smart-tools/recommendations // Get recommendations
```

### **21. Modules** (`server/routes/modules.ts`)
```typescript
GET    /api/modules               // List modules
POST   /api/modules               // Install module
DELETE /api/modules/:id           // Uninstall module
PUT    /api/modules/:id/settings  // Update settings
POST   /api/modules/:id/enable    // Enable module
POST   /api/modules/:id/disable   // Disable module
```

### **22. Admin SDK** (`server/routes/admin-sdk.ts`)
```typescript
GET    /api/admin/sdk/users       // List SDK users
GET    /api/admin/sdk/stats       // Platform stats
GET    /api/admin/sdk/apps        // All apps
POST   /api/admin/sdk/apps/:id/approve // Approve app
```

### **23. Enhanced Admin** (`server/routes/enhanced-admin.ts`)
```typescript
GET    /api/admin/enhanced/analytics // Advanced analytics
GET    /api/admin/enhanced/audit-logs // Audit logs
POST   /api/admin/enhanced/backup // Create backup
GET    /api/admin/enhanced/health // System health
```

### **24. My Applications** (`server/routes/my-applications.ts`)
```typescript
GET    /api/my-apps               // List my apps
GET    /api/my-apps/:id           // Get app details
POST   /api/my-apps/:id/launch    // Launch app
PUT    /api/my-apps/:id/settings  // Update settings
```

### **25. Budgets** (`server/routes/budgets.ts`)
```typescript
GET    /api/budgets               // List budgets
POST   /api/budgets               // Create budget
PUT    /api/budgets/:id           // Update budget
GET    /api/budgets/:id/tracking  // Budget tracking
```

### **26. Bids** (`server/routes/bids.ts`)
```typescript
GET    /api/bids                  // List bids
POST   /api/bids                  // Create bid
PUT    /api/bids/:id              // Update bid
POST   /api/bids/:id/submit       // Submit bid
```

### **27. Tenders** (`server/routes/tenders.ts`)
```typescript
GET    /api/tenders               // List tenders
POST   /api/tenders               // Create tender
PUT    /api/tenders/:id           // Update tender
POST   /api/tenders/:id/publish   // Publish tender
```

### **28. Gantt** (`server/routes/gantt.ts`)
```typescript
GET    /api/gantt/:projectId      // Get Gantt data
PUT    /api/gantt/:projectId      // Update Gantt
```

### **29. Advanced AI** (`server/routes/advanced-ai.ts`)
```typescript
POST   /api/advanced-ai/analyze   // Analyze data
POST   /api/advanced-ai/predict   // Predictions
POST   /api/advanced-ai/optimize  // Optimization
POST   /api/advanced-ai/risk      // Risk analysis
```

### **30. Agents** (`server/routes/agents.ts`)
```typescript
GET    /api/agents                // List agents
POST   /api/agents                // Create agent
PATCH  /api/agents/:id/status     // Update status
```

### **31. Codex MCP** (`server/routes/codex-mcp.ts`)
```typescript
POST   /api/codex-mcp/execute     // Execute code
GET    /api/codex-mcp/models      // List models
POST   /api/codex-mcp/analyze     // Analyze code
```

### **32. Developer Routes** (`server/routes/developer.ts`)
```typescript
GET    /api/developer/docs        // API documentation
GET    /api/developer/sandbox     // Sandbox environment
POST   /api/developer/test        // Test endpoint
GET    /api/developer/logs        // View logs
```

---

## 💾 Database Schema

### **Core Tables**

#### **users**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company_id TEXT,
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

#### **companies**
```sql
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  settings TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **projects**
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  company_id TEXT NOT NULL,
  client_id TEXT,
  budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  location TEXT,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

#### **tasks**
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT NOT NULL,
  assigned_to TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

#### **invoices**
```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  project_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  items TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

#### **rfis** (Requests for Information)
```sql
CREATE TABLE rfis (
  id TEXT PRIMARY KEY,
  rfi_number TEXT NOT NULL,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  assigned_to TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  response TEXT,
  responded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (submitted_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

#### **documents**
```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  url TEXT NOT NULL,
  project_id TEXT,
  uploaded_by TEXT NOT NULL,
  folder TEXT,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

#### **time_entries**
```sql
CREATE TABLE time_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  task_id TEXT,
  hours DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  billable BOOLEAN DEFAULT 1,
  approved BOOLEAN DEFAULT 0,
  approved_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

### **Developer Platform Tables**

#### **sdk_profiles**
```sql
CREATE TABLE sdk_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  developer_name TEXT,
  company_name TEXT,
  api_key TEXT UNIQUE,
  api_requests_limit INTEGER DEFAULT 1000,
  api_requests_used INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **sdk_apps**
```sql
CREATE TABLE sdk_apps (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  company_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'draft',
  manifest TEXT,
  code TEXT,
  is_public BOOLEAN DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (developer_id) REFERENCES users(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

#### **sdk_workflows**
```sql
CREATE TABLE sdk_workflows (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  definition TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 0,
  is_public BOOLEAN DEFAULT 0,
  category TEXT,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (developer_id) REFERENCES users(id)
);
```

#### **ai_agents**
```sql
CREATE TABLE ai_agents (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  config TEXT,
  status TEXT DEFAULT 'inactive',
  last_activity DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (developer_id) REFERENCES users(id)
);
```

#### **api_usage_logs**
```sql
CREATE TABLE api_usage_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  operation TEXT,
  duration_ms INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT 1,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **Additional Tables**

- `clients` - Client information
- `milestones` - Project milestones
- `subcontractors` - Subcontractor management
- `purchase_orders` - Purchase orders
- `daily_logs` - Daily site logs
- `photos` - Photo documentation
- `modules` - Installed modules
- `widgets` - Dashboard widgets
- `integrations` - Third-party integrations
- `automations` - Automation rules
- `notifications` - User notifications
- `audit_logs` - System audit logs
- `marketplace_apps` - Global marketplace apps
- `marketplace_purchases` - App purchases
- `collaboration_sessions` - Live collaboration sessions
- `collaboration_cursors` - Real-time cursors
- `collaboration_comments` - Code comments
- `subscription_history` - Subscription changes

---

## 🔐 Authentication & Authorization

### **Authentication Methods**
- JWT tokens (JSON Web Tokens)
- Session management
- Refresh tokens
- OAuth integration (planned)

### **User Roles**
1. **super_admin** - Platform administrator
2. **company_admin** - Company administrator
3. **project_manager** - Project manager
4. **developer** - SDK/API developer
5. **field_worker** - Field operations
6. **client** - Client view-only access

### **Middleware**
- `authenticateToken` - JWT verification
- `requireAuth` - Require authentication
- `requireDeveloper` - Require developer role
- `requireAdmin` - Require admin role
- `rateLimiter` - Rate limiting
- `errorHandler` - Global error handling

---

## 🤖 AI Integrations

### **Google Gemini AI**
- **Location:** `lib/ai/gemini-client.ts`
- **Features:**
  - Chat conversations
  - Code generation
  - Risk analysis
  - Document analysis
  - Image recognition

### **OpenAI (Optional)**
- GPT-4 integration
- Code completion
- Text analysis

### **AI Features**
1. **AI Chat Assistant**
   - Context-aware conversations
   - Project-specific knowledge
   - Multi-turn dialogues

2. **Code Generation**
   - Function generation
   - Component templates
   - API endpoint generation

3. **Smart Tools**
   - Risk detection
   - Safety analysis
   - Budget prediction
   - Schedule optimization

---

## 🚀 Deployment

### **Development**
```bash
npm run dev          # Frontend (Vite)
npm run server       # Backend (Express)
npm run dev:all      # Both servers
```

### **Production**
```bash
npm run build        # Build frontend
npm run start        # Start production server
```

### **Docker**
```bash
docker-compose up    # Start all services
```

### **Environment Variables**
```env
# API
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=./cortexbuild.db

# Supabase
VITE_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# AI
GEMINI_API_KEY=AIzaSyC...
OPENAI_API_KEY=sk-...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📦 Dependencies

### **Frontend**
- `react@19.2.0` - UI framework
- `typescript@5.7.3` - Type safety
- `vite@6.0.7` - Build tool
- `tanstack/react-query@5.90.2` - Data fetching
- `supabase-js@2.74.0` - Database client
- `lucide-react@0.468.0` - Icons
- `react-hot-toast@2.6.1` - Notifications

### **Backend**
- `express@5.0.1` - Web framework
- `better-sqlite3@11.8.1` - SQLite database
- `jsonwebtoken@9.0.2` - JWT auth
- `bcryptjs@2.4.3` - Password hashing
- `@google/generative-ai@0.24.1` - Gemini AI
- `ws@8.18.0` - WebSocket server
- `stripe@18.5.0` - Payments
- `joi@17.13.3` - Validation

### **Dev Tools**
- `jest@29.7.0` - Testing framework
- `eslint@9.19.0` - Linting
- `tsx@4.20.6` - TypeScript execution
- `concurrently@9.1.2` - Parallel commands

---

## 📊 Statistics

### **Code Metrics**
- **Total Lines of Code:** ~150,000+
- **TypeScript Files:** 2,000+
- **React Components:** 400+
- **API Endpoints:** 100+
- **Database Tables:** 40+
- **Test Files:** 50+

### **Features**
- **Dashboards:** 15+
- **User Roles:** 6
- **API Routes:** 34 modules
- **Screens:** 80+
- **AI Features:** 10+

---

## 🎨 UI/UX Features

### **Design System**
- Dark mode support
- Responsive design (mobile, tablet, desktop)
- Modern glassmorphism effects
- Smooth animations
- Accessible components

### **Key UI Components**
- Modal system
- Toast notifications
- Command palette
- Drag & drop
- Real-time updates
- Infinite scroll
- Virtual lists
- Chart visualizations

---

## 🔄 Real-Time Features

### **WebSocket Integration**
- Live collaboration
- Real-time cursors
- Live comments
- Presence indicators
- Instant notifications
- Live chat

### **Offline Support**
- Offline queue
- Sync on reconnect
- Optimistic updates
- Local caching

---

## 🧪 Testing

### **Test Coverage**
- Unit tests (Jest)
- Integration tests
- API tests
- Component tests
- E2E tests (Playwright)

### **Test Files**
- `__tests__/` directories
- `*.test.ts` files
- `*.test.tsx` files

---

## 📝 Documentation

### **Available Docs**
- API Documentation (`API_DOCUMENTATION.md`)
- Deployment Guide (`DEPLOYMENT_GUIDE.md`)
- Error Handling Guide (`ERROR_HANDLING_GUIDE.md`)
- Integration Guide (`INTEGRATION_GUIDE.md`)
- Phase 1 Complete (`PHASE_1_COMPLETE_SUCCESS.md`)
- Developer Console (`DEVELOPER_CONSOLE_FIX_SUMMARY.md`)

---

## 🎯 Next Steps & Roadmap

### **Phase 2 (Planned)**
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Video conferencing
- [ ] 3D model viewer
- [ ] Blockchain integration
- [ ] Advanced AI features

### **Enterprise Features**
- [ ] SSO (Single Sign-On)
- [ ] Advanced permissions
- [ ] White labeling
- [ ] Multi-region deployment
- [ ] Advanced reporting
- [ ] Compliance tools

---

## 🏆 Key Achievements

✅ **Fully functional multi-tenant platform**
✅ **15+ role-based dashboards**
✅ **34 backend API modules**
✅ **400+ React components**
✅ **Real-time collaboration**
✅ **AI-powered features**
✅ **Developer SDK platform**
✅ **Global marketplace**
✅ **Comprehensive testing**
✅ **Production-ready deployment**
✅ **Security vulnerabilities fixed**
✅ **TypeScript errors resolved**

---

## 💡 Quick Start

1. **Clone & Install**
```bash
cd /Users/admin/main/CortexBuild
npm install
```

2. **Setup Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. **Initialize Database**
```bash
npm run db:init
```

4. **Start Development**
```bash
npm run dev:all
```

5. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Developer Console: http://localhost:3000/developer

---

## 📞 Support

For issues or questions:
- Check existing documentation
- Review API documentation
- Check GitHub issues
- Contact: adrian@cortexbuild.com

---

**Last Updated:** November 5, 2025
**Version:** 2.0.0
**Status:** ✅ Production Ready


