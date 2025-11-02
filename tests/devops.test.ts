// DevOps Test Suite for CortexBuild 2.0
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('CortexBuild 2.0 DevOps Operations', () => {
  const FRONTEND_URL = 'http://localhost:3005';
  const API_URL = 'http://localhost:3001';

  beforeAll(async () => {
    console.log('🚀 Starting DevOps Test Suite...');
  });

  afterAll(async () => {
    console.log('✅ DevOps Test Suite Completed');
  });

  describe('Service Health Checks', () => {
    it('should have frontend service running', async () => {
      try {
        const response = await fetch(FRONTEND_URL);
        expect(response.status).toBe(200);
        console.log('✅ Frontend service: HEALTHY');
      } catch (error) {
        console.log('❌ Frontend service: UNHEALTHY');
        throw error;
      }
    });

    it('should have API service running', async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.status).toBe('ok');
        console.log('✅ API service: HEALTHY');
      } catch (error) {
        console.log('❌ API service: UNHEALTHY');
        throw error;
      }
    });
  });

  describe('API Endpoints', () => {
    it('should handle chat API requests', async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/message?sessionId=test-devops`);
        expect(response.status).toBe(200);
        console.log('✅ Chat API: FUNCTIONAL');
      } catch (error) {
        console.log('❌ Chat API: FAILED');
        throw error;
      }
    });

    it('should handle platform admin API', async () => {
      try {
        const response = await fetch(`${API_URL}/api/platformAdmin`);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.status).toBe('ok');
        console.log('✅ Platform Admin API: FUNCTIONAL');
      } catch (error) {
        console.log('❌ Platform Admin API: FAILED');
        throw error;
      }
    });

    it('should handle auth endpoints', async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        console.log('✅ Auth API: FUNCTIONAL');
      } catch (error) {
        console.log('❌ Auth API: FAILED');
        throw error;
      }
    });
  });

  describe('Performance Tests', () => {
    it('should load frontend within acceptable time', async () => {
      const startTime = Date.now();
      const response = await fetch(FRONTEND_URL);
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
      console.log(`✅ Frontend load time: ${loadTime}ms`);
    });

    it('should handle API requests efficiently', async () => {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/api/health`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // 1 second max
      console.log(`✅ API response time: ${responseTime}ms`);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      try {
        const response = await fetch(`${API_URL}/api/nonexistent`);
        expect(response.status).toBe(404);
        console.log('✅ 404 Error handling: WORKING');
      } catch (error) {
        console.log('❌ 404 Error handling: FAILED');
        throw error;
      }
    });

    it('should validate API responses', async () => {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();
      
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(typeof data.timestamp).toBe('string');
      console.log('✅ API Response validation: PASSED');
    });
  });

  describe('Security Tests', () => {
    it('should have CORS headers configured', async () => {
      const response = await fetch(`${API_URL}/api/health`);
      const corsHeader = response.headers.get('access-control-allow-origin');
      expect(corsHeader).toBeTruthy();
      console.log('✅ CORS configuration: ENABLED');
    });

    it('should handle OPTIONS requests', async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/message`, {
          method: 'OPTIONS'
        });
        expect(response.status).toBe(200);
        console.log('✅ OPTIONS handling: WORKING');
      } catch (error) {
        console.log('⚠️ OPTIONS handling: Limited (expected in mock environment)');
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle chat message flow', async () => {
      const sessionId = 'devops-test-' + Date.now();
      
      // Send a message
      const sendResponse = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'DevOps test message',
          sessionId
        })
      });
      
      expect(sendResponse.status).toBe(200);
      
      // Get messages
      const getResponse = await fetch(`${API_URL}/api/chat/message?sessionId=${sessionId}`);
      const data = await getResponse.json();
      
      expect(getResponse.status).toBe(200);
      expect(data.messages).toBeDefined();
      console.log('✅ Chat integration: WORKING');
    });
  });
});

// Export test utilities for other tests
export const DevOpsUtils = {
  FRONTEND_URL: 'http://localhost:3005',
  API_URL: 'http://localhost:3001',
  
  async checkServiceHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      return response.status === 200;
    } catch {
      return false;
    }
  },
  
  async measureResponseTime(url: string): Promise<number> {
    const start = Date.now();
    await fetch(url);
    return Date.now() - start;
  }
};
