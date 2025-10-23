# Unified Admin Dashboard - Documentation

## Overview

The **Unified Admin Dashboard** is a comprehensive administrative control panel that merges and enhances functionality from both the Super Admin Dashboard and Platform Admin screens. It provides a single, powerful interface for platform-wide management and monitoring.

## Features

### 1. **Real-time Platform Metrics**
- Total users and active users count
- Company statistics (total and active)
- Monthly and total revenue tracking
- Active projects monitoring
- System health status (healthy/warning/critical)
- Platform uptime percentage

### 2. **System Health Monitoring**
- Real-time health status indicator
- Uptime tracking
- Active users vs total users ratio
- Active companies vs total companies ratio
- Average response time monitoring
- Overall health score with visual progress bar

### 3. **Recent Activity Feed**
- User registration events
- Company creation events
- Payment received notifications
- Project creation tracking
- System alerts
- Timestamp formatting (relative time)
- Severity indicators (info/warning/error)

### 4. **Tabbed Navigation**
The dashboard includes six main tabs:

#### **Overview Tab**
- Platform metrics grid (4 key metrics)
- System health card
- Recent activity feed
- Quick navigation to detailed sections

#### **Users Tab**
- Complete user management (CRUD operations)
- User search and filtering
- Role management (super_admin, company_admin, developer, user)
- Status management (active, inactive, suspended)
- Password management with SHA-256 hashing

#### **Companies Tab**
- Company management (CRUD operations)
- Subscription plan management
- Industry categorization
- User count per company
- Company status tracking

#### **Billing Tab**
- Subscription management
- Invoice generation and tracking
- Payment recording
- Payment-to-invoice linking
- Status filtering

#### **Analytics Tab**
- System-wide analytics
- Revenue analytics
- Project analytics
- User growth tracking
- Date range filtering
- Trend calculations

#### **Settings Tab**
- Platform configuration (coming soon)
- System settings management

## Access Control

**Required Role**: `super_admin`

Users without super admin privileges will see an access denied screen with:
- Clear error message
- Shield icon indicator
- Return to dashboard button

## Technical Implementation

### Component Structure

```typescript
UnifiedAdminDashboard
├── Header
│   ├── Navigation breadcrumb
│   ├── Search bar
│   ├── Refresh button
│   ├── Notifications bell
│   └── User badge (Super Admin)
├── Tab Navigation
│   ├── Overview
│   ├── Users
│   ├── Companies
│   ├── Billing
│   ├── Analytics
│   └── Settings
└── Tab Content
    ├── MetricCard (reusable)
    ├── SystemHealthCard
    ├── RecentActivityCard
    └── Management Components
```

### Key Components

#### **MetricCard**
Reusable component for displaying key metrics:
- Title and value
- Subtitle for additional context
- Icon with gradient background
- Trend indicator (optional)
- Click handler for navigation
- Color variants: blue, purple, green, orange, red

#### **SystemHealthCard**
Real-time system health monitoring:
- Health status badge (healthy/warning/critical)
- Uptime percentage
- Active users ratio
- Active companies ratio
- Average response time
- Health score progress bar

#### **RecentActivityCard**
Activity feed with:
- Activity type icons
- Severity-based coloring
- Relative timestamp formatting
- Hover effects
- Empty state handling

### Data Flow

1. **Initial Load**
   - Component mounts
   - `loadPlatformMetrics()` fetches all data in parallel
   - `loadRecentActivity()` fetches recent events
   - State updates trigger re-render

2. **Refresh**
   - User clicks refresh button
   - Both data loading functions called
   - Loading state shown during fetch
   - Success toast on completion

3. **Tab Navigation**
   - User clicks tab
   - Active tab state updates
   - Corresponding content component renders
   - Sub-components manage their own data

### Supabase Integration

The dashboard queries multiple Supabase tables:
- `users` - User data and statistics
- `companies` - Company information
- `projects` - Project data
- `payments` - Payment and revenue data

