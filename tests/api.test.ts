// API Integration Tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('API Integration Tests', () => {
  const API_BASE = 'http://localhost:3001';
  let authToken: string;

  beforeAll(async () => {
    console.log('🔌 Starting API integration tests...');
    
    // Get authentication token
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@cortexbuild.com',
        password: 'demo-password'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      authToken = data.token;
    }
  });

  afterAll(async () => {
    console.log('✅ API integration tests completed');
  });

  describe('Health Check API', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
      expect(data.service).toContain('API Server');
    });

    it('should respond within acceptable time', async () => {
      const startTime = Date.now();
      const response = await fetch(`${API_BASE}/api/health`);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('Chat API', () => {
    const sessionId = 'test-session-' + Date.now();

    it('should get empty messages for new session', async () => {
      const response = await fetch(`${API_BASE}/api/chat/message?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.messages).toEqual([]);
    });

    it('should send a chat message', async () => {
      const response = await fetch(`${API_BASE}/api/chat/message?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: 'Hello, this is a test message'
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
    });

    it('should validate message length', async () => {
      const longMessage = 'a'.repeat(1001); // Over 1000 character limit
      
      const response = await fetch(`${API_BASE}/api/chat/message?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: longMessage
        })
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('too long');
    });

    it('should require message content', async () => {
      const response = await fetch(`${API_BASE}/api/chat/message?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({})
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });
  });

  describe('Platform Admin API', () => {
    it('should access admin endpoint with admin token', async () => {
      const response = await fetch(`${API_BASE}/api/platformAdmin`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Platform Admin');
      expect(data.user).toBeDefined();
    });

    it('should handle POST requests to admin endpoint', async () => {
      const testData = { action: 'test', value: 123 };
      
      const response = await fetch(`${API_BASE}/api/platformAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testData)
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(testData);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await fetch(`${API_BASE}/api/nonexistent`);
      
      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });
      
      expect(response.status).toBe(400);
    });

    it('should handle missing Content-Type header', async () => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password'
        })
      });
      
      // Should still work or return appropriate error
      expect([400, 401, 415, 500]).toContain(response.status);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 20 }, () =>
        fetch(`${API_BASE}/api/health`)
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBe(20);
      expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds
    });

    it('should maintain performance under load', async () => {
      const iterations = 5;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        const response = await fetch(`${API_BASE}/api/health`);
        const endTime = Date.now();
        
        expect(response.status).toBe(200);
        times.push(endTime - startTime);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(500); // Average less than 500ms
    });
  });
});
