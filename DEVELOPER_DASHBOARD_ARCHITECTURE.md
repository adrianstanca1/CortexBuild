# Developer Dashboard Architecture

## Overview
CortexBuild features a comprehensive, role-based dashboard system with three distinct dashboard types, each optimized for specific user roles and workflows. This document describes the Developer Dashboard architecture and how it differs from Super Admin and Company Admin dashboards.

## User Roles & Dashboard Mapping

### 1. Super Admin Dashboard (`super_admin`)
**File**: `components/screens/admin/SuperAdminDashboardScreen.tsx`

**Purpose**: Platform-wide oversight and control across all companies and tenants.

**Key Features**:
- Cross-tenant analytics and metrics
- Platform health monitoring
- Company management and provisioning
- Global user administration
- System-wide SDK/API usage statistics
- Platform configuration and settings

**Access**: Users with `super_admin` role on any company
**Credentials**: adrian.stanca1@gmail.com / parola123 (Company 1)

---

### 2. Company Admin Dashboard (`company_admin`)
**File**: `components/dashboard/EnhancedDashboard.tsx`

**Purpose**: Company-specific management for business owners and administrators.

**Key Features**:
- Company-scoped project pipeline
- Financial KPIs and budget tracking
- Team management and workforce analytics
- Client relationship management
- Invoice and payment tracking
- Compliance and safety dashboards
- Company-wide reporting

**Access**: Users with `company_admin` or `Accounting Clerk` roles
**Credentials**: adrian@ascladdingltd.co.uk / Lolozania1 (Company 2)

---

### 3. Developer Dashboard (`developer`)
**File**: `components/screens/developer/DeveloperDashboardScreen.tsx`

**Purpose**: SDK platform for building AI-powered apps, workflows, and automation.

**Key Features**:
- SDK App Development
- Workflow Automation Builder
- Sandbox Execution Environment
- Webhook Management
- AI Agent Orchestration
- API Usage Analytics
- Builder Module System
- Automation Studio Integration

**Access**: Users with `developer` role
**Credentials**: dev@constructco.com / parola123 (Company 1)

---

## Developer Dashboard Deep Dive

### Architecture Components

#### 1. **Hero Section** (Lines 1215-1290)
```tsx
<section className="relative overflow-hidden rounded-3xl border bg-slate-900 text-white">
```
- **Purpose**: Command center header with mission statement
- **Features**:
  - Quick launch buttons (SDK Workspace, Sandbox Simulation, Marketplace)
  - Capability indicators (role access, sandbox quota, app/workflow slots)
  - Tenant scope and workspace owner information
  - Refresh controls for live metrics

#### 2. **Impact Snapshot Cards** (Lines 1290-1400)
```tsx
<div className="mt-6 grid gap-4 sm:grid-cols-2">
```
- **Metrics**:
  - SDK Applications (total, active, pending review)
  - Automation Pipelines (total workflows, active count)
  - Integration Webhooks (active webhooks, delivery success rate)
  - AI Agents (deployed agents, execution count)

#### 3. **Quick Actions Panel** (Lines 1470-1530)
```tsx
<Card className="p-6 space-y-4">
  <h3>Quick Actions</h3>
```
- **Actions**:
  - Run Sandbox Test (with quota tracking)
  - Open Builder Studio
  - Manage API Keys
  - View Documentation

#### 4. **Sandbox Workflow Presets** (Lines 1526-1610)
```tsx
<Card className="p-6 space-y-4">
  <h3>Sandbox-ready workflow presets</h3>
```
- **Purpose**: Pre-configured workflow scenarios for instant testing
- **Features**:
  - Demo workflow presets (RFI processing, safety checks, budget alerts)
  - One-click sandbox execution
  - Console command copying
  - Expected result summaries

#### 5. **SDK App Orchestrator** (Lines 1620-1690)
```tsx
<Card className="p-6 space-y-4">
  <h3>Sandbox orchestrator apps</h3>
```
- **Purpose**: Demo apps that prepare sandbox environment
- **Presets**: 4 orchestrator apps with launch/copy commands
- **Integration**: Direct sandbox execution with payload injection

#### 6. **System Analytics** (Lines 1691-1780)
```tsx
<Card className="p-6 space-y-4">
  <h3>System Analytics</h3>
```
- **Metrics**:
  - Peak usage hour detection
  - API call trends (7-day moving average)
  - Error rate tracking
  - Most active endpoints
  - Token consumption stats
  - Cost monitoring per provider

#### 7. **Activity Feed** (Lines 1780-1900)
```tsx
<Card className="p-6 space-y-4">
  <h3>Recent Developer Activity</h3>
```
- **Events**:
  - Sandbox runs with results
  - Builder module saves
  - Module publications
  - Database queries
  - Agent executions