All queries use parallel fetching with `Promise.all()` for optimal performance.

### State Management

```typescript
const [activeTab, setActiveTab] = useState<'overview' | 'users' | ...>('overview');
const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [dateRange, setDateRange] = useState('30');
const [showNotifications, setShowNotifications] = useState(false);
```

## Navigation Setup

### Screen Type
Added to `types.ts`:
```typescript
export type Screen = 
  | 'unified-admin'
  | ... // other screens
```

### App.tsx Integration
```typescript
const SCREEN_COMPONENTS: Record<Screen, React.ComponentType<any>> = {
  'unified-admin': UnifiedAdminDashboard,
  // ... other components
};
```

### Sidebar Links
Two links added to sidebar for super admins:
1. **Admin Control Panel** → `unified-admin` (new, primary)
2. **Platform Admin (Legacy)** → `platform-admin` (old, for backward compatibility)

### Default Navigation
Super admins are automatically redirected to the unified dashboard on login:
```typescript
if (currentUser?.role === 'super_admin') {
  navigateToModule('unified-admin');
}
```

## UI/UX Features

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Collapsible sidebar on mobile
- Touch-friendly buttons and controls

### Visual Feedback
- Loading states with skeleton screens
- Hover effects on interactive elements
- Smooth transitions and animations
- Toast notifications for actions
- Color-coded status indicators

### Accessibility
- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color schemes
- Focus indicators

## Performance Optimizations

1. **Parallel Data Fetching**
   - All metrics loaded simultaneously
   - Reduces total loading time

2. **Lazy Loading**
   - Sub-components loaded on demand
   - Reduces initial bundle size

3. **Memoization**
   - Expensive calculations cached
   - Prevents unnecessary re-renders

4. **Efficient Re-renders**
   - State updates batched
   - Only affected components re-render

## Future Enhancements

### Planned Features
- [ ] Real-time data updates with Supabase subscriptions
- [ ] Advanced filtering and search across all tabs
- [ ] Export functionality (CSV, PDF)
- [ ] Custom date range selection
- [ ] Email notifications for critical alerts
- [ ] Audit log viewer
- [ ] AI agents management interface
- [ ] Service health monitoring dashboard
- [ ] Custom dashboard widgets
- [ ] Dark mode support

### Settings Tab
The Settings tab is currently a placeholder. Planned features include:
- Platform configuration
- Email templates
- Notification settings
- Security settings
- API keys management
- Webhook configuration

## Testing

### Manual Testing Checklist
- [ ] Login as super admin
- [ ] Verify metrics load correctly
- [ ] Test all tab navigation
- [ ] Verify user management CRUD
- [ ] Verify company management CRUD
- [ ] Test billing operations
- [ ] Check analytics data
- [ ] Test refresh functionality
- [ ] Verify search works
- [ ] Test on mobile devices
- [ ] Verify access control (non-super admin)

### Test Credentials
- **Email**: `adrian.stanca1@gmail.com`
- **Password**: `parola123`
- **Role**: `super_admin`

## Deployment

### Production URL
https://constructai-5-gdupsaaly-adrian-b7e84541.vercel.app

### Build Command
```bash
npm run build
```

### Deploy Command
```bash
vercel --prod
```

## Troubleshooting

### Common Issues

**Issue**: Metrics not loading
- **Solution**: Check Supabase connection and RLS policies

**Issue**: Access denied for super admin
- **Solution**: Verify user role in database is exactly `super_admin`

**Issue**: Recent activity empty
- **Solution**: Check if there are recent records in users/companies tables

**Issue**: Tab content not rendering
- **Solution**: Check browser console for component errors

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase connection
3. Check user permissions
4. Review this documentation
5. Contact development team

## Changelog

### Version 1.0.0 (2025-01-23)
- Initial release
- Merged Super Admin and Platform Admin screens
- Added real-time metrics
- Implemented system health monitoring
- Added recent activity feed
- Integrated user, company, billing, and analytics management
- Responsive design implementation
- Access control implementation

