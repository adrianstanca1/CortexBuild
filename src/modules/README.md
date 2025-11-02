# 🎯 CortexBuild Module System

## Overview

The CortexBuild Module System is a centralized, scalable architecture for managing application modules with:

- **Lazy Loading**: Modules load on-demand for optimal performance
- **Permission Control**: Role-based and permission-based access control
- **Centralized Registry**: Single source of truth for all modules
- **Type Safety**: Full TypeScript support
- **Easy Extension**: Simple API for adding new modules

---

## Architecture

```
src/modules/
├── ModuleRegistry.ts       # Core registry and module management
├── moduleDefinitions.ts    # All module definitions
├── initializeModules.ts    # Initialization logic
├── useModule.ts            # React hooks for modules
├── index.ts                # Public API exports
└── README.md               # This file
```

---

## Quick Start

### 1. Initialize Modules

Modules are automatically initialized in `App.tsx`:

```typescript
import { initializeModules } from './src/modules';

// Initialize on app load
initializeModules();
```

### 2. Use a Module

```typescript
import { useModule } from './src/modules';

function MyComponent() {
    const { component: ModuleComponent, loading, canAccess } = useModule(
        'ai-tools',
        { userRole: 'developer' }
    );

    if (loading) return <Loading />;
    if (!canAccess) return <AccessDenied />;
    if (!ModuleComponent) return <NotFound />;

    return <ModuleComponent />;
}
```

### 3. Get Module Component

```typescript
import { ModuleRegistry } from './src/modules';

// Get lazy component
const Component = ModuleRegistry.getLazyComponent('developer-dashboard');

// Load module eagerly
const Component = await ModuleRegistry.loadModule('developer-dashboard');
```

---

## Module Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `core` | Essential application features | Dashboard, Projects, Tasks |
| `ai` | AI-powered tools | AI Tools, Construction Oracle |
| `developer` | Developer tools | SDK Workspace, Automation Studio |
| `admin` | Administration | Super Admin, Platform Admin |
| `company` | Company management | Company Dashboard |
| `project` | Project-specific | RFIs, Documents, Time Tracking |
| `financial` | Financial tools | Accounting, Financial Management |
| `operations` | Operations tools | Project Operations |
| `marketplace` | Marketplace features | Global Marketplace, My Apps |
| `tools` | Utility tools | ML Analytics, Placeholders |

---

## Creating a New Module

### Step 1: Define the Module

Add to `moduleDefinitions.ts`:

```typescript
import { createPublicModule, createRoleModule } from './ModuleRegistry';

// Public module (accessible to all)
export const myModule = createPublicModule(
    'my-module',
    {
        id: 'custom.my-module',
        name: 'My Module',
        description: 'Description of my module',
        version: '1.0.0',
        category: 'tools',
        tags: ['custom', 'tool']
    },
    () => import('../components/MyModule')
);

// Role-restricted module
export const adminModule = createRoleModule(
    'admin-module',
    {
        id: 'admin.my-module',
        name: 'Admin Module',
        description: 'Admin-only module',
        version: '1.0.0',
        category: 'admin',
        tags: ['admin']
    },
    () => import('../components/AdminModule'),
    ['super_admin', 'company_admin']
);
```

### Step 2: Add to Module List

```typescript
export const customModules: ModuleConfig[] = [
    myModule,
    adminModule,
];

export const allModules: ModuleConfig[] = [
    ...coreModules,
    ...customModules, // Add here
];
```

### Step 3: Add Screen Type

In `types.ts`:

```typescript
export type Screen =
    | 'my-module'
    | 'admin-module'
    | ... // existing screens
```

---

## Permission System

### Role-Based Access

```typescript
createRoleModule(
    'developer-console',
    metadata,
    component,
    ['developer', 'super_admin'] // Only these roles can access
);
```

### Permission-Based Access

```typescript
createModule({
    screen: 'financial-reports',
    metadata: { ... },
    permissions: {
        requiredRole: ['company_admin'],
        requiredPermissions: ['finance:read', 'reports:generate']
    },
    component: () => import('./FinancialReports')
});
```

### Context Requirements

```typescript
createModule({
    screen: 'project-tasks',
    metadata: { ... },
    permissions: {
        requiresProjectContext: true, // Needs active project
        requiresCompanyContext: true  // Needs company context
    },
    component: () => import('./ProjectTasks')
});
```

