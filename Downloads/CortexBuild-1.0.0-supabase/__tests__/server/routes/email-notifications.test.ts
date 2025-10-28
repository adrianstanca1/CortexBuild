import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler, { sendNotificationEmail } from '../../../api/notifications/email';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  default: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
}));

describe('/api/notifications/email', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.SENDGRID_API_KEY;
    delete process.env.FROM_EMAIL;
  });

  describe('POST /api/notifications/email', () => {
    const validEmailRequest = {
      to: 'recipient@example.com',
      subject: 'Test Notification',
      html: '<h1>Test Email</h1><p>This is a test notification email.</p>',
      text: 'Test Email\n\nThis is a test notification email.',
    };

    it('sends email successfully with SendGrid configured', async () => {
      process.env.SENDGRID_API_KEY = 'test-api-key';
      process.env.FROM_EMAIL = 'noreply@cortexbuild.com';

      const mockSend = jest.fn().mockResolvedValue([
        {
          headers: {
            'x-message-id': 'test-message-id',
          },
        },
      ]);

      const sgMail = require('@sendgrid/mail').default;
      sgMail.mockImplementation(() => ({
        send: mockSend,
      }));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: validEmailRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.messageId).toBe('test-message-id');

      expect(mockSend).toHaveBeenCalledWith({
        to: ['recipient@example.com'],
        from: 'noreply@cortexbuild.com',
        subject: 'Test Notification',
        html: validEmailRequest.html,
        text: validEmailRequest.text,
        cc: undefined,
        bcc: undefined,
        attachments: undefined,
      });
    });

    it('sends email to multiple recipients', async () => {
      process.env.SENDGRID_API_KEY = 'test-api-key';
      process.env.FROM_EMAIL = 'noreply@cortexbuild.com';

      const mockSend = jest.fn().mockResolvedValue([{}]);

      const sgMail = require('@sendgrid/mail').default;
      sgMail.mockImplementation(() => ({
        send: mockSend,
      }));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          ...validEmailRequest,
          to: ['recipient1@example.com', 'recipient2@example.com'],
        },
      });

      await handler(req, res);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['recipient1@example.com', 'recipient2@example.com'],
        })
      );
    });

    it('includes CC and BCC recipients', async () => {
      process.env.SENDGRID_API_KEY = 'test-api-key';

      const mockSend = jest.fn().mockResolvedValue([{}]);

      const sgMail = require('@sendgrid/mail').default;
      sgMail.mockImplementation(() => ({
        send: mockSend,
      }));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          ...validEmailRequest,
          cc: ['cc@example.com'],
          bcc: ['bcc@example.com'],
        },
      });

      await handler(req, res);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          cc: ['cc@example.com'],
          bcc: ['bcc@example.com'],
        })
      );
    });

    it('includes attachments', async () => {
      process.env.SENDGRID_API_KEY = 'test-api-key';

      const mockSend = jest.fn().mockResolvedValue([{}]);

      const sgMail = require('@sendgrid/mail').default;
      sgMail.mockImplementation(() => ({
        send: mockSend,
      }));

      const attachments = [
        {
          filename: 'test.pdf',
          content: 'base64content',
          type: 'application/pdf',
        },
      ];

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          ...validEmailRequest,
          attachments,
        },
      });

      await handler(req, res);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: [
            {
              filename: 'test.pdf',
              content: 'base64content',
              type: 'application/pdf',
              disposition: 'attachment',
            },
          ],
        })
      );
    });

    it('simulates email sending when SendGrid is not configured', async () => {
      // No SENDGRID_API_KEY set

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: validEmailRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.simulated).toBe(true);
      expect(responseData.message).toBe('Email sent successfully (simulated)');
    });

    it('validates required fields', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          // Missing required fields
          subject: 'Test Subject',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Missing required fields: to, subject, html');
    });

    it('handles SendGrid errors', async () => {
      process.env.SENDGRID_API_KEY = 'test-api-key';

      const mockSend = jest.fn().mockRejectedValue({
        message: 'SendGrid API error',
        code: 'AUTH_ERROR',
      });

      const sgMail = require('@sendgrid/mail').default;
      sgMail.mockImplementation(() => ({
        send: mockSend,
      }));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: validEmailRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Failed to send email');
      expect(responseData.details).toBe('SendGrid API error');
      expect(responseData.code).toBe('AUTH_ERROR');
    });

    it('rejects non-POST methods', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Method not allowed');
    });
  });

  describe('sendNotificationEmail function', () => {
    const notificationContent = {
      title: 'Task Assigned',
      message: 'You have been assigned a new task: Review project plans',
      actionUrl: 'https://cortexbuild.com/tasks/123',
      priority: 'high',
    };

    beforeEach(() => {
      // Mock fetch for internal API call
      global.fetch = jest.fn();
    });

    it('sends notification email successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await sendNotificationEmail(
        'recipient@example.com',
        'Task Assigned',
        notificationContent
      );

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/email'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"to":"recipient@example.com"'),
        })
      );
    });

    it('formats email with priority indicators', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationEmail(
        'recipient@example.com',
        'Urgent Task',
        {
          ...notificationContent,
          priority: 'urgent',
        }
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.html).toContain('🚨 URGENT');
      expect(requestBody.html).toContain('priority-urgent');
    });

    it('includes action button when actionUrl is provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationEmail(
        'recipient@example.com',
        'Task Assigned',
        notificationContent
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.html).toContain('View Details');
      expect(requestBody.html).toContain('https://cortexbuild.com/tasks/123');
    });

    it('sends to multiple recipients', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await sendNotificationEmail(
        ['recipient1@example.com', 'recipient2@example.com'],
        'Task Assigned',
        notificationContent
      );

      expect(result).toBe(true);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.to).toEqual(['recipient1@example.com', 'recipient2@example.com']);
    });

    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await sendNotificationEmail(
        'recipient@example.com',
        'Task Assigned',
        notificationContent
      );

      expect(result).toBe(false);
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await sendNotificationEmail(
        'recipient@example.com',
        'Task Assigned',
        notificationContent
      );

      expect(result).toBe(false);
    });

    it('generates proper HTML email template', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationEmail(
        'recipient@example.com',
        'Task Assigned',
        notificationContent
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.html).toContain('<!DOCTYPE html>');
      expect(requestBody.html).toContain('CortexBuild');
      expect(requestBody.html).toContain('Task Assigned');
      expect(requestBody.html).toContain('You have been assigned a new task: Review project plans');
      expect(requestBody.html).toContain('View Details');
    });

    it('generates text fallback', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationEmail(
        'recipient@example.com',
        'Task Assigned',
        notificationContent
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.text).toContain('Task Assigned');
      expect(requestBody.text).toContain('You have been assigned a new task: Review project plans');
      expect(requestBody.text).toContain('View: https://cortexbuild.com/tasks/123');
    });

    it('handles missing priority gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const contentWithoutPriority = {
        title: 'Task Assigned',
        message: 'You have been assigned a new task',
      };

      await sendNotificationEmail(
        'recipient@example.com',
        'Task Assigned',
        contentWithoutPriority
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.html).not.toContain('priority-');
    });

    it('handles missing actionUrl gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const contentWithoutUrl = {
        title: 'Task Assigned',
        message: 'You have been assigned a new task',
      };

      await sendNotificationEmail(
        'recipient@example.com',
        'Task Assigned',
        contentWithoutUrl
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.html).not.toContain('View Details');
      expect(requestBody.text).not.toContain('View:');
    });
  });

  describe('Email Template Features', () => {
    it('includes proper CSS styling', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationEmail(
        'recipient@example.com',
        'Test',
        { title: 'Test', message: 'Test message' }
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.html).toContain('font-family: -apple-system');
      expect(requestBody.html).toContain('background-color: #f5f5f5');
      expect(requestBody.html).toContain('color: #4F46E5'); // Logo color
    });

    it('includes footer with unsubscribe information', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationEmail(
        'recipient@example.com',
        'Test',
        { title: 'Test', message: 'Test message' }
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.html).toContain('notification system');
      expect(requestBody.html).toContain('update your preferences');
    });

    it('handles special characters in content', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const specialContent = {
        title: 'Notification with émojis 🎉 & spëcial chärs',
        message: 'Message with symbols: @#$%^&*() and quotes "test"',
      };

      await sendNotificationEmail(
        'recipient@example.com',
        specialContent.title,
        specialContent
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.html).toContain('émojis 🎉 & spëcial chärs');
      expect(requestBody.html).toContain('@#$%^&*()');
      expect(requestBody.html).toContain('"test"');
    });
  });

  describe('Error Scenarios', () => {
    it('handles empty recipient list', async () => {
      const result = await sendNotificationEmail(
        [],
        'Test',
        { title: 'Test', message: 'Test' }
      );

      expect(result).toBe(false);
    });

    it('handles invalid email addresses gracefully', async () => {
      // This would be handled by SendGrid validation, but we test the API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await sendNotificationEmail(
        'invalid-email',
        'Test',
        { title: 'Test', message: 'Test' }
      );

      // The function itself doesn't validate email format
      expect(result).toBe(true);
    });

    it('handles very long messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const longMessage = 'A'.repeat(10000);
      const content = {
        title: 'Long Message',
        message: longMessage,
      };

      const result = await sendNotificationEmail(
        'recipient@example.com',
        'Long Message',
        content
      );

      expect(result).toBe(true);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.html).toContain(longMessage);
      expect(requestBody.text).toContain(longMessage);
    });
  });
});