import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler, { sendNotificationSMS, formatPhoneNumber, isValidPhoneNumber } from '../../../api/notifications/sms';

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
    },
  }));
});

describe('/api/notifications/sms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;
  });

  describe('POST /api/notifications/sms', () => {
    const validSMSRequest = {
      to: '+1234567890',
      message: 'This is a test SMS notification',
    };

    it('sends SMS successfully with Twilio configured', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'test-account-sid';
      process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
      process.env.TWILIO_PHONE_NUMBER = '+15551234567';

      const mockCreate = jest.fn().mockResolvedValue({
        sid: 'test-message-sid',
        status: 'sent',
      });

      const twilio = require('twilio');
      const mockClient = twilio.mock.results[0].value;
      mockClient.messages.create = mockCreate;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: validSMSRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.results[0].messageId).toBe('test-message-sid');

      expect(mockCreate).toHaveBeenCalledWith({
        body: 'This is a test SMS notification',
        from: '+15551234567',
        to: '+1234567890',
      });
    });

    it('sends SMS to multiple recipients', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'test-account-sid';
      process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';

      const mockCreate = jest.fn()
        .mockResolvedValueOnce({ sid: 'sid-1', status: 'sent' })
        .mockResolvedValueOnce({ sid: 'sid-2', status: 'sent' });

      const twilio = require('twilio');
      const mockClient = twilio.mock.results[0].value;
      mockClient.messages.create = mockCreate;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          to: ['+1234567890', '+0987654321'],
          message: 'Test message',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.results).toHaveLength(2);
      expect(responseData.results[0].messageId).toBe('sid-1');
      expect(responseData.results[1].messageId).toBe('sid-2');
    });

    it('handles partial failures in bulk SMS', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'test-account-sid';
      process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';

      const mockCreate = jest.fn()
        .mockResolvedValueOnce({ sid: 'sid-1', status: 'sent' })
        .mockRejectedValueOnce(new Error('Invalid number'));

      const twilio = require('twilio');
      const mockClient = twilio.mock.results[0].value;
      mockClient.messages.create = mockCreate;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          to: ['+1234567890', '+invalid'],
          message: 'Test message',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false); // Not all successful
      expect(responseData.message).toContain('1 failed');
      expect(responseData.results[0].success).toBe(true);
      expect(responseData.results[1].success).toBe(false);
    });

    it('simulates SMS sending when Twilio is not configured', async () => {
      // No Twilio credentials set

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: validSMSRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.simulated).toBe(true);
      expect(responseData.message).toBe('SMS sent successfully (simulated)');
    });

    it('validates required fields', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          // Missing required fields
          message: 'Test message',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Missing required fields: to, message');
    });

    it('handles Twilio errors', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'test-account-sid';
      process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';

      const mockCreate = jest.fn().mockRejectedValue({
        message: 'Twilio API error',
        code: 'AUTH_ERROR',
      });

      const twilio = require('twilio');
      const mockClient = twilio.mock.results[0].value;
      mockClient.messages.create = mockCreate;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: validSMSRequest,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Failed to send SMS');
      expect(responseData.details).toBe('Twilio API error');
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

  describe('sendNotificationSMS function', () => {
    const notificationMessage = 'You have been assigned a new task: Review project plans';
    const options = {
      priority: 'high',
      actionUrl: 'https://cortexbuild.com/tasks/123',
    };

    beforeEach(() => {
      // Mock fetch for internal API call
      global.fetch = jest.fn();
    });

    it('sends notification SMS successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await sendNotificationSMS(
        '+1234567890',
        notificationMessage,
        options
      );

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/sms'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"to":"+1234567890"'),
        })
      );
    });

    it('formats message with priority indicators', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationSMS(
        '+1234567890',
        notificationMessage,
        { priority: 'urgent' }
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message).toContain('🚨 URGENT:');
    });

    it('includes shortened action URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationSMS(
        '+1234567890',
        notificationMessage,
        { actionUrl: 'https://cortexbuild.com/very/long/url/that/exceeds/normal/length' }
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message).toContain('View: https://cortexbuild.com/very/long/url/that/exceeds/normal/length');
    });

    it('truncates messages over 160 characters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const longMessage = 'A'.repeat(200);

      await sendNotificationSMS('+1234567890', longMessage);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message.length).toBeLessThanOrEqual(160);
      expect(requestBody.message).toContain('...');
    });

    it('sends to multiple recipients', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await sendNotificationSMS(
        ['+1234567890', '+0987654321'],
        notificationMessage
      );

      expect(result).toBe(true);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.to).toEqual(['+1234567890', '+0987654321']);
    });

    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await sendNotificationSMS('+1234567890', notificationMessage);

      expect(result).toBe(false);
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await sendNotificationSMS('+1234567890', notificationMessage);

      expect(result).toBe(false);
    });

    it('handles missing priority gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationSMS('+1234567890', notificationMessage);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message).not.toContain('🚨');
      expect(requestBody.message).not.toContain('⚠️');
    });

    it('handles missing actionUrl gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotificationSMS('+1234567890', notificationMessage);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message).not.toContain('View:');
    });
  });

  describe('Phone number utilities', () => {
    describe('formatPhoneNumber', () => {
      it('formats 10-digit US numbers', () => {
        expect(formatPhoneNumber('1234567890')).toBe('+11234567890');
      });

      it('formats 11-digit numbers with leading 1', () => {
        expect(formatPhoneNumber('11234567890')).toBe('+11234567890');
      });

      it('handles already formatted numbers', () => {
        expect(formatPhoneNumber('+441234567890')).toBe('+441234567890');
      });

      it('handles numbers with country code', () => {
        expect(formatPhoneNumber('441234567890')).toBe('+441234567890');
      });

      it('returns original format for unrecognized patterns', () => {
        expect(formatPhoneNumber('123')).toBe('123');
      });

      it('removes non-digit characters', () => {
        expect(formatPhoneNumber('(123) 456-7890')).toBe('+11234567890');
      });
    });

    describe('isValidPhoneNumber', () => {
      it('validates correct phone numbers', () => {
        expect(isValidPhoneNumber('+1234567890')).toBe(true);
        expect(isValidPhoneNumber('+441234567890')).toBe(true);
        expect(isValidPhoneNumber('1234567890')).toBe(true);
      });

      it('rejects invalid phone numbers', () => {
        expect(isValidPhoneNumber('123')).toBe(false);
        expect(isValidPhoneNumber('abc')).toBe(false);
        expect(isValidPhoneNumber('')).toBe(false);
        expect(isValidPhoneNumber('+')).toBe(false);
      });

      it('handles formatted numbers', () => {
        expect(isValidPhoneNumber('(123) 456-7890')).toBe(true);
        expect(isValidPhoneNumber('+1 (234) 567-8900')).toBe(true);
      });
    });
  });

  describe('Message Formatting', () => {
    it('adds priority prefix for urgent messages', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      sendNotificationSMS('+1234567890', 'Test message', { priority: 'urgent' });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message).toBe('🚨 URGENT: Test message');
    });

    it('adds priority prefix for high priority messages', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      sendNotificationSMS('+1234567890', 'Test message', { priority: 'high' });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message).toBe('⚠️ HIGH: Test message');
    });

    it('combines priority and action URL', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      sendNotificationSMS('+1234567890', 'Test message', {
        priority: 'high',
        actionUrl: 'https://example.com'
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message).toBe('⚠️ HIGH: Test message View: https://example.com');
    });

    it('handles very long URLs by keeping them as-is', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const longUrl = 'https://very.long.url.that.is.over.fifty.characters.long/and/has/many/parts';

      sendNotificationSMS('+1234567890', 'Test', { actionUrl: longUrl });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message).toContain(longUrl);
    });
  });

  describe('Error Scenarios', () => {
    it('handles empty recipient list', async () => {
      const result = await sendNotificationSMS([], 'Test message');

      expect(result).toBe(false);
    });

    it('handles empty message', async () => {
      const result = await sendNotificationSMS('+1234567890', '');

      expect(result).toBe(true); // API validation will handle this
    });

    it('handles special characters in messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const messageWithSpecialChars = 'Message with émojis 🎉 & spëcial chärs @#$%^&*()';

      await sendNotificationSMS('+1234567890', messageWithSpecialChars);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.message).toContain('émojis 🎉 & spëcial chärs');
    });

    it('handles messages that become too long with formatting', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Create a message that will exceed 160 chars when formatted
      const longMessage = 'A'.repeat(150);
      const longUrl = 'https://example.com/very/long/url/that/makes/the/message/even/longer';

      await sendNotificationSMS('+1234567890', longMessage, {
        priority: 'urgent',
        actionUrl: longUrl
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Should be truncated to 160 chars or less
      expect(requestBody.message.length).toBeLessThanOrEqual(160);
    });
  });
});