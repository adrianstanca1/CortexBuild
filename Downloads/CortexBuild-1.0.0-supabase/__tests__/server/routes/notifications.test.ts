import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../api/notifications/enhanced';
import { supabase } from '../../../lib/supabase/client';

// Mock Supabase client
jest.mock('../../../lib/supabase/client', () => ({
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
  },
}));

// Mock email and SMS services
jest.mock('../../../api/notifications/email', () => ({
  sendNotificationEmail: jest.fn(),
}));

jest.mock('../../../api/notifications/sms', () => ({
  sendNotificationSMS: jest.fn(),
}));

describe('/api/notifications/enhanced', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      company_id: 'company-123',
    },
  };

  const mockNotification = {
    id: 'notif-123',
    user_id: 'user-123',
    company_id: 'company-123',
    title: 'Test Notification',
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
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('GET /api/notifications/enhanced', () => {
    it('returns notifications successfully', async () => {
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

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(mockNotifications);
      expect(responseData.pagination).toBeDefined();
    });

    it('applies read filter correctly', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { read: 'false' },
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      const supabaseFrom = supabase.from as jest.Mock;
      const selectMock = supabaseFrom.mock.results[0].value.select;
      const eqMock = selectMock.mock.results[0].value.eq;

      expect(eqMock).toHaveBeenCalledWith('read', false);
    });

    it('applies type filter correctly', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { type: 'info,warning' },
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      const supabaseFrom = supabase.from as jest.Mock;
      const selectMock = supabaseFrom.mock.results[0].value.select;
      const eqMock = selectMock.mock.results[0].value.eq;

      expect(eqMock).toHaveBeenCalledWith('type', ['info', 'warning']);
    });

    it('applies category filter correctly', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { category: 'system,task' },
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      const supabaseFrom = supabase.from as jest.Mock;
      const selectMock = supabaseFrom.mock.results[0].value.select;
      const eqMock = selectMock.mock.results[0].value.eq;

      expect(eqMock).toHaveBeenCalledWith('category', ['system', 'task']);
    });

    it('applies priority filter correctly', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { priority: 'high,urgent' },
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      const supabaseFrom = supabase.from as jest.Mock;
      const selectMock = supabaseFrom.mock.results[0].value.select;
      const eqMock = selectMock.mock.results[0].value.eq;

      expect(eqMock).toHaveBeenCalledWith('priority', ['high', 'urgent']);
    });

    it('applies date range filters correctly', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          date_from: '2024-01-01T00:00:00Z',
          date_to: '2024-12-31T23:59:59Z',
        },
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      const supabaseFrom = supabase.from as jest.Mock;
      const selectMock = supabaseFrom.mock.results[0].value.select;
      const eqMock = selectMock.mock.results[0].value.eq;
      const gteMock = selectMock.mock.results[0].value.gte;
      const lteMock = selectMock.mock.results[0].value.lte;

      expect(gteMock).toHaveBeenCalledWith('created_at', '2024-01-01T00:00:00Z');
      expect(lteMock).toHaveBeenCalledWith('created_at', '2024-12-31T23:59:59Z');
    });

    it('applies pagination correctly', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { limit: '10', offset: '20' },
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      const supabaseFrom = supabase.from as jest.Mock;
      const selectMock = supabaseFrom.mock.results[0].value.select;
      const rangeMock = selectMock.mock.results[0].value.range;

      expect(rangeMock).toHaveBeenCalledWith(20, 29); // offset to offset + limit - 1
    });

    it('includes summary when requested', async () => {
      const mockSummary = {
        total: 1,
        unread: 1,
        high_priority: 0,
        by_type: { info: 1 },
        by_category: { system: 1 },
        by_priority: { medium: 1 },
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: [mockNotification],
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [mockNotification],
            error: null,
          }),
        });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { include_summary: 'true' },
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.summary).toBeDefined();
    });

    it('handles database errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Database connection failed');
    });
  });

  describe('POST /api/notifications/enhanced', () => {
    const validNotificationRequest = {
      user_id: 'user-123',
      title: 'New Notification',
      message: 'This is a new notification',
      type: 'info',
      category: 'system',
      priority: 'medium',
      channels: ['in_app', 'email'],
    };

    it('creates notification successfully', async () => {
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
        });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: validNotificationRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(mockNotification);
    });

    it('uses template when provided', async () => {
      const mockTemplate = {
        id: 'template-123',
        name: 'task_assigned',
        title_template: 'Task Assigned: {task_name}',
        message_template: 'You have been assigned {task_name}',
        type: 'info',
        category: 'task',
        priority: 'medium',
        channels: ['in_app', 'email'],
        variables: { task_name: 'string' },
        is_active: true,
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockTemplate,
            error: null,
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
        });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: {
          ...validNotificationRequest,
          template_name: 'task_assigned',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
    });

    it('validates required fields', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: {
          title: 'Test Notification',
          // Missing user_id and message
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('User ID and message or template are required');
    });

    it('handles database insert errors', async () => {
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
            data: null,
            error: { message: 'Insert failed' },
          }),
        });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: validNotificationRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Insert failed');
    });
  });

  describe('PUT /api/notifications/enhanced', () => {
    const validUpdateRequest = {
      id: 'notif-123',
      updates: {
        read: true,
      },
    };

    it('updates notification successfully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockNotification, read: true },
          error: null,
        }),
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: validUpdateRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.read).toBe(true);
    });

    it('validates notification ID', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: {
          updates: { read: true },
          // Missing id
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Notification ID is required');
    });

    it('handles update errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: validUpdateRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Update failed');
    });
  });

  describe('DELETE /api/notifications/enhanced', () => {
    it('deletes notification successfully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: 'notif-123' },
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.message).toContain('deleted successfully');
    });

    it('validates notification ID', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: {}, // Missing id
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Notification ID is required');
    });

    it('handles delete errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: 'notif-123' },
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Delete failed');
    });
  });

  describe('Authentication', () => {
    it('requires authorization header', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        // Missing authorization header
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Authentication required');
    });

    it('validates JWT token', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Authentication required');
    });
  });

  describe('Unsupported Methods', () => {
    it('returns 405 for unsupported methods', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PATCH',
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Method not allowed');
    });
  });

  describe('Channel Delivery', () => {
    it('triggers email delivery for email channel', async () => {
      const { sendNotificationEmail } = require('../../../api/notifications/email');

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

      sendNotificationEmail.mockResolvedValue(true);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: {
          user_id: 'user-123',
          title: 'Email Notification',
          message: 'This should be sent via email',
          channels: ['email'],
        },
      });

      await handler(req, res);

      expect(sendNotificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Email Notification',
        expect.objectContaining({
          title: 'Email Notification',
          message: 'This should be sent via email',
        })
      );
    });

    it('triggers SMS delivery for SMS channel', async () => {
      const { sendNotificationSMS } = require('../../../api/notifications/sms');

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
            data: { phone: '+1234567890' },
            error: null,
          }),
        });

      sendNotificationSMS.mockResolvedValue(true);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: {
          user_id: 'user-123',
          title: 'SMS Notification',
          message: 'This should be sent via SMS',
          channels: ['sms'],
        },
      });

      await handler(req, res);

      expect(sendNotificationSMS).toHaveBeenCalledWith(
        '+1234567890',
        'This should be sent via SMS',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('handles unexpected errors gracefully', async () => {
      (supabase.auth.getUser as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Internal server error');
    });

    it('handles malformed request body', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer mock-token',
        },
        body: 'invalid json',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });
});