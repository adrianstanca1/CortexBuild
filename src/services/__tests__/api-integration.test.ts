/**
 * API Integration Tests
 * Tests real API client with Supabase backend
 */

// Mock Supabase for authentication
jest.mock('../../../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
            user: { id: 'test-user-id' }
          }
        },
        error: null
      })
    }
  }
}));

import apiClient, { ApiRequest } from '../apiClient';

describe('API Client Integration Tests', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = jest.fn();
  });

  describe('Real API Calls', () => {
    it('should make authenticated GET requests', async () => {
      const mockResponse = {
        projects: [
          { id: 1, name: 'Test Project', status: 'active' }
        ],
        total: 1
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      });

      const response = await apiClient.get('/api/projects');

      expect(response.error).toBeUndefined();
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/api/projects',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should make authenticated POST requests with data', async () => {
      const requestData = {
        name: 'New Project',
        description: 'Test project creation'
      };

      const mockResponse = {
        id: 123,
        ...requestData,
        created_at: new Date().toISOString()
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      });

      const response = await apiClient.post('/api/projects', requestData);

      expect(response.error).toBeUndefined();
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(201);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/api/projects',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify(requestData)
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Project not found' })
      });

      const response = await apiClient.get('/api/projects/999');

      expect(response.error).toBe('Project not found');
      expect(response.status).toBe(404);
      expect(response.data).toEqual({ error: 'Project not found' });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network request failed')
      );

      const response = await apiClient.get('/api/projects');

      expect(response.error).toBe('Network request failed');
      expect(response.status).toBe(0);
      expect(response.data).toBeUndefined();
    });

    it('should handle timeouts', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('The operation was aborted')), 100)
        )
      );

      const response = await apiClient.get('/api/projects', { timeout: 50 });

      expect(response.error).toContain('aborted');
      expect(response.status).toBe(0);
    });

    it('should handle different content types', async () => {
      // Test plain text response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'Plain text response'
      });

      const response = await apiClient.get('/api/status');

      expect(response.data).toBe('Plain text response');
      expect(response.error).toBeUndefined();
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => 'invalid json'
      });

      const response = await apiClient.get('/api/data');

      expect(response.data).toBe('invalid json'); // Should return text if JSON parsing fails
      expect(response.error).toBeUndefined();
    });
  });

  describe('Request Configuration', () => {
    it('should use custom headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true })
      });

      const customHeaders = {
        'X-Custom-Header': 'custom-value',
        'X-API-Version': 'v2'
      };

      await apiClient.get('/api/test', { headers: customHeaders });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
            'X-Custom-Header': 'custom-value',
            'X-API-Version': 'v2'
          })
        })
      );
    });

    it('should handle PUT and DELETE methods', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true })
      });

      // Test PUT
      await apiClient.put('/api/projects/1', { name: 'Updated' });
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' })
        })
      );

      // Test DELETE
      await apiClient.delete('/api/projects/1');
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should handle PATCH method', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true })
      });

      await apiClient.patch('/api/projects/1', { status: 'completed' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' })
        })
      );
    });
  });

  describe('Authentication Integration', () => {
    it('should include auth token in all requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: 'success' })
      });

      await apiClient.get('/api/protected');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should handle authentication failures', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Unauthorized' })
      });

      const response = await apiClient.get('/api/protected');

      expect(response.error).toBe('Unauthorized');
      expect(response.status).toBe(401);
    });
  });
});
