/**
 * Rate Limiter Middleware Tests
 * Tests rate limiting functionality across different endpoint types
 */

import request from 'supertest';
import express from 'express';
import { createAuthRateLimiter, createGeneralRateLimiter, createAdminRateLimiter } from '../../../server/middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Authentication Rate Limiter', () => {
    beforeEach(() => {
      const authLimiter = createAuthRateLimiter();
      app.use('/auth', authLimiter.middleware());
      app.post('/auth/login', (req, res) => {
        res.json({ success: true, token: 'test-token' });
      });
    });

    it('should allow requests within limit', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers['x-ratelimit-limit']).toBe('5');
      expect(response.headers['x-ratelimit-remaining']).toBe('4');
    });

    it('should block requests exceeding limit', async () => {
      // Make 6 requests (exceeding limit of 5 per 15 minutes)
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'password' });
      }

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('RATE_LIMITED');
      expect(response.body.error).toContain('Too many authentication attempts');
    });
  });

  describe('General API Rate Limiter', () => {
    beforeEach(() => {
      const generalLimiter = createGeneralRateLimiter();
      app.use('/api', generalLimiter.middleware());
      app.get('/api/test', (req, res) => {
        res.json({ success: true, data: 'test' });
      });
    });

    it('should allow requests within limit', async () => {
      const response = await request(app)
        .get('/api/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers['x-ratelimit-limit']).toBe('100');
      expect(response.headers['x-ratelimit-remaining']).toBe('99');
    });

    it('should block requests exceeding limit', async () => {
      // Make 101 requests (exceeding limit of 100 per minute)
      for (let i = 0; i < 101; i++) {
        await request(app).get('/api/test');
      }

      const response = await request(app)
        .get('/api/test');

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('RATE_LIMITED');
      expect(response.body.error).toContain('Too many API requests');
    });
  });

  describe('Admin Rate Limiter', () => {
    beforeEach(() => {
      const adminLimiter = createAdminRateLimiter();
      app.use('/admin', adminLimiter.middleware());
      app.get('/admin/users', (req, res) => {
        res.json({ success: true, data: [] });
      });
    });

    it('should allow requests within limit', async () => {
      const response = await request(app)
        .get('/admin/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers['x-ratelimit-limit']).toBe('1000');
      expect(response.headers['x-ratelimit-remaining']).toBe('999');
    });

    it('should block requests exceeding limit', async () => {
      // Make 1001 requests (exceeding limit of 1000 per hour)
      for (let i = 0; i < 1001; i++) {
        await request(app).get('/admin/users');
      }

      const response = await request(app)
        .get('/admin/users');

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('RATE_LIMITED');
      expect(response.body.error).toContain('Admin API rate limit exceeded');
    });
  });

  describe('Rate Limit Headers', () => {
    beforeEach(() => {
      const limiter = createGeneralRateLimiter();
      app.use('/api', limiter.middleware());
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });
    });

    it('should include rate limit headers in response', async () => {
      const response = await request(app)
        .get('/api/test');

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should decrease remaining count with each request', async () => {
      const response1 = await request(app).get('/api/test');
      const response2 = await request(app).get('/api/test');

      const remaining1 = parseInt(response1.headers['x-ratelimit-remaining']);
      const remaining2 = parseInt(response2.headers['x-ratelimit-remaining']);

      expect(remaining2).toBe(remaining1 - 1);
    });
  });

  describe('Rate Limit Reset', () => {
    it('should reset rate limit after window expires', async () => {
      // This test would require mocking time or using a shorter window
      // For now, we'll test that the reset time is properly set
      const limiter = createGeneralRateLimiter();
      app.use('/api', limiter.middleware());
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/api/test');
      const resetTime = parseInt(response.headers['x-ratelimit-reset']);

      // Reset time is in milliseconds, not seconds
      expect(resetTime).toBeGreaterThan(Date.now());
      expect(resetTime).toBeLessThan(Date.now() + 70000); // Should reset within ~1 minute (70 seconds in ms)
    });
  });

  describe('Error Response Format', () => {
    beforeEach(() => {
      const limiter = createAuthRateLimiter();
      app.use('/auth', limiter.middleware());
      app.post('/auth/login', (req, res) => {
        res.json({ success: true });
      });
    });

    it('should return proper error format when rate limited', async () => {
      // Exceed rate limit
      for (let i = 0; i < 6; i++) {
        await request(app).post('/auth/login').send({ email: 'test@example.com' });
      }

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(429);
      expect(response.body).toMatchObject({
        success: false,
        code: 'RATE_LIMITED',
        error: expect.any(String),
        retryAfter: expect.any(Number),
        details: {
          limit: 5,
          windowMs: 15 * 60 * 1000,
          resetIn: expect.any(Number)
        }
      });
    });
  });
});
