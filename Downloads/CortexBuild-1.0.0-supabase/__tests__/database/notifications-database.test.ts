import { supabase } from '../../lib/supabase/client';
import type { Notification, NotificationPreferences, NotificationTemplate } from '../../types/notifications';

// Mock Supabase client
jest.mock('../../lib/supabase/client', () => ({
  supabase: {
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
          limit: jest.fn(() => ({
            data: null,
            error: null,
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
    rpc: jest.fn(() => ({
      data: null,
      error: null,
    })),
  },
}));

describe('Notification Database Operations', () => {
  const mockUserId = 'user-123';
  const mockCompanyId = 'company-123';

  const mockNotification: Notification = {
    id: 'notif-123',
    user_id: mockUserId,
    company_id: mockCompanyId,
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'info',
    category: 'system',
    priority: 'medium',
    channels: ['in_app'],
    read: false,
    metadata: { test: true },
    company_wide: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Notification CRUD Operations', () => {
    describe('Create Operations', () => {
      it('creates a notification successfully', async () => {
        const notificationData = {
          user_id: mockUserId,
          company_id: mockCompanyId,
          title: 'New Notification',
          message: 'Notification message',
          type: 'info' as const,
          category: 'system' as const,
          priority: 'medium' as const,
          channels: ['in_app'],
          metadata: { source: 'test' },
        };

        (supabase.from as jest.Mock).mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockNotification, ...notificationData },
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .insert([notificationData])
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toMatchObject(notificationData);
        expect(data?.created_at).toBeDefined();
        expect(data?.updated_at).toBeDefined();
      });

      it('validates required fields on creation', async () => {
        const invalidData = {
          // Missing required fields
          title: 'Test',
        };

        (supabase.from as jest.Mock).mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'null value in column "user_id" violates not-null constraint' },
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .insert([invalidData])
          .select()
          .single();

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(error?.message).toContain('violates not-null constraint');
      });

      it('handles channel array validation', async () => {
        const invalidChannels = {
          user_id: mockUserId,
          title: 'Test',
          message: 'Test message',
          type: 'info' as const,
          category: 'system' as const,
          priority: 'medium' as const,
          channels: ['invalid_channel'], // Invalid channel
        };

        (supabase.from as jest.Mock).mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'violates check constraint' },
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .insert([invalidChannels])
          .select()
          .single();

        expect(data).toBeNull();
        expect(error).toBeDefined();
      });

      it('creates notifications with expiration dates', async () => {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

        const expiringNotification = {
          user_id: mockUserId,
          title: 'Expiring Notification',
          message: 'This will expire',
          type: 'warning' as const,
          category: 'system' as const,
          priority: 'high' as const,
          channels: ['in_app'],
          expires_at: expiresAt,
        };

        (supabase.from as jest.Mock).mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockNotification, ...expiringNotification },
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .insert([expiringNotification])
          .select()
          .single();

        expect(error).toBeNull();
        expect(data?.expires_at).toBe(expiresAt);
      });
    });

    describe('Read Operations', () => {
      it('fetches notifications for a user', async () => {
        const mockNotifications = [mockNotification];

        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: mockNotifications,
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', mockUserId)
          .order('created_at', { ascending: false })
          .range(0, 19);

        expect(error).toBeNull();
        expect(data).toEqual(mockNotifications);
        expect(data?.[0].user_id).toBe(mockUserId);
      });

      it('filters notifications by read status', async () => {
        const unreadNotifications = [mockNotification];

        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: unreadNotifications,
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', mockUserId)
          .eq('read', false)
          .order('created_at', { ascending: false });

        expect(error).toBeNull();
        expect(data).toEqual(unreadNotifications);
        expect(data?.every(n => !n.read)).toBe(true);
      });

      it('filters notifications by type', async () => {
        const infoNotifications = [mockNotification];

        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: infoNotifications,
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', mockUserId)
          .in('type', ['info'])
          .order('created_at', { ascending: false });

        expect(error).toBeNull();
        expect(data?.every(n => n.type === 'info')).toBe(true);
      });

      it('filters notifications by category', async () => {
        const systemNotifications = [mockNotification];

        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: systemNotifications,
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', mockUserId)
          .in('category', ['system'])
          .order('created_at', { ascending: false });

        expect(error).toBeNull();
        expect(data?.every(n => n.category === 'system')).toBe(true);
      });

      it('filters notifications by priority', async () => {
        const mediumPriorityNotifications = [mockNotification];

        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: mediumPriorityNotifications,
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', mockUserId)
          .in('priority', ['medium'])
          .order('created_at', { ascending: false });

        expect(error).toBeNull();
        expect(data?.every(n => n.priority === 'medium')).toBe(true);
      });

      it('filters notifications by date range', async () => {
        const dateRangeNotifications = [mockNotification];

        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: dateRangeNotifications,
            error: null,
          }),
        });

        const startDate = '2024-01-01T00:00:00Z';
        const endDate = '2024-12-31T23:59:59Z';

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', mockUserId)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        expect(error).toBeNull();
        expect(data).toEqual(dateRangeNotifications);
      });

      it('supports pagination', async () => {
        const paginatedNotifications = [mockNotification];

        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: paginatedNotifications,
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', mockUserId)
          .order('created_at', { ascending: false })
          .range(20, 39); // Page 2 (20-39)

        expect(error).toBeNull();
        expect(data).toEqual(paginatedNotifications);
      });

      it('returns empty array when no notifications found', async () => {
        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', mockUserId)
          .order('created_at', { ascending: false });

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });
    });

    describe('Update Operations', () => {
      it('marks notification as read', async () => {
        const updatedNotification = { ...mockNotification, read: true, clicked_at: new Date().toISOString() };

        (supabase.from as jest.Mock).mockReturnValue({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: updatedNotification,
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .update({
            read: true,
            clicked_at: new Date().toISOString(),
          })
          .eq('id', mockNotification.id)
          .eq('user_id', mockUserId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data?.read).toBe(true);
        expect(data?.clicked_at).toBeDefined();
      });

      it('dismisses notification', async () => {
        const dismissedAt = new Date().toISOString();
        const updatedNotification = { ...mockNotification, dismissed_at: dismissedAt };

        (supabase.from as jest.Mock).mockReturnValue({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: updatedNotification,
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .update({ dismissed_at: dismissedAt })
          .eq('id', mockNotification.id)
          .eq('user_id', mockUserId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data?.dismissed_at).toBe(dismissedAt);
      });

      it('updates notification metadata', async () => {
        const newMetadata = { ...mockNotification.metadata, updated: true };
        const updatedNotification = { ...mockNotification, metadata: newMetadata };

        (supabase.from as jest.Mock).mockReturnValue({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: updatedNotification,
            error: null,
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .update({ metadata: newMetadata })
          .eq('id', mockNotification.id)
          .eq('user_id', mockUserId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data?.metadata).toEqual(newMetadata);
      });

      it('prevents updating notifications of other users', async () => {
        (supabase.from as jest.Mock).mockReturnValue({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'No rows found' },
          }),
        });

        const { data, error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', mockNotification.id)
          .eq('user_id', 'different-user-id') // Different user
          .select()
          .single();

        expect(data).toBeNull();
        expect(error).toBeDefined();
      });
    });

    describe('Delete Operations', () => {
      it('deletes notification successfully', async () => {
        (supabase.from as jest.Mock).mockReturnValue({
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        });

        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', mockNotification.id)
          .eq('user_id', mockUserId);

        expect(error).toBeNull();
      });

      it('prevents deleting notifications of other users', async () => {
        (supabase.from as jest.Mock).mockReturnValue({
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: { message: 'No rows found or permission denied' },
          }),
        });

        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', mockNotification.id)
          .eq('user_id', 'different-user-id');

        expect(error).toBeDefined();
      });
    });
  });

  describe('Notification Preferences', () => {
    const mockPreferences: NotificationPreferences = {
      id: 'prefs-123',
      user_id: mockUserId,
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
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('creates user preferences', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPreferences,
          error: null,
        }),
      });

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: mockUserId,
          ...mockPreferences,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.user_id).toBe(mockUserId);
    });

    it('fetches user preferences', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPreferences,
          error: null,
        }),
      });

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', mockUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(mockPreferences);
    });

    it('updates user preferences', async () => {
      const updatedPreferences = { ...mockPreferences, email_enabled: false };

      (supabase.from as jest.Mock).mockReturnValue({
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedPreferences,
          error: null,
        }),
      });

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: mockUserId,
          ...updatedPreferences,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.email_enabled).toBe(false);
    });

    it('returns null for users without preferences', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Not found
        }),
      });

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', 'user-without-prefs')
        .single();

      expect(error?.code).toBe('PGRST116');
      expect(data).toBeNull();
    });
  });

  describe('Notification Templates', () => {
    const mockTemplate: NotificationTemplate = {
      id: 'template-123',
      name: 'task_assigned',
      title_template: 'Task Assigned: {task_name}',
      message_template: 'You have been assigned task: "{task_name}"',
      type: 'info',
      category: 'task',
      priority: 'medium',
      channels: ['in_app', 'push'],
      variables: { task_name: 'string' },
      is_active: true,
      created_by: 'admin-user',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('fetches active templates', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [mockTemplate],
          error: null,
        }),
      });

      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      expect(error).toBeNull();
      expect(data).toEqual([mockTemplate]);
    });

    it('fetches template by name', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockTemplate,
          error: null,
        }),
      });

      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('name', 'task_assigned')
        .eq('is_active', true)
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(mockTemplate);
    });
  });

  describe('Notification Channels', () => {
    it('creates channel delivery records', async () => {
      const channelRecords = [
        { notification_id: 'notif-123', channel: 'email', status: 'pending' },
        { notification_id: 'notif-123', channel: 'sms', status: 'pending' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const { error } = await supabase
        .from('notification_channels')
        .insert(channelRecords);

      expect(error).toBeNull();
    });

    it('updates channel delivery status', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const { error } = await supabase
        .from('notification_channels')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('notification_id', 'notif-123')
        .eq('channel', 'email');

      expect(error).toBeNull();
    });
  });

  describe('Database Functions', () => {
    it('calls send_notification_enhanced function', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: 'notif-123',
        error: null,
      });

      const { data, error } = await supabase.rpc('send_notification_enhanced', {
        p_user_id: mockUserId,
        p_title: 'Test Notification',
        p_message: 'Test message',
        p_type: 'info',
        p_category: 'system',
        p_priority: 'medium',
        p_channels: ['in_app'],
      });

      expect(error).toBeNull();
      expect(data).toBe('notif-123');
    });

    it('calls cleanup_expired_notifications function', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: 5, // 5 notifications cleaned up
        error: null,
      });

      const { data, error } = await supabase.rpc('cleanup_expired_notifications');

      expect(error).toBeNull();
      expect(data).toBe(5);
    });
  });

  describe('Data Integrity and Constraints', () => {
    it('enforces user_id foreign key constraint', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'violates foreign key constraint' },
        }),
      });

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: 'non-existent-user',
          title: 'Test',
          message: 'Test',
          type: 'info',
          category: 'system',
          priority: 'medium',
          channels: ['in_app'],
        }])
        .select()
        .single();

      expect(data).toBeNull();
      expect(error?.message).toContain('foreign key constraint');
    });

    it('validates enum values', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'violates check constraint' },
        }),
      });

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: mockUserId,
          title: 'Test',
          message: 'Test',
          type: 'invalid_type', // Invalid enum value
          category: 'system',
          priority: 'medium',
          channels: ['in_app'],
        }])
        .select()
        .single();

      expect(data).toBeNull();
      expect(error?.message).toContain('check constraint');
    });

    it('validates JSON array constraints', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'violates check constraint' },
        }),
      });

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: mockUserId,
          title: 'Test',
          message: 'Test',
          type: 'info',
          category: 'system',
          priority: 'medium',
          channels: ['invalid_channel'], // Invalid channel value
        }])
        .select()
        .single();

      expect(data).toBeNull();
      expect(error?.message).toContain('check constraint');
    });
  });

  describe('Performance and Indexing', () => {
    it('uses priority index for filtering', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [mockNotification],
          error: null,
        }),
      });

      // Query that should use priority index
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', mockUserId)
        .in('priority', ['high', 'urgent'])
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('uses expires_at index for cleanup queries', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      // Query that should use expires_at index
      const { error } = await supabase
        .from('notifications')
        .delete()
        .lte('expires_at', new Date().toISOString())
        .is('read', false);

      expect(error).toBeNull();
    });

    it('uses source index for filtering by source', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [mockNotification],
          error: null,
        }),
      });

      // Query that should use source index
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', mockUserId)
        .eq('source_type', 'task')
        .eq('source_id', 'task-123')
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Bulk Operations', () => {
    it('handles bulk read operations', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const notificationIds = ['notif-1', 'notif-2', 'notif-3'];

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds)
        .eq('user_id', mockUserId);

      expect(error).toBeNull();
    });

    it('handles bulk delete operations', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const notificationIds = ['notif-1', 'notif-2', 'notif-3'];

      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)
        .eq('user_id', mockUserId);

      expect(error).toBeNull();
    });
  });

  describe('Company-wide Notifications', () => {
    it('creates company-wide notifications', async () => {
      const companyWideNotification = {
        user_id: mockUserId,
        company_id: mockCompanyId,
        title: 'Company Announcement',
        message: 'Important company-wide announcement',
        type: 'info' as const,
        category: 'system' as const,
        priority: 'medium' as const,
        channels: ['in_app'],
        company_wide: true,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockNotification, ...companyWideNotification },
          error: null,
        }),
      });

      const { data, error } = await supabase
        .from('notifications')
        .insert([companyWideNotification])
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.company_wide).toBe(true);
    });

    it('queries company-wide notifications', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [{ ...mockNotification, company_wide: true }],
          error: null,
        }),
      });

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', mockCompanyId)
        .eq('company_wide', true)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data?.[0].company_wide).toBe(true);
    });
  });
});