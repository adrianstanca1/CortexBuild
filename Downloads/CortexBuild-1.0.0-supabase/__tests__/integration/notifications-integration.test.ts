import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../../contexts/NotificationContext';
import { NotificationCenter } from '../../components/notifications/NotificationCenter';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { supabase } from '../../lib/supabase/client';
import type { Notification } from '../../types/notifications';

// Mock Supabase client
jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
          single: jest.fn(() => ({
            data: null,
            error: { code: 'PGRST116' },
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: null,
              })),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            error: null,
          })),
        })),
      })),
    })),
  },
}));

// Mock real-time functions
jest.mock('../../lib/supabase/realtime', () => ({
  subscribeToNotifications: jest.fn(),
  subscribeToMultiple: jest.fn(),
  unsubscribeFromMultiple: jest.fn(),
}));

// Mock push notifications
jest.mock('../../lib/services/pushNotifications', () => ({
  showNotificationFromSystem: jest.fn(),
  requestNotificationPermission: jest.fn(),
}));

// Mock email and SMS services
jest.mock('../../api/notifications/email', () => ({
  sendNotificationEmail: jest.fn(),
}));

jest.mock('../../api/notifications/sms', () => ({
  sendNotificationSMS: jest.fn(),
}));

describe('Notification System Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      company_id: 'company-123',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('End-to-End Notification Flow', () => {
    it('creates, displays, and manages notifications end-to-end', async () => {
      const mockNotification: Notification = {
        id: 'notif-123',
        user_id: 'user-123',
        company_id: 'company-123',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: Review blueprints',
        type: 'info',
        category: 'task',
        priority: 'medium',
        channels: ['in_app', 'email'],
        read: false,
        metadata: { taskId: 'task-123' },
        company_wide: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock successful notification creation
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // Template not found
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockNotification,
            error: null,
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: { email: 'test@example.com' },
            error: null,
          }),
        });

      // Mock email sending
      const { sendNotificationEmail } = require('../../api/notifications/email');
      sendNotificationEmail.mockResolvedValue(true);

      // Render the notification system
      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestNotificationFlow />
        </NotificationProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Notification System Test')).toBeInTheDocument();
      });

      // Create a notification
      fireEvent.click(screen.getByText('Create Notification'));

      // Verify notification appears in bell
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Unread count
      });

      // Open notification center
      fireEvent.click(screen.getByTestId('bell-icon'));

      // Verify notification is displayed
      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
        expect(screen.getByText('You have been assigned a new task: Review blueprints')).toBeInTheDocument();
      });

      // Mark as read
      fireEvent.click(screen.getByText('New Task Assigned'));

      // Verify read status
      await waitFor(() => {
        expect(screen.queryByText('1')).not.toBeInTheDocument(); // Unread count should be gone
      });

      // Verify email was sent
      expect(sendNotificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'New Task Assigned',
        expect.objectContaining({
          title: 'New Task Assigned',
          message: 'You have been assigned a new task: Review blueprints',
        })
      );
    });

    it('handles real-time notification updates', async () => {
      const { subscribeToNotifications } = require('../../lib/supabase/realtime');
      const { showNotificationFromSystem } = require('../../lib/services/pushNotifications');

      const mockRealtimeNotification: Notification = {
        id: 'realtime-notif',
        user_id: 'user-123',
        company_id: 'company-123',
        title: 'Real-time Update',
        message: 'A task has been updated',
        type: 'success',
        category: 'task',
        priority: 'low',
        channels: ['in_app', 'push'],
        read: false,
        metadata: {},
        company_wide: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      showNotificationFromSystem.mockResolvedValue(undefined);

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestRealtimeFlow />
        </NotificationProvider>
      );

      // Wait for subscription to be established
      await waitFor(() => {
        expect(subscribeToNotifications).toHaveBeenCalled();
      });

      // Simulate real-time notification
      const subscribeCallback = subscribeToNotifications.mock.calls[0][1];
      act(() => {
        subscribeCallback.onNotification({
          eventType: 'INSERT',
          new: mockRealtimeNotification,
        });
      });

      // Verify notification appears
      await waitFor(() => {
        expect(screen.getByText('Real-time Update')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Unread count
      });

      // Verify push notification was shown
      expect(showNotificationFromSystem).toHaveBeenCalledWith(mockRealtimeNotification);
    });
  });

  describe('Multi-Channel Delivery Integration', () => {
    it('sends notifications via multiple channels simultaneously', async () => {
      const { sendNotificationEmail } = require('../../api/notifications/email');
      const { sendNotificationSMS } = require('../../api/notifications/sms');

      sendNotificationEmail.mockResolvedValue(true);
      sendNotificationSMS.mockResolvedValue(true);

      // Mock database calls for multi-channel notification
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'multi-channel-notif',
              user_id: 'user-123',
              title: 'Urgent: System Maintenance',
              message: 'System will be down for maintenance in 30 minutes',
              type: 'warning',
              category: 'system',
              priority: 'urgent',
              channels: ['in_app', 'email', 'sms'],
              read: false,
              metadata: {},
              company_wide: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: { email: 'test@example.com', phone: '+1234567890' },
            error: null,
          }),
        });

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestMultiChannelFlow />
        </NotificationProvider>
      );

      // Trigger multi-channel notification
      fireEvent.click(screen.getByText('Send Multi-Channel Notification'));

      // Verify all channels were triggered
      await waitFor(() => {
        expect(sendNotificationEmail).toHaveBeenCalled();
        expect(sendNotificationSMS).toHaveBeenCalled();
      });

      // Verify email content
      expect(sendNotificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Urgent: System Maintenance',
        expect.objectContaining({
          priority: 'urgent',
        })
      );

      // Verify SMS content
      expect(sendNotificationSMS).toHaveBeenCalledWith(
        '+1234567890',
        'System will be down for maintenance in 30 minutes',
        expect.objectContaining({
          priority: 'urgent',
        })
      );
    });

    it('handles partial delivery failures gracefully', async () => {
      const { sendNotificationEmail } = require('../../api/notifications/email');
      const { sendNotificationSMS } = require('../../api/notifications/sms');

      sendNotificationEmail.mockResolvedValue(false); // Email fails
      sendNotificationSMS.mockResolvedValue(true); // SMS succeeds

      // Setup mocks similar to above
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'partial-failure-notif',
              user_id: 'user-123',
              title: 'Partial Failure Test',
              message: 'Testing partial delivery failure',
              channels: ['in_app', 'email', 'sms'],
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: { email: 'test@example.com', phone: '+1234567890' },
            error: null,
          }),
        });

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestMultiChannelFlow />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Send Multi-Channel Notification'));

      // Wait for delivery attempts
      await waitFor(() => {
        expect(sendNotificationEmail).toHaveBeenCalled();
        expect(sendNotificationSMS).toHaveBeenCalled();
      });

      // Notification should still be created and displayed in-app
      expect(screen.getByText('Partial Failure Test')).toBeInTheDocument();
    });
  });

  describe('Screen Integration Tests', () => {
    it('integrates with Tasks screen notification triggers', async () => {
      // Mock task assignment scenario
      const taskNotification: Notification = {
        id: 'task-notif-123',
        user_id: 'user-123',
        company_id: 'company-123',
        title: 'Task Assigned',
        message: 'You have been assigned task: "Review electrical drawings"',
        type: 'info',
        category: 'task',
        priority: 'medium',
        channels: ['in_app', 'push'],
        read: false,
        metadata: {
          taskId: 'task-456',
          projectId: 'project-789',
          assignedBy: 'user-999',
        },
        company_wide: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Setup notification creation mocks
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              name: 'task_assigned',
              title_template: 'Task Assigned: {task_name}',
              message_template: 'You have been assigned task: "{task_name}"',
              type: 'info',
              category: 'task',
              priority: 'medium',
              channels: ['in_app', 'push'],
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: taskNotification,
            error: null,
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({
            error: null,
          }),
        });

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestTasksIntegration />
        </NotificationProvider>
      );

      // Simulate task assignment
      fireEvent.click(screen.getByText('Assign Task'));

      // Verify notification is created and displayed
      await waitFor(() => {
        expect(screen.getByText('Task Assigned')).toBeInTheDocument();
        expect(screen.getByText('You have been assigned task: "Review electrical drawings"')).toBeInTheDocument();
      });

      // Verify notification has task metadata
      const notificationElement = screen.getByText('Task Assigned').closest('div');
      expect(notificationElement).toBeInTheDocument();
    });

    it('integrates with Projects screen milestone notifications', async () => {
      const milestoneNotification: Notification = {
        id: 'milestone-notif-123',
        user_id: 'user-123',
        company_id: 'company-123',
        title: 'Milestone Reached',
        message: 'Project "Downtown Complex" has reached "Foundation Complete" milestone',
        type: 'success',
        category: 'project',
        priority: 'medium',
        channels: ['in_app', 'email'],
        read: false,
        metadata: {
          projectId: 'project-123',
          milestoneId: 'milestone-456',
          milestoneName: 'Foundation Complete',
        },
        company_wide: true, // Company-wide notification
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Setup mocks
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              name: 'project_milestone',
              title_template: 'Milestone Reached: {milestone_name}',
              message_template: 'Project "{project_name}" has reached {milestone_name} milestone',
              type: 'success',
              category: 'project',
              priority: 'medium',
              channels: ['in_app', 'email'],
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: milestoneNotification,
            error: null,
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({
            error: null,
          }),
        });

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestProjectsIntegration />
        </NotificationProvider>
      );

      // Simulate milestone completion
      fireEvent.click(screen.getByText('Complete Milestone'));

      // Verify milestone notification
      await waitFor(() => {
        expect(screen.getByText('Milestone Reached')).toBeInTheDocument();
        expect(screen.getByText('Project "Downtown Complex" has reached "Foundation Complete" milestone')).toBeInTheDocument();
      });
    });

    it('integrates with Dashboard notification summary', async () => {
      const dashboardNotifications: Notification[] = [
        {
          id: 'dashboard-1',
          user_id: 'user-123',
          title: 'Weekly Summary',
          message: 'You have 5 unread notifications this week',
          type: 'info',
          category: 'system',
          priority: 'low',
          channels: ['in_app'],
          read: false,
          metadata: { summary: true },
          company_wide: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'dashboard-2',
          user_id: 'user-123',
          title: 'Task Due Soon',
          message: 'Task "Submit permits" is due in 2 days',
          type: 'warning',
          category: 'task',
          priority: 'high',
          channels: ['in_app', 'email'],
          read: false,
          metadata: { dueDate: '2024-01-15' },
          company_wide: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Setup notification fetching mocks
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: dashboardNotifications,
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: dashboardNotifications,
            error: null,
          }),
        });

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestDashboardIntegration />
        </NotificationProvider>
      );

      // Wait for dashboard to load notifications
      await waitFor(() => {
        expect(screen.getByText('Weekly Summary')).toBeInTheDocument();
        expect(screen.getByText('Task Due Soon')).toBeInTheDocument();
      });

      // Verify summary information
      expect(screen.getByText('2')).toBeInTheDocument(); // Unread count
      expect(screen.getByText('1 high priority')).toBeInTheDocument();
    });
  });

  describe('Performance and Load Testing', () => {
    it('handles large number of notifications efficiently', async () => {
      // Create 100 notifications
      const largeNotificationSet: Notification[] = Array.from({ length: 100 }, (_, i) => ({
        id: `notif-${i}`,
        user_id: 'user-123',
        company_id: 'company-123',
        title: `Notification ${i + 1}`,
        message: `This is notification number ${i + 1}`,
        type: i % 4 === 0 ? 'error' : i % 3 === 0 ? 'warning' : i % 2 === 0 ? 'success' : 'info',
        category: 'system',
        priority: i % 10 === 0 ? 'urgent' : i % 5 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
        channels: ['in_app'],
        read: i % 3 === 0, // Every third notification is read
        metadata: {},
        company_wide: false,
        created_at: new Date(Date.now() - i * 60000).toISOString(), // Stagger timestamps
        updated_at: new Date().toISOString(),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: largeNotificationSet,
          error: null,
        }),
      });

      const startTime = Date.now();

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestPerformanceFlow />
        </NotificationProvider>
      );

      // Wait for all notifications to load
      await waitFor(() => {
        expect(screen.getByText('Notification 100')).toBeInTheDocument();
      });

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time (under 5 seconds for test)
      expect(loadTime).toBeLessThan(5000);

      // Verify unread count calculation
      const unreadCount = largeNotificationSet.filter(n => !n.read).length;
      expect(screen.getByText(unreadCount.toString())).toBeInTheDocument();
    });

    it('handles rapid notification updates', async () => {
      const { subscribeToNotifications } = require('../../lib/supabase/realtime');

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestRapidUpdatesFlow />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(subscribeToNotifications).toHaveBeenCalled();
      });

      const subscribeCallback = subscribeToNotifications.mock.calls[0][1];

      // Simulate 10 rapid notifications
      for (let i = 0; i < 10; i++) {
        act(() => {
          subscribeCallback.onNotification({
            eventType: 'INSERT',
            new: {
              id: `rapid-${i}`,
              user_id: 'user-123',
              title: `Rapid Notification ${i + 1}`,
              message: `Message ${i + 1}`,
              type: 'info',
              category: 'system',
              priority: 'low',
              channels: ['in_app'],
              read: false,
              metadata: {},
              company_wide: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          });
        });
      }

      // Verify all notifications are displayed
      await waitFor(() => {
        expect(screen.getByText('Rapid Notification 10')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument(); // Unread count
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('recovers from temporary network failures', async () => {
      // Start with failure
      (supabase.from as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestErrorRecoveryFlow />
        </NotificationProvider>
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch notifications')).toBeInTheDocument();
      });

      // Mock successful recovery
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      // Trigger retry
      fireEvent.click(screen.getByText('Retry'));

      // Should recover
      await waitFor(() => {
        expect(screen.queryByText('Failed to fetch notifications')).not.toBeInTheDocument();
      });
    });

    it('handles partial real-time connection failures', async () => {
      const { subscribeToNotifications } = require('../../lib/supabase/realtime');

      render(
        <NotificationProvider userId="user-123" companyId="company-123">
          <TestConnectionRecoveryFlow />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(subscribeToNotifications).toHaveBeenCalled();
      });

      const subscribeCallback = subscribeToNotifications.mock.calls[0][1];

      // Simulate connection error
      act(() => {
        subscribeCallback.onError(new Error('Connection lost'));
      });

      // Should show disconnected state
      await waitFor(() => {
        expect(screen.getByText('Real-time connection lost')).toBeInTheDocument();
      });

      // Simulate reconnection
      act(() => {
        // New subscription established
        subscribeToNotifications.mock.calls[1][1].onNotification({
          eventType: 'INSERT',
          new: {
            id: 'reconnect-notif',
            user_id: 'user-123',
            title: 'Reconnected',
            message: 'Real-time connection restored',
            type: 'success',
            category: 'system',
            priority: 'low',
            channels: ['in_app'],
            read: false,
            metadata: {},
            company_wide: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      });

      // Should show reconnected notification
      await waitFor(() => {
        expect(screen.getByText('Reconnected')).toBeInTheDocument();
      });
    });
  });
});

// Test Components
const TestNotificationFlow: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();

  return (
    <div>
      <h1>Notification System Test</h1>
      <p>Unread count: {unreadCount}</p>
      <button onClick={() => {/* Create notification logic */}}>
        Create Notification
      </button>
      <NotificationBell userId="user-123" onOpenNotifications={() => {}} />
      <div>
        {notifications.map(notif => (
          <div key={notif.id}>
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TestRealtimeFlow: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();

  return (
    <div>
      <h1>Real-time Test</h1>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
};

const TestMultiChannelFlow: React.FC = () => {
  const { notifications } = useNotifications();

  return (
    <div>
      <button onClick={() => {/* Send multi-channel notification */}}>
        Send Multi-Channel Notification
      </button>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
};

const TestTasksIntegration: React.FC = () => {
  const { notifications } = useNotifications();

  return (
    <div>
      <button onClick={() => {/* Assign task logic */}}>
        Assign Task
      </button>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
};

const TestProjectsIntegration: React.FC = () => {
  const { notifications } = useNotifications();

  return (
    <div>
      <button onClick={() => {/* Complete milestone logic */}}>
        Complete Milestone
      </button>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
};

const TestDashboardIntegration: React.FC = () => {
  const { notifications, unreadCount, summary } = useNotifications();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Unread: {unreadCount}</p>
      {summary && <p>High priority: {summary.high_priority}</p>}
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
};

const TestPerformanceFlow: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
};

const TestRapidUpdatesFlow: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();

  return (
    <div>
      <p>Count: {unreadCount}</p>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
};

const TestErrorRecoveryFlow: React.FC = () => {
  const { error } = useNotifications();

  return (
    <div>
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
    </div>
  );
};

const TestConnectionRecoveryFlow: React.FC = () => {
  const { error, notifications } = useNotifications();

  return (
    <div>
      {error && <p>{error}</p>}
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
};