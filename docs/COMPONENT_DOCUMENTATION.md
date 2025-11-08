# CortexBuild Component Documentation

## Overview

This document provides comprehensive documentation for all React components in the CortexBuild platform, including usage examples, props, and integration patterns.

---

## Table of Contents

1. [Core Components](#core-components)
2. [Dashboard Components](#dashboard-components)
3. [UI Components](#ui-components)
4. [Lazy Loading Components](#lazy-loading-components)
5. [Admin Components](#admin-components)

---

## Core Components

### App Component

**Location:** `App.tsx`

**Purpose:** Main application component that handles routing, authentication, and navigation.

**Features:**
- Session management
- Role-based routing
- Service Worker registration
- User authentication flow

**Usage:**
```typescript
import App from './App';

// App is the root component
ReactDOM.render(<App />, document.getElementById('root'));
```

**Key Props:** None (root component)

**State Management:**
- `currentUser` - Current authenticated user
- `currentScreen` - Active screen/module
- `navigationStack` - Navigation history

---

## Dashboard Components

### UnifiedAdminDashboard

**Location:** `components/screens/admin/UnifiedAdminDashboard.tsx`

**Purpose:** Platform-wide admin dashboard for super admins.

**Features:**
- System-wide metrics
- User management
- Company management
- Payment tracking
- Real-time subscriptions

**Props:**
```typescript
interface UnifiedAdminDashboardProps {
  currentUser: User;
  isDarkMode?: boolean;
}
```

**Usage:**
```typescript
import UnifiedAdminDashboard from './screens/admin/UnifiedAdminDashboard';

<UnifiedAdminDashboard 
  currentUser={user}
  isDarkMode={true}
/>
```

**Key Features:**
- Real-time data updates via Supabase subscriptions
- Platform metrics and analytics
- User and company management
- Payment and billing overview

---

### CompanyAdminDashboardNew

**Location:** `components/screens/dashboards/CompanyAdminDashboardNew.tsx`

**Purpose:** Company-level admin dashboard for company admins.

**Features:**
- Company metrics
- Team management
- Project overview
- Billing and subscription

**Props:**
```typescript
interface CompanyAdminDashboardProps {
  currentUser: User;
  companyId: string;
  isDarkMode?: boolean;
}
```

**Usage:**
```typescript
import CompanyAdminDashboardNew from './screens/dashboards/CompanyAdminDashboardNew';

<CompanyAdminDashboardNew 
  currentUser={user}
  companyId={user.company_id}
  isDarkMode={true}
/>
```

---

### EnhancedDashboard

**Location:** `components/dashboard/EnhancedDashboard.tsx`

**Purpose:** Operational dashboard for day-to-day work.

**Features:**
- Task management
- Project overview
- Performance charts
- Quick actions

**Props:**
```typescript
interface EnhancedDashboardProps {
  currentUser: User;
  isDarkMode?: boolean;
}
```

**Usage:**
```typescript
import EnhancedDashboard from './dashboard/EnhancedDashboard';

<EnhancedDashboard 
  currentUser={user}
  isDarkMode={false}
/>
```

**Lazy Loading:**
```typescript
<LazyComponentWrapper isDarkMode={false} showSkeleton={true}>
  <PerformanceCharts />
</LazyComponentWrapper>
```

---

## UI Components

### LazyImage

**Location:** `components/ui/LazyImage.tsx`

**Purpose:** Lazy-loaded image component with blur-up effect and WebP support.

**Features:**
- Native lazy loading
- IntersectionObserver fallback
- WebP format support
- Blur-up effect
- Error handling

**Props:**
```typescript
interface LazyImageProps {
  src: string;
  srcWebP?: string;
  alt: string;
  placeholder?: string;
  blurUp?: boolean;
  containerClassName?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}
```

**Usage:**
```typescript
import { LazyImage } from './ui/LazyImage';

<LazyImage
  src="/images/photo.jpg"
  srcWebP="/images/photo.webp"
  alt="Photo description"
  placeholder="data:image/svg+xml,%3Csvg..."
  blurUp={true}
  className="w-full h-48 object-cover"
  containerClassName="w-full h-48"
/>
```

**Performance Benefits:**
- Images load only when visible
- WebP reduces file size by 25-35%
- Blur-up improves perceived performance
- Better performance on slow networks

---

### LazyComponentWrapper

**Location:** `components/layout/LazyComponentWrapper.tsx`

**Purpose:** Wrapper component for lazy loading heavy components with error handling.

**Features:**
- Suspense boundary
- Skeleton loader
- Error boundary
- Loading states

**Props:**
```typescript
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
  showSkeleton?: boolean;
  skeletonHeight?: string;
}
```

**Usage:**
```typescript
import { LazyComponentWrapper } from './layout/LazyComponentWrapper';

<LazyComponentWrapper 
  isDarkMode={true} 
  showSkeleton={true}
  skeletonHeight="h-96"
>
  <HeavyComponent />
</LazyComponentWrapper>
```

**Error Handling:**
- Catches component errors
- Shows fallback UI
- Logs errors for debugging

---

## Lazy Loading Components

### PhotoGalleryScreen

**Location:** `components/screens/PhotoGalleryScreen.tsx`

**Lazy Loading Integration:**
```typescript
<LazyImage
  src={photo.url.replace('/800/600', '/400/300')}
  alt={`Site photo ${photo.id}`}
  placeholder="data:image/svg+xml,%3Csvg..."
  blurUp={true}
  className="w-full h-48 object-cover"
/>
```

---

### TaskDetailScreen

**Location:** `components/screens/TaskDetailScreen.tsx`

**Lazy Loading Integration:**
```typescript
{attachment && (
  <LazyImage
    src={attachment.url}
    alt={attachment.name}
    placeholder="data:image/svg+xml,%3Csvg..."
    className="w-full rounded-lg"
  />
)}
```

---

### SuperAdminDashboard

**Location:** `components/screens/dashboards/SuperAdminDashboard.tsx`

**Lazy Loading Integration:**
```typescript
{userAvatar && (
  <LazyImage
    src={userAvatar}
    alt="User avatar"
    placeholder="data:image/svg+xml,%3Csvg..."
    className="w-12 h-12 rounded-full"
    containerClassName="w-12 h-12"
  />
)}
```

---

## Admin Components

### UserManagement

**Location:** `components/admin/UserManagement.tsx`

**Purpose:** Complete CRUD operations for users.

**Features:**
- Create users
- Edit user details
- Delete users
- Role management
- Status management

**Props:**
```typescript
interface UserManagementProps {
  currentUser: User;
}
```

**Usage:**
```typescript
import UserManagement from './admin/UserManagement';

<UserManagement currentUser={user} />
```

---

### CompanyManagement

**Location:** `components/admin/CompanyManagement.tsx`

**Purpose:** Complete CRUD operations for companies.

**Features:**
- Create companies
- Edit company details
- Delete companies
- Subscription management
- Billing overview

**Props:**
```typescript
interface CompanyManagementProps {
  currentUser: User;
}
```

---

### DatabaseCapabilityManager

**Location:** `components/admin/DatabaseCapabilityManager.tsx`

**Purpose:** Manage database quotas and capabilities.

**Features:**
- Database statistics
- Company quotas
- User quotas
- Storage management

**Props:**
```typescript
interface DatabaseCapabilityManagerProps {
  isDarkMode?: boolean;
}
```

---

## Component Integration Patterns

### Using Lazy Loading

```typescript
// Wrap heavy components
<LazyComponentWrapper isDarkMode={true} showSkeleton={true}>
  <AnalyticsDashboard />
</LazyComponentWrapper>

// Use LazyImage for images
<LazyImage
  src={imageUrl}
  srcWebP={webpUrl}
  alt="Description"
  placeholder={placeholderSvg}
  blurUp={true}
/>
```

### Error Handling

```typescript
<LazyComponentWrapper isDarkMode={true}>
  <ComponentThatMightError />
</LazyComponentWrapper>
```

### Dark Mode Support

```typescript
<Component isDarkMode={isDarkMode} />
```

---

## Performance Optimization

### Code Splitting

Components are automatically code-split using React.lazy():

```typescript
const HeavyComponent = React.lazy(() => 
  import('./HeavyComponent')
);

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

### Bundle Size

- Main bundle: 88.44 KB (gzip: 24.28 KB)
- Lazy-loaded chunks: 1-50 KB each
- Total gzipped: ~570 KB

---

## Next Steps

- See [API Documentation](./API_DOCUMENTATION.md) for backend endpoints
- See [Architecture Documentation](./ARCHITECTURE.md) for system design
- See [Deployment Guide](./DEPLOYMENT.md) for production setup