- **Format**: Real-time event stream with timestamps and payload details

#### 8. **Builder Modules Library** (Lines 1900-2000)
```tsx
<Card className="p-6 space-y-4">
  <h3>Your Builder Modules</h3>
```
- **Purpose**: Visual builder for creating automation flows
- **Features**:
  - Drag-and-drop node editor
  - Module versioning and publishing
  - Sandbox testing integration
  - Template library

#### 9. **Builder Module Editor** (Lines 2000-2090)
```tsx
<Card className="p-6 space-y-4">
  <h3>Builder Module Editor</h3>
```
- **Components**:
  - Name, description, version metadata
  - Node sequence builder (trigger → action → condition)
  - Configuration editor (JSON format)
  - Test payload input
  - Save and sandbox run controls

#### 10. **Developer Sandbox** (Lines 2090-2180)
```tsx
<Card className="p-6 space-y-4 xl:col-span-2">
  <h3>Developer Sandbox</h3>
```
- **Purpose**: Isolated execution environment for testing
- **Pillars**:
  - Isolated Testing (no production impact)
  - Instant Feedback (real-time logs)
  - API Mocking (simulate external services)
- **Controls**: Run simulation, view logs, check quota

#### 11. **Community Marketplace** (Lines 2180-2260)
```tsx
<Card className="p-6 space-y-4">
  <h3>Marketplace Launchpad</h3>
```
- **Purpose**: Browse and clone community-built modules
- **Features**:
  - Module catalog (20+ available)
  - Clone to sandbox
  - Version and status indicators
  - Marketplace navigation link

#### 12. **Application Management** (Lines 2260-2320)
```tsx
<Card className="p-6 xl:col-span-2">
  <h3>Your SDK Applications</h3>
```
- **Status Tracking**:
  - Draft (development in progress)
  - Pending Review (submitted for approval)
  - Approved (production-ready)
  - Rejected (needs revision)
- **Actions**: Edit, publish, test in sandbox

#### 13. **Workflow Management** (Lines 2320-2390)
```tsx
<Card className="p-6 xl:col-span-1">
  <h3>Operational Workflows</h3>
```
- **Purpose**: Automation pipeline management
- **Features**:
  - Active/inactive toggle
  - Workflow configuration
  - Execution history
  - Enable/disable controls

#### 14. **Sandbox Run History** (Lines 2390-2480)
```tsx
<Card className="p-6 space-y-4">
  <h3>Sandbox Run History</h3>
```
- **Details**:
  - Execution logs
  - Performance metrics (duration, status)
  - Input/output payload inspection
  - Result visualization

#### 15. **Automation Studio** (Lines 2490-2524)
```tsx
{selectedTab === 'automation' && (
  <AutomationStudioDashboard />
)}
```
- **Purpose**: Advanced visual workflow builder
- **Features**:
  - Drag-and-drop canvas
  - Logic branching
  - Trigger configuration
  - Deployment controls

---

## Developer Capabilities & Quotas

### Role-Based Limits
The developer dashboard respects capability limits defined in `server/utils/capabilities.ts`:

```typescript
interface DeveloperCapabilities {
  role: string;
  maxSandboxRunsPerDay: number;      // -1 = unlimited
  maxActiveApps: number;             // -1 = unlimited
  maxActiveWorkflows: number;        // -1 = unlimited
  canPublishModules: boolean;
  usage: {
    sandboxRunsToday: number;
    runsRemaining: number;
    runsLimit: number;
  };
}
```

### Capability Indicators
Displayed in hero section:
- `{role}` Access badge
- Sandbox simulation quota (e.g., "5 of 10 simulations remaining today")
- App slots (e.g., "App slots 3/10")
- Workflow slots (e.g., "Workflows 2/5")

### Quota Enforcement
- Sandbox run button disabled when quota reached
- Publish button hidden when `canPublishModules = false`
- App/workflow creation blocked at limit

---

## API Integration

### Primary Endpoints

#### Dashboard Summary
```typescript
GET /developer/dashboard/summary
Response: {
  success: true,
  profile: SdkProfile,
  apps: SdkApp[],
  workflows: SdkWorkflow[],
  webhooks: WebhookEntry[],
  usageSummary: UsageSummary[],
  agents: AgentEntry[],
  stats: SummaryStats,
  sandboxRuns: SandboxRun[],
  builderModules: BuilderModule[],
  capabilities: DeveloperCapabilities
}
```

#### Sandbox Execution
```typescript
POST /developer/sandbox/run
Body: {
  appId?: string,
  name?: string,
  definition?: object,
  payload?: object
}
Response: {
  success: true,
  result: object,
  runId: string,
  duration: number
}
```

#### Builder Module Operations
```typescript
POST /developer/builder/save
Body: {
  id?: string,
  name: string,
  description: string,
  version: string,
  manifest: { nodes, connections, metadata },
  testPayload: object
}
```