---

## React Hooks

### useModule

Load and access a single module:

```typescript
const {
    module,      // Module configuration
    component,   // React component
    loading,     // Loading state
    error,       // Error if any
    canAccess,   // Permission check
    isLoaded     // Already loaded?
} = useModule('ai-tools', {
    userRole: 'developer',
    permissions: ['ai:use'],
    preload: true
});
```

### useModulesForRole

Get all modules for a role:

```typescript
const modules = useModulesForRole('developer');
// Returns: [developer-dashboard, sdk-developer, ...]
```

### useModulesByCategory

Get modules by category:

```typescript
const aiModules = useModulesByCategory('ai');
// Returns: [ai-tools, construction-oracle, ...]
```

### useModuleStats

Get module statistics:

```typescript
const stats = useModuleStats();
// {
//   total: 45,
//   loaded: 12,
//   preloadQueue: 3,
//   byCategory: { core: 10, ai: 5, ... }
// }
```

---

## Module Registry API

### Register Modules

```typescript
ModuleRegistry.register(moduleConfig);
ModuleRegistry.registerBatch([module1, module2, ...]);
```

### Get Modules

```typescript
ModuleRegistry.getModule('ai-tools');
ModuleRegistry.getAllModules();
ModuleRegistry.getModulesByCategory('developer');
ModuleRegistry.getModulesForRole('super_admin');
```

### Load Modules

```typescript
// Lazy component
const Component = ModuleRegistry.getLazyComponent('ai-tools');

// Eager load
const Component = await ModuleRegistry.loadModule('ai-tools');

// Preload critical modules
await ModuleRegistry.preloadModules();
```

### Check Access

```typescript
const canAccess = ModuleRegistry.canAccessModule(
    'developer-console',
    'developer',
    ['dev:read', 'dev:write']
);
```

---

## Best Practices

1. **Use Lazy Loading**: Always use lazy imports for better performance
2. **Set Permissions**: Define clear role and permission requirements
3. **Add Metadata**: Provide complete metadata for better discoverability
4. **Use Categories**: Organize modules by category
5. **Add Tags**: Use tags for search and filtering
6. **Preload Critical**: Mark critical modules for preloading
7. **Handle Errors**: Always handle loading errors gracefully
8. **Check Access**: Verify permissions before rendering

---

## Examples

### Example 1: Simple Public Module

```typescript
createPublicModule(
    'my-tool',
    {
        id: 'tools.my-tool',
        name: 'My Tool',
        description: 'A simple tool',
        version: '1.0.0',
        category: 'tools'
    },
    () => import('./MyTool')
);
```

### Example 2: Admin-Only Module

```typescript
createRoleModule(
    'admin-panel',
    {
        id: 'admin.panel',
        name: 'Admin Panel',
        description: 'Administration panel',
        version: '1.0.0',
        category: 'admin'
    },
    () => import('./AdminPanel'),
    ['super_admin']
);
```

### Example 3: Complex Module with Dependencies

```typescript
createModule({
    screen: 'advanced-analytics',
    metadata: {
        id: 'analytics.advanced',
        name: 'Advanced Analytics',
        description: 'ML-powered analytics',
        version: '2.0.0',
        category: 'ai',
        tags: ['ml', 'analytics', 'ai']
    },
    permissions: {
        requiredRole: ['company_admin', 'super_admin'],
        requiredPermissions: ['analytics:read', 'ml:use']
    },
    component: () => import('./AdvancedAnalytics'),
    preload: true,
    dependencies: ['ai-tools', 'ml-analytics']
});
```

---

## Troubleshooting

### Module Not Found

```typescript
// Check if module is registered
const module = ModuleRegistry.getModule('my-module');
if (!module) {
    console.error('Module not registered');
}
```

### Access Denied

```typescript
// Check permissions
const canAccess = ModuleRegistry.canAccessModule(
    'my-module',
    userRole,
    userPermissions
);
```

### Loading Errors

```typescript
const { error } = useModule('my-module');
if (error) {
    console.error('Failed to load module:', error);
}
```

---

## 🚀 Module System is Production Ready!

All modules are registered, lazy-loaded, and permission-controlled for optimal performance and security.

