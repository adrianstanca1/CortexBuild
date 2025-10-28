# Real-time Notifications Center

A comprehensive, real-time notification system for the CortexBuild platform with customizable alerts, user preferences, and seamless integration across all screens.

## 🚀 Features

- **Real-time Updates**: Live notifications via Supabase Realtime
- **Multi-channel Delivery**: In-app, email, push, and SMS notifications
- **User Preferences**: Customizable notification settings and quiet hours
- **Alert Categorization**: Organized notifications by type, priority, and category
- **Mobile Responsive**: Touch-friendly interface with accessibility support
- **Performance Optimized**: Virtualized lists, caching, and efficient queries
- **Push Notifications**: Browser notification API integration
- **Template System**: Reusable notification templates for common events

## 📁 Architecture

```
components/notifications/
├── NotificationBell.tsx          # Bell icon with unread count
├── NotificationCenter.tsx        # Main notification panel
└── AlertSettings.tsx            # User preferences panel

contexts/
└── NotificationContext.tsx       # State management & real-time

hooks/
├── useNotificationTriggers.ts    # Event-based notification triggers
└── useTasksWithNotifications.ts  # Enhanced task hooks

lib/services/
└── pushNotifications.ts          # Browser push notification service

types/
└── notifications.ts              # TypeScript definitions

api/notifications/
└── enhanced.ts                   # REST API endpoints
```

## 🗄️ Database Schema

### Core Tables

#### `notifications`
- `id` - UUID primary key
- `user_id` - User reference
- `company_id` - Company reference  
- `title` - Notification title
- `message` - Notification content
- `type` - info, success, warning, error, system
- `category` - project, task, invoice, system, chat, comment, file, etc.
- `priority` - low, medium, high, urgent
- `channels` - Array of delivery channels
- `read` - Boolean read status
- `action_url` - Click action URL
- `metadata` - JSON metadata
- `expires_at` - Expiration timestamp
- `source_type` - Origin system
- `source_id` - Origin record ID
- `created_at` - Creation timestamp

#### `notification_preferences`
- `user_id` - User reference
- `email_enabled` - Email notifications enabled
- `push_enabled` - Push notifications enabled  
- `sms_enabled` - SMS notifications enabled
- `categories` - Per-category channel preferences
- `priority_filter` - Allowed priority levels
- `quiet_hours_enabled` - Quiet hours active
- `quiet_hours_start/end` - Quiet hours range
- `max_notifications_per_hour` - Rate limiting
- `digest_enabled` - Daily digest enabled

#### `notification_channels`
- `notification_id` - Notification reference
- `channel` - Delivery channel
- `status` - pending, sent, delivered, failed, bounced
- `sent_at` - Send timestamp
- `delivered_at` - Delivery timestamp
- `error_message` - Error details

#### `notification_templates`
- `name` - Template identifier
- `title_template` - Title with variables
- `message_template` - Message with variables
- `type` - Notification type
- `category` - Notification category
- `priority` - Default priority
- `channels` - Default channels
- `variables` - Available template variables

## 🔧 Installation & Setup

### 1. Database Migration

Run the enhanced notifications schema migration:

```sql
-- Apply the migration
\i supabase/migrations/004_enhanced_notifications_schema.sql
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Push Notifications (optional)
VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 3. Service Worker (for push notifications)

Create `public/sw.js`:

```javascript
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/logo.png',
    badge: '/badge.png',
    data: event.data ? event.data.json() : {}
  };

  event.waitUntil(
    self.registration.showNotification('CortexBuild', options)
  );
});
```

## 🎯 Usage

### Basic Integration

#### 1. Wrap your app with NotificationProvider

```tsx
import { NotificationProvider } from '../contexts/NotificationContext';

function App({ children }) {
  return (
    <NotificationProvider userId={user.id} companyId={user.companyId}>
      {children}
    </NotificationProvider>
  );
}
```

#### 2. Add NotificationBell to your header

```tsx
import { NotificationBell } from '../components/notifications/NotificationBell';

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>My App</h1>
      <NotificationBell
        userId={userId}
        onOpenNotifications={() => setShowNotifications(true)}
      />
    </header>
  );
}
```

#### 3. Add NotificationCenter modal

```tsx
import { NotificationCenter } from '../components/notifications/NotificationCenter';