#### Community Modules
```typescript
GET /developer/community/modules
Response: {
  success: true,
  modules: CommunityModule[]
}
```

---

## Comparison Matrix

| Feature | Super Admin | Company Admin | Developer |
|---------|------------|---------------|-----------|
| **Scope** | All companies | Single company | Single company (dev tools) |
| **Primary Use** | Platform management | Business operations | SDK development |
| **Project Access** | All projects (read-only) | Company projects | N/A (no project management) |
| **Financial Tools** | Platform billing | Invoices, budgets, expenses | N/A |
| **Team Management** | All users | Company users | N/A |
| **SDK Platform** | Usage monitoring | N/A | Full access (apps, workflows, sandbox) |
| **AI Agents** | Global agent oversight | N/A | Agent development & deployment |
| **Webhooks** | Platform-wide logs | N/A | Webhook creation & testing |
| **Sandbox** | N/A | N/A | Isolated execution environment |
| **Analytics** | Cross-tenant metrics | Company KPIs | API usage, sandbox runs, module performance |

---

## Developer Workflow Example

### 1. Create New SDK App
1. Log in as developer (`dev@constructco.com / parola123`)
2. Navigate to Developer Dashboard
3. Click "Launch SDK Workspace"
4. Use AI App Builder to generate code
5. Test in sandbox environment
6. Publish to marketplace

### 2. Build Automation Workflow
1. Open Builder Module Editor
2. Add nodes: Trigger → Action → Condition
3. Configure each node with JSON config
4. Set test payload
5. Click "Run in Sandbox" to validate
6. Save module and deploy

### 3. Monitor API Usage
1. View "System Analytics" card
2. Check peak usage hour
3. Review API call trends (7-day chart)
4. Monitor error rates by endpoint
5. Track token consumption and costs

---

## Technical Implementation

### Component Structure
```
components/screens/developer/
  ├── DeveloperDashboardScreen.tsx    (2524 lines - main dashboard)
  └── demoData.ts                      (demo presets and mock data)

components/screens/dashboards/
  └── DeveloperDashboard.tsx           (wrapper component)

components/automation/
  └── AutomationStudioDashboard.tsx    (visual workflow builder)
```

### State Management
```typescript
const DeveloperDashboardScreen: React.FC = ({ currentUser, navigateTo }) => {
  // Profile & Apps
  const [profile, setProfile] = useState<SdkProfile | null>(null);
  const [apps, setApps] = useState<SdkApp[]>([]);
  const [workflows, setWorkflows] = useState<SdkWorkflow[]>([]);
  
  // Sandbox
  const [sandboxResult, setSandboxResult] = useState<unknown>(null);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  
  // Builder
  const [builderModules, setBuilderModules] = useState<BuilderModule[]>([]);
  const [builderEditor, setBuilderEditor] = useState<BuilderEditorState>({...});
  
  // Analytics
  const [usage, setUsage] = useState<UsageSummary[]>([]);
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [capabilities, setCapabilities] = useState<DeveloperCapabilities | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
};
```

### Key Functions
```typescript
// Data Loading
loadDashboardData(): Promise<void>
loadCommunityModules(): Promise<void>
loadDeveloperInsights(): Promise<void>

// Sandbox Operations
handleSandboxRun(options?: SandboxRunOptions): Promise<void>
handleRunDemoWorkflowPreset(preset: DemoWorkflowPreset): Promise<void>

// Builder Operations
handleSaveBuilderModule(): Promise<void>
handleRunCurrentBuilder(): Promise<void>
handleEditModule(module: BuilderModule): void

// Publish Operations
handlePublishApp(appId: string): Promise<void>
handlePublishBuilderModule(moduleId: string): Promise<void>
```

---

## Routing Configuration

### UnifiedDashboardScreen.tsx
```typescript
switch (currentUser.role) {
  case 'super_admin':
    return <SuperAdminDashboardScreen />;
  
  case 'developer':
    return <DeveloperDashboard currentUser={currentUser} navigateTo={navigateTo} />;
  
  case 'company_admin':
  case 'Accounting Clerk':
    return <EnhancedDashboard />;
  
  case 'Project Manager':
    return <ProjectManagerDashboard currentUser={currentUser} navigateTo={navigateTo} />;
  
  // ... other roles
}
```

### Navigation Flow
```
App.tsx
  └─ Screen: 'dashboard'
      └─ UnifiedDashboardScreen
          ├─ Role: 'super_admin' → SuperAdminDashboardScreen
          ├─ Role: 'developer' → DeveloperDashboard → DeveloperDashboardScreen
          ├─ Role: 'company_admin' → EnhancedDashboard
          └─ Role: 'Project Manager' → ProjectManagerDashboard
```

