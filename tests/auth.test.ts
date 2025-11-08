// Authentication System Tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Authentication System', () => {
  const API_BASE = 'http://localhost:3001';
  let authToken: string;

  beforeAll(async () => {
    console.log('🔐 Starting authentication tests...');
  });

  afterAll(async () => {
    console.log('✅ Authentication tests completed');
  });

  describe('Login Endpoint', () => {
    it('should reject login with missing credentials', async () => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should successfully login with valid credentials', async () => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@cortexbuild.com',
          password: 'demo-password'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('demo@cortexbuild.com');
      
      authToken = data.token;
    });
  });

  describe('Protected Endpoints', () => {
    it('should reject access without token', async () => {
      const response = await fetch(`${API_BASE}/api/chat/message?sessionId=test`);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should reject access with invalid token', async () => {
      const response = await fetch(`${API_BASE}/api/chat/message?sessionId=test`, {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should allow access with valid token', async () => {
      const response = await fetch(`${API_BASE}/api/chat/message?sessionId=test`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin access to admin endpoints', async () => {
      const response = await fetch(`${API_BASE}/api/platformAdmin`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should reject non-admin access to admin endpoints', async () => {
      // Login as regular user
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@cortexbuild.com',
          password: 'user-password'
        })
      });

      if (loginResponse.status === 200) {
        const loginData = await loginResponse.json();
        const userToken = loginData.token;

        const response = await fetch(`${API_BASE}/api/platformAdmin`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('permissions');
      }
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
      expect(response.headers.get('x-frame-options')).toBe('DENY');
      expect(response.headers.get('x-xss-protection')).toBe('1; mode=block');
    });

    it('should include CORS headers', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      
      expect(response.headers.get('access-control-allow-origin')).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should handle normal request volume', async () => {
      const promises = Array.from({ length: 10 }, () =>
        fetch(`${API_BASE}/api/health`)
      );
      
      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.status === 200).length;
      
      expect(successCount).toBe(10);
    });

    // Note: Rate limiting test would require many requests to trigger
    // This is a basic test to ensure the endpoint responds normally
  });
});
