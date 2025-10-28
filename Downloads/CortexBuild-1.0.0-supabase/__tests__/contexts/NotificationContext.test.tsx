import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase/client';
import type { Notification, NotificationPreferences } from '../../types/notifications';

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
              data: null,
              error: null,
            })),
          })),
          single: jest.fn(() => ({
            data: null,
            error: null,
          })),
          upsert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: null,
              })),
            })),
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

describe('NotificationContext', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockCompanyId = 'company-123';

  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      user_id: 'user-123',
      company_id: 'company-123',
      title: 'Test Notification 1',
      message: 'This is a test notification',
      type: 'info',
      category: 'system',
      priority: 'medium',
      channels: ['in_app'],
      read: false,
      metadata: {},
      company_wide: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      user_id: 'user-123',
      company_id: 'company-123',
      title: 'Test Notification 2',
      message: 'This is another test notification',
      type: 'warning',
      category: 'task',
      priority: 'high',
      channels: ['in_app', 'email'],
      read: true,
      metadata: {},
      company_wide: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockPreferences: NotificationPreferences = {
    id: 'prefs-123',
    user_id: 'user-123',
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    categories: {
      project: { email: true, push: true, sms: false },
      task: { email: true, push: true, sms: false },
      invoice: { email: true, push: false, sms: false },
      system: { email: false, push: true, sms: false },
      chat: { email: true, push: true, sms: false },
      comment: { email: true, push: true, sms: false },
      file: { email: false, push: true, sms: false },
      milestone: { email: true, push: true, sms: false },
      deadline: { email: true, push: true, sms: true },
      integration: { email: false, push: true, sms: false },
    },
    priority_filter: ['low', 'medium', 'high', 'urgent'],
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    max_notifications_per_hour: 10,
    digest_enabled: false,
    digest_frequency: 'daily',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockNotifications,
        error: null,
      }),
      single: jest.fn().mockResolvedValue({
        data: mockPreferences,
        error: null,
      }),
      upsert: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockResolvedValue({
        error: null,
      }),
    });
  });

  describe('Provider Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.preferences).toBeNull();
      expect(result.current.summary).toBeNull();
      expect(result.current.isSubscribed).toBe(false);
    });

    it('loads notifications on mount', async () => {
      renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('notifications');
      });
    });

    it('loads preferences on mount', async () => {
      renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('notification_preferences');
      });
    });

    it('subscribes to real-time notifications on mount', async () => {
      const { subscribeToNotifications } = require('../../lib/supabase/realtime');

      renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await waitFor(() => {
        expect(subscribeToNotifications).toHaveBeenCalledWith('user-123', expect.any(Object));
      });
    });
  });

  describe('fetchNotifications', () => {
    it('fetches notifications successfully', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.unreadCount).toBe(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('applies filters correctly', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await act(async () => {
        await result.current.fetchNotifications({
          read: false,
          type: ['info'],
          category: ['system'],
          priority: ['medium'],
        });
      });

      const supabaseFrom = supabase.from as jest.Mock;
      const selectMock = supabaseFrom.mock.results[0].value.select;
      const eqMock = selectMock.mock.results[0].value.eq;

      expect(eqMock).toHaveBeenCalledWith('read', false);
      expect(eqMock).toHaveBeenCalledWith('type', ['info']);
      expect(eqMock).toHaveBeenCalledWith('category', ['system']);
      expect(eqMock).toHaveBeenCalledWith('priority', ['medium']);
    });

    it('handles fetch errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.error).toBe('Failed to fetch notifications');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read successfully', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      // Set initial notifications
      act(() => {
        result.current.notifications = mockNotifications;
        result.current.unreadCount = 1;
      });

      await act(async () => {
        await result.current.markAsRead('notif-1');
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it('handles mark as read errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await act(async () => {
        await result.current.markAsRead('notif-1');
      });

      expect(result.current.error).toBe('Failed to mark notification as read');
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read successfully', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      // Set initial notifications
      act(() => {
        result.current.notifications = mockNotifications;
        result.current.unreadCount = 1;
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(result.current.notifications.every(n => n.read)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('deletes notification successfully', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      // Set initial notifications
      act(() => {
        result.current.notifications = mockNotifications;
        result.current.unreadCount = 1;
      });

      await act(async () => {
        await result.current.deleteNotification('notif-1');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toBe('notif-2');
    });
  });

  describe('dismissNotification', () => {
    it('dismisses notification successfully', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      // Set initial notifications
      act(() => {
        result.current.notifications = mockNotifications;
      });

      await act(async () => {
        await result.current.dismissNotification('notif-1');
      });

      expect(result.current.notifications[0].dismissed_at).toBeDefined();
    });
  });

  describe('updatePreferences', () => {
    it('updates preferences successfully', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      const newPreferences = { email_enabled: false };

      await act(async () => {
        await result.current.updatePreferences(newPreferences);
      });

      expect(supabase.from).toHaveBeenCalledWith('notification_preferences');
    });
  });

  describe('Real-time Updates', () => {
    it('handles INSERT events', async () => {
      const { showNotificationFromSystem } = require('../../lib/services/pushNotifications');

      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      // Simulate real-time INSERT event
      const { subscribeToNotifications } = require('../../lib/supabase/realtime');
      const mockSubscribeCallback = subscribeToNotifications.mock.calls[0][1];

      act(() => {
        mockSubscribeCallback.onNotification({
          eventType: 'INSERT',
          new: mockNotifications[0],
        });
      });

      expect(result.current.notifications[0]).toEqual(mockNotifications[0]);
      expect(showNotificationFromSystem).toHaveBeenCalledWith(mockNotifications[0]);
    });

    it('handles UPDATE events', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      // Set initial notifications
      act(() => {
        result.current.notifications = mockNotifications;
      });

      // Simulate real-time UPDATE event
      const { subscribeToNotifications } = require('../../lib/supabase/realtime');
      const mockSubscribeCallback = subscribeToNotifications.mock.calls[0][1];

      const updatedNotification = { ...mockNotifications[0], read: true };

      act(() => {
        mockSubscribeCallback.onNotification({
          eventType: 'UPDATE',
          new: updatedNotification,
        });
      });

      expect(result.current.notifications[0].read).toBe(true);
    });

    it('handles DELETE events', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      // Set initial notifications
      act(() => {
        result.current.notifications = mockNotifications;
      });

      // Simulate real-time DELETE event
      const { subscribeToNotifications } = require('../../lib/supabase/realtime');
      const mockSubscribeCallback = subscribeToNotifications.mock.calls[0][1];

      act(() => {
        mockSubscribeCallback.onNotification({
          eventType: 'DELETE',
          old: { id: 'notif-1' },
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toBe('notif-2');
    });

    it('handles real-time connection errors', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      // Simulate real-time error
      const { subscribeToNotifications } = require('../../lib/supabase/realtime');
      const mockSubscribeCallback = subscribeToNotifications.mock.calls[0][1];

      act(() => {
        mockSubscribeCallback.onError(new Error('Connection lost'));
      });

      expect(result.current.error).toBe('Real-time connection lost');
      expect(result.current.isSubscribed).toBe(false);
    });
  });

  describe('subscribeToNotifications', () => {
    it('subscribes to notifications successfully', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      const unsubscribe = result.current.subscribeToNotifications();

      expect(result.current.isSubscribed).toBe(true);
      expect(typeof unsubscribe).toBe('function');
    });

    it('unsubscribes correctly', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      const unsubscribe = result.current.subscribeToNotifications();
      unsubscribe();

      expect(result.current.isSubscribed).toBe(false);
    });
  });

  describe('refreshNotifications', () => {
    it('refreshes all notification data', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await act(async () => {
        await result.current.refreshNotifications();
      });

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(supabase.from).toHaveBeenCalledWith('notification_preferences');
    });
  });

  describe('Error Handling', () => {
    it('handles authentication errors', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.error).toBe('Failed to fetch notifications');
    });

    it('handles network errors gracefully', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.error).toBe('Failed to fetch notifications');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty notification list', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
    });

    it('handles missing preferences', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Not found error
        }),
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences).toBeNull();
      });
    });

    it('handles malformed notification data', async () => {
      const malformedNotifications = [
        {
          id: 'malformed-1',
          user_id: 'user-123',
          // Missing required fields
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: malformedNotifications,
          error: null,
        }),
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: ({ children }) => (
          <NotificationProvider userId="user-123" companyId="company-123">
            {children}
          </NotificationProvider>
        ),
      });

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.notifications).toEqual(malformedNotifications);
    });
  });
});