---

## Security & Isolation

### Tenant Isolation
- All API calls filtered by `company_id` from JWT token
- Developer can only access their company's SDK resources
- Sandbox runs isolated to company context

### Capability Validation
- Frontend: UI elements hidden/disabled based on capabilities
- Backend: Middleware enforces role-based limits
- Sandbox: Daily run quota enforced at API level

### API Key Management
- Keys hashed with bcrypt before storage
- Key prefixes used for identification
- Scopes control access to specific endpoints

---

## Demo Data & Presets

### Demo Workflow Presets (4 scenarios)
1. **Morning RFI Digest** - Aggregate overnight RFIs and notify PMs
2. **Safety Alert Escalation** - Detect critical incidents and escalate
3. **Budget Overrun Detection** - Monitor project spend and alert
4. **Inspection Scheduler** - Auto-schedule inspections based on progress

### Demo SDK Apps (4 orchestrators)
1. **Sandbox Environment Bootstrapper** - Initialize test data
2. **Mock API Gateway** - Simulate external service responses
3. **Event Stream Replayer** - Replay historical webhook events
4. **Database Snapshot Manager** - Create/restore sandbox snapshots

### Community Modules (20+ available)
- RFI Auto-Responder AI Agent
- Safety Incident Predictor ML Model
- QuickBooks Integration Sync
- Daily Report Generator
- Cost Overrun Detector

---

## Performance Optimizations

### Lazy Loading
```typescript
// Demo data only loaded on first access
const demoWorkflowPresets = useMemo(() => DEMO_WORKFLOW_PRESETS.slice(0, 4), []);
```

### Memoized Calculations
```typescript
const capabilitySummary = useMemo(() => {
  if (!capabilities) return null;
  const runsLimit = capabilities.maxSandboxRunsPerDay ?? -1;
  const runsUsed = capabilities.usage?.sandboxRunsToday ?? 0;
  return {
    role: capabilities.role ?? currentUser.role,
    runsRemaining: runsLimit < 0 ? Infinity : Math.max(runsLimit - runsUsed, 0),
    // ...
  };
}, [capabilities, currentUser.role]);
```

### Debounced Refresh
```typescript
const handleRefresh = async () => {
  setRefreshing(true);
  await loadDashboardData(false);
  setRefreshing(false);
  toast.success('Developer insights refreshed');
};
```

---

## Future Enhancements

### Planned Features
1. **Live Sandbox Monitoring** - Real-time log streaming during execution
2. **Collaborative Builder** - Multi-developer workflow editing
3. **Version Control** - Git-like version management for modules
4. **A/B Testing** - Deploy multiple workflow variants
5. **Advanced Analytics** - Custom dashboards with Grafana integration
6. **Marketplace Ratings** - Community feedback on modules
7. **CI/CD Pipeline** - Automated testing and deployment
8. **Observability** - Distributed tracing with OpenTelemetry

### Under Consideration
- GraphQL API for advanced querying
- WebSocket-based real-time updates
- Mobile developer app for on-the-go testing
- AI-powered code suggestions in builder
- Enterprise SSO integration

---

## Troubleshooting

### Common Issues

#### 1. Sandbox Quota Reached
**Symptom**: "Daily sandbox run limit reached for your role" error

**Solution**:
- Check capability indicators in hero section
- Contact super admin to increase quota
- Wait until next day (quota resets at midnight UTC)

#### 2. Module Won't Publish
**Symptom**: Publish button disabled or grayed out

**Causes**:
- `canPublishModules = false` in capabilities
- App status not in 'approved' state
- Missing required fields (name, description, version)

**Solution**:
- Verify role has publish permissions
- Submit app for review first
- Complete all required metadata

#### 3. Webhook Delivery Failures
**Symptom**: High failure count in webhook stats

**Causes**:
- Invalid webhook URL
- Signature verification failure
- Target server timeout

**Solution**:
- Verify URL is accessible
- Check webhook secret matches
- Review webhook logs for error details

#### 4. Sandbox Runs Fail
**Symptom**: Sandbox execution returns error

**Causes**:
- Invalid JSON in test payload
- Missing required node configuration
- Capability limits exceeded

**Solution**:
- Validate JSON syntax
- Review node config schema
- Check sandbox quota

---

## Conclusion

The Developer Dashboard is the most feature-rich dashboard in CortexBuild, providing developers with comprehensive tools for building, testing, and deploying SDK applications, workflows, and AI agents. Its modular architecture, combined with robust capability management and real-time analytics, makes it a powerful platform for construction tech innovation.

For additional support, refer to:
- **SDK Documentation**: `/api/docs`
- **API Reference**: `API_DOCUMENTATION.md`
- **Developer Guide**: `SDK_DEVELOPER_CAPABILITIES.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`