function App() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      {/* Your app content */}
      
      <NotificationCenter
        userId={userId}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
```

### Advanced Integration

#### Using Notification Triggers

```tsx
import { useNotificationTriggers } from '../hooks/useNotificationTriggers';

function TaskComponent({ task, userId, companyId }) {
  const { notifyTaskAssigned, notifyTaskDeadlineApproaching } = 
    useNotificationTriggers({ userId, companyId });

  const handleAssignTask = async (assigneeId) => {
    // Update task assignment
    await updateTask(task.id, { assignee_id: assigneeId });
    
    // Send notification
    await notifyTaskAssigned(
      task.id,
      task.title,
      assigneeId,
      assigneeName,
      projectName
    );
  };

  const handleDeadlineUpdate = async (newDeadline) => {
    await updateTask(task.id, { due_date: newDeadline });
    
    // Check if deadline is approaching
    const daysUntilDue = Math.ceil((new Date(newDeadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 7) {
      await notifyTaskDeadlineApproaching(
        task.id,
        task.title,
        task.assignee_id,
        daysUntilDue,
        newDeadline
      );
    }
  };
}
```

#### Enhanced Task Management

```tsx
import { useTasksWithNotifications } from '../hooks/useTasksWithNotifications';

function TasksScreen({ userId, companyId }) {
  const { 
    tasks, 
    createTask, 
    updateTask,
    checkUpcomingDeadlines,
    checkOverdueTasks 
  } = useTasksWithNotifications({ userId, companyId });

  const handleCreateTask = async (taskData) => {
    // This will automatically send notifications
    const newTask = await createTask(taskData);
    
    // Optionally check deadlines
    await checkUpcomingDeadlines();
  };
}
```

## 📡 API Endpoints

### GET `/api/notifications/enhanced`
Fetch notifications with filtering and pagination.

**Query Parameters:**
- `limit` - Number of notifications (default: 20)
- `offset` - Pagination offset (default: 0)
- `read` - Filter by read status (true/false)
- `type` - Filter by notification type
- `category` - Filter by category
- `priority` - Filter by priority
- `date_from` - Start date filter
- `date_to` - End date filter
- `include_summary` - Include summary statistics

**Response:**
```json
{
  "success": true,
  "data": [...],
  "summary": {
    "total": 150,
    "unread": 23,
    "high_priority": 5,
    "by_type": {...},
    "by_category": {...},
    "by_priority": {...}
  },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### POST `/api/notifications/enhanced`
Create a new notification.

**Body:**
```json
{
  "user_id": "uuid",
  "title": "Task Assigned",
  "message": "You have been assigned a new task",
  "type": "info",
  "category": "task",
  "priority": "medium",
  "channels": ["in_app", "push"],
  "action_url": "/tasks/123",
  "metadata": {...}
}
```

### PUT `/api/notifications/enhanced`
Update notification status.

**Body:**
```json
{
  "id": "notification-uuid",
  "updates": {
    "read": true,
    "dismissed": false
  }
}
```

### DELETE `/api/notifications/enhanced?id=uuid`
Delete a notification.

## 🎨 Customization

### Notification Types & Categories

```typescript
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
type NotificationCategory = 'project' | 'task' | 'invoice' | 'system' | 'chat' | 'comment' | 'file' | 'milestone' | 'deadline' | 'integration';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
```

### Custom Templates

Create reusable notification templates:

```sql
INSERT INTO notification_templates (name, title_template, message_template, type, category, priority, channels, variables) VALUES
('task_assigned', 'New Task Assigned', 'You have been assigned task: {task_name}', 'info', 'task', 'medium', '["in_app", "push"]', '{"task_name": "string", "task_id": "string"}');
```

### User Preferences

Users can customize:
- Delivery channels (email, push, SMS)
- Category-specific preferences
- Priority filters
- Quiet hours
- Rate limiting
- Daily digest settings

## 🔄 Real-time Integration

The system uses Supabase Realtime for live updates:

```typescript
// Automatic subscription in NotificationContext
const unsubscribe = subscribeToNotifications(userId, {
  onNotification: (payload) => {
    switch (payload.eventType) {
      case 'INSERT':
        // New notification received
        dispatch({ type: 'ADD_NOTIFICATION', payload: payload.new });
        // Show push notification
        showNotificationFromSystem(payload.new);
        break;
      case 'UPDATE':
        // Notification updated
        dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id: payload.new.id, updates: payload.new } });
        break;
      case 'DELETE':
        // Notification deleted
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: payload.old.id });
        break;
    }
  },
  onError: (error) => {
    console.error('Real-time error:', error);
  }
});
```

## 📱 Mobile & Accessibility

### Mobile Responsive Design
- Touch-friendly interface
- Swipe gestures for actions
- Optimized for small screens
- Mobile-first CSS approach

### Accessibility Features
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

## 🚀 Performance Optimizations

### Frontend
- Virtualized notification lists
- Debounced search and filters
- Optimistic updates
- Efficient re-renders with React.memo
- Lazy loading of notification content

### Backend
- Database indexes on frequently queried fields
- Pagination for large datasets
- Connection pooling
- Rate limiting
- Caching strategies

### Real-time
- Connection management with auto-reconnect
- Exponential backoff for failed connections
- Message deduplication
- Efficient subscription filtering

## 🧪 Testing

### Unit Tests
```bash
npm test -- --testPathPattern=notifications
```

### Integration Tests
```bash
npm test -- --testPathPattern=NotificationContext
```

### E2E Tests
```bash
npm run test:e2e -- --grep="notifications"
```

## 🔧 Development

### Adding New Notification Types

1. Update the TypeScript types:
```typescript
// types/notifications.ts
export type NotificationCategory = 
  | 'project' | 'task' | 'invoice' | 'system' | 'chat' 
  | 'comment' | 'file' | 'milestone' | 'deadline' 
  | 'integration' | 'your_new_category';
```

2. Add database constraints:
```sql
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_category_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_category_check 
  CHECK (category IN ('project', 'task', 'invoice', 'system', 'chat', 'comment', 'file', 'milestone', 'deadline', 'integration', 'your_new_category'));
```

3. Create notification triggers:
```typescript
// hooks/useNotificationTriggers.ts
const notifyYourCustomEvent = useCallback(async (data) => {
  return sendNotification({
    user_id: data.userId,
    title: 'Custom Event',
    message: `Something happened: ${data.description}`,
    type: 'info',
    category: 'your_new_category',
    priority: 'medium',
    channels: ['in_app', 'push']
  });
}, [sendNotification]);
```

## 📊 Analytics & Monitoring

### Notification Analytics
- Delivery rates by channel
- Read rates and engagement
- User preference patterns
- Performance metrics

### Monitoring
- Real-time connection status
- Error rates and recovery
- User engagement metrics
- System performance

## 🔐 Security

### Authentication
- All API endpoints require authentication
- User-scoped data access
- Company-level isolation

### Data Protection
- Encrypted sensitive data
- Secure token handling
- Rate limiting protection
- Input validation and sanitization

## 🚨 Troubleshooting

### Common Issues

1. **Real-time not working**
   - Check Supabase connection
   - Verify user authentication
   - Check browser console for errors

2. **Push notifications not showing**
   - Verify browser permission
   - Check service worker registration
   - Ensure HTTPS in production

3. **Notifications not sending**
   - Check API endpoint accessibility
   - Verify user preferences
   - Check rate limiting settings

### Debug Mode

Enable debug logging:

```typescript
// Enable in development
localStorage.setItem('notification-debug', 'true');
```

## 📚 Examples

### Complete Integration Example

See `components/screens/TasksScreenWithNotifications.tsx` for a complete example of integrating the notification system into a task management screen.

### Hook Usage Examples

```typescript
// Basic usage
const { notifications, unreadCount, markAsRead } = useNotifications();

// With triggers
const { notifyTaskAssigned, notifyTaskCompleted } = useNotificationTriggers({ userId, companyId });

// Enhanced tasks
const { createTask, updateTask } = useTasksWithNotifications({ userId, companyId });
```

## 🤝 Contributing

1. Follow the existing code patterns
2. Add TypeScript types for new features
3. Update documentation
4. Add tests for new functionality
5. Ensure accessibility compliance

## 📄 License

This notification system is part of the CortexBuild platform and follows the same licensing terms.

---

For more information or support, please refer to the main CortexBuild documentation or contact the development team.
