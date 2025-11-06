/**
 * Comprehensive API Client Tests
 * Tests error handling, retry logic, offline queuing, and HTTP methods
 */

// Mock dependencies BEFORE importing
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../offlineManager');

import axios, { AxiosError } from 'axios';
import { APIClient, APIError, RetryConfig } from '../apiClient';
import offlineManager from '../offlineManager';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedOfflineManager = offlineManager as jest.Mocked<typeof offlineManager>;

describe('APIClient', () => {
  let apiClient: APIClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Create API client instance
    apiClient = new APIClient('/api');
  });

  afterEach(() => {
    // Reset localStorage
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('should setup request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should use custom retry configuration', () => {
      const customRetryConfig: Partial<RetryConfig> = {
        maxRetries: 5,
        retryDelay: 2000
      };

      const customClient = new APIClient('/api', customRetryConfig);
      expect(customClient).toBeInstanceOf(APIClient);
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      // Mock successful response
      mockAxiosInstance.get.mockResolvedValue({
        data: { success: true },
        status: 200,
        config: {}
      });
    });

    it('should perform GET request successfully', async () => {
      const result = await apiClient.get('/users');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', undefined);
      expect(result).toEqual({ success: true });
    });

    it('should perform POST request with data', async () => {
      const postData = { name: 'John', email: 'john@example.com' };

      mockAxiosInstance.post.mockResolvedValue({
        data: { id: 1, ...postData },
        status: 201,
        config: {}
      });

      const result = await apiClient.post('/users', postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', postData, undefined);
      expect(result).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
    });

    it('should perform PUT request with data and config', async () => {
      const putData = { name: 'Updated Name' };
      const config = { skipRetry: true };

      mockAxiosInstance.put.mockResolvedValue({
        data: { success: true },
        status: 200,
        config: {}
      });

      const result = await apiClient.put('/users/1', putData, config);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', putData, config);
      expect(result).toEqual({ success: true });
    });

    it('should perform DELETE request', async () => {
      mockAxiosInstance.delete.mockResolvedValue({
        data: { deleted: true },
        status: 204,
        config: {}
      });

      const result = await apiClient.delete('/users/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1', undefined);
      expect(result).toEqual({ deleted: true });
    });

    it('should perform PATCH request', async () => {
      const patchData = { status: 'active' };

      mockAxiosInstance.patch.mockResolvedValue({
        data: { updated: true },
        status: 200,
        config: {}
      });

      const result = await apiClient.patch('/users/1', patchData);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/1', patchData, undefined);
      expect(result).toEqual({ updated: true });
    });
  });

  describe('Error Handling', () => {
    it('should transform network errors correctly', async () => {
      const networkError = new AxiosError('Network Error');
      networkError.code = 'ECONNREFUSED';

      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(apiClient.get('/users')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection.',
        retryable: true
      });
    });

    it('should handle 400 Bad Request errors', async () => {
      const errorResponse = {
        status: 400,
        data: { message: 'Invalid input data' }
      };

      const axiosError = new AxiosError('Bad Request');
      axiosError.response = errorResponse;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/users')).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        userMessage: 'Invalid request. Please check your input.',
        statusCode: 400
      });
    });

    it('should handle 401 Unauthorized errors with redirect', async () => {
      const errorResponse = {
        status: 401,
        data: { message: 'Unauthorized' }
      };

      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = errorResponse;

      // Mock window.location
      delete (window as any).location;
      window.location = { pathname: '/dashboard' } as any;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/protected')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        userMessage: 'Session expired. Please log in again.',
        statusCode: 401
      });
    });

    it('should handle 403 Forbidden errors', async () => {
      const errorResponse = {
        status: 403,
        data: { message: 'Forbidden' }
      };

      const axiosError = new AxiosError('Forbidden');
      axiosError.response = errorResponse;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/admin')).rejects.toMatchObject({
        code: 'FORBIDDEN',
        userMessage: 'You don\'t have permission to perform this action.',
        statusCode: 403
      });
    });

    it('should handle 404 Not Found errors', async () => {
      const errorResponse = {
        status: 404,
        data: { message: 'Resource not found' }
      };

      const axiosError = new AxiosError('Not Found');
      axiosError.response = errorResponse;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/nonexistent')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        userMessage: 'The requested resource was not found.',
        statusCode: 404
      });
    });

    it('should handle 429 Rate Limit errors', async () => {
      const errorResponse = {
        status: 429,
        data: { message: 'Too many requests' }
      };

      const axiosError = new AxiosError('Rate Limited');
      axiosError.response = errorResponse;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/rate-limited')).rejects.toMatchObject({
        code: 'RATE_LIMIT',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        statusCode: 429
      });
    });

    it('should handle 500 Server Error', async () => {
      const errorResponse = {
        status: 500,
        data: { message: 'Internal server error' }
      };

      const axiosError = new AxiosError('Server Error');
      axiosError.response = errorResponse;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/error')).rejects.toMatchObject({
        code: 'SERVER_ERROR',
        userMessage: 'Server error. We\'re working on it.',
        statusCode: 500
      });
    });

    it('should handle offline queued errors', async () => {
      const offlineError = new Error('Request queued due to offline status');
      (offlineError as any).isOfflineQueued = true;
      (offlineError as any).requestId = 'req_123';

      mockAxiosInstance.get.mockRejectedValue(offlineError);

      await expect(apiClient.get('/offline')).rejects.toMatchObject({
        code: 'OFFLINE_QUEUED',
        userMessage: 'You are currently offline. Your request has been saved and will be sent when you reconnect.',
        retryable: false
      });
    });
  });

  describe('Retry Logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should retry on retryable status codes', async () => {
      const errorResponse = {
        status: 500,
        data: { message: 'Server error' }
      };

      const axiosError = new AxiosError('Server Error');
      axiosError.response = errorResponse;

      // First two calls fail, third succeeds
      mockAxiosInstance.get
        .mockRejectedValueOnce(axiosError)
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce({
          data: { success: true },
          status: 200,
          config: {}
        });

      const requestPromise = apiClient.get('/retry');

      // Fast-forward through retry delays
      jest.advanceTimersByTime(1000); // First retry delay
      await Promise.resolve(); // Allow promise to process

      jest.advanceTimersByTime(2000); // Second retry delay
      await Promise.resolve(); // Allow promise to process

      const result = await requestPromise;

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });

    it('should not retry on non-retryable status codes', async () => {
      const errorResponse = {
        status: 400,
        data: { message: 'Bad request' }
      };

      const axiosError = new AxiosError('Bad Request');
      axiosError.response = errorResponse;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/no-retry')).rejects.toMatchObject({
        code: 'BAD_REQUEST'
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should not retry when skipRetry is true', async () => {
      const errorResponse = {
        status: 500,
        data: { message: 'Server error' }
      };

      const axiosError = new AxiosError('Server Error');
      axiosError.response = errorResponse;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/no-retry', { skipRetry: true })).rejects.toMatchObject({
        code: 'SERVER_ERROR'
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should use exponential backoff for retry delays', async () => {
      const errorResponse = {
        status: 500,
        data: { message: 'Server error' }
      };

      const axiosError = new AxiosError('Server Error');
      axiosError.response = errorResponse;

      // Always fail to test retry delays
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      const requestPromise = apiClient.get('/always-fail');

      // Check that delays increase exponentially
      const delays = [1000, 2000, 4000]; // Expected delays with jitter

      for (const delay of delays) {
        jest.advanceTimersByTime(delay);
        await Promise.resolve();
      }

      await expect(requestPromise).rejects.toMatchObject({
        code: 'SERVER_ERROR'
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('Offline Handling', () => {
    beforeEach(() => {
      // Mock offline status
      mockedOfflineManager.checkOnlineStatus.mockReturnValue(false);
      mockedOfflineManager.queueRequest.mockResolvedValue('req_123');
    });

    it('should queue requests when offline', async () => {
      const requestPromise = apiClient.get('/offline-request');

      await expect(requestPromise).rejects.toMatchObject({
        code: 'OFFLINE_QUEUED',
        userMessage: 'You are currently offline. Your request has been saved and will be sent when you reconnect.'
      });

      expect(mockedOfflineManager.queueRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/offline-request',
        data: undefined,
        headers: expect.any(Object),
        priority: 'normal',
        config: expect.any(Object)
      });
    });

    it('should set correct priority for auth requests', async () => {
      const requestPromise = apiClient.post('/auth/login', { username: 'test' });

      await expect(requestPromise).rejects.toMatchObject({
        code: 'OFFLINE_QUEUED'
      });

      expect(mockedOfflineManager.queueRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'high' // Auth requests should have high priority
        })
      );
    });
  });

  describe('Authentication', () => {
    it('should add auth token to requests when available', async () => {
      const token = 'test-token-123';
      localStorage.setItem('constructai_token', token);

      mockAxiosInstance.get.mockResolvedValue({
        data: { success: true },
        status: 200,
        config: {}
      });

      await apiClient.get('/protected');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/protected', undefined);
      // The interceptor should have added the Authorization header
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it('should not add auth token when not available', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { success: true },
        status: 200,
        config: {}
      });

      await apiClient.get('/public');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/public', undefined);
    });
  });

  describe('Statistics', () => {
    it('should track request and failure counts', async () => {
      mockAxiosInstance.get
        .mockResolvedValueOnce({
          data: { success: true },
          status: 200,
          config: {}
        })
        .mockRejectedValueOnce(new AxiosError('Network Error'));

      // Successful request
      await apiClient.get('/success');

      // Failed request
      try {
        await apiClient.get('/fail');
      } catch (error) {
        // Expected to fail
      }

      const stats = apiClient.getStats();

      expect(stats.totalRequests).toBe(2);
      expect(stats.totalFailures).toBe(1);
      expect(stats.successRate).toBe(50);
    });

    it('should reset statistics', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { success: true },
        status: 200,
        config: {}
      });

      await apiClient.get('/test');
      expect(apiClient.getStats().totalRequests).toBe(1);

      apiClient.resetStats();
      expect(apiClient.getStats().totalRequests).toBe(0);
      expect(apiClient.getStats().totalFailures).toBe(0);
    });
  });

  describe('Request Configuration', () => {
    it('should pass custom timeout configuration', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { success: true },
        status: 200,
        config: {}
      });

      const config = { customTimeout: 5000 };
      await apiClient.get('/test', config);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', config);
    });

    it('should skip error toast when configured', async () => {
      const axiosError = new AxiosError('Server Error');
      axiosError.response = { status: 500, data: {} };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/error', { skipErrorToast: true })).rejects.toMatchObject({
        code: 'SERVER_ERROR'
      });

      // Toast should not be shown when skipErrorToast is true
      // This would be tested by mocking react-hot-toast
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed error responses gracefully', async () => {
      const malformedError = new AxiosError('Malformed Error');
      malformedError.response = null; // Malformed response

      mockAxiosInstance.get.mockRejectedValue(malformedError);

      await expect(apiClient.get('/malformed')).rejects.toMatchObject({
        code: 'UNKNOWN_ERROR',
        userMessage: 'An unexpected error occurred. Please try again.'
      });
    });

    it('should handle empty error data', async () => {
      const errorResponse = {
        status: 400,
        data: null
      };

      const axiosError = new AxiosError('Empty Error');
      axiosError.response = errorResponse;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(apiClient.get('/empty')).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        userMessage: 'Invalid request. Please check your input.'
      });
    });

    it('should handle very large retry counts', async () => {
      const errorResponse = {
        status: 500,
        data: { message: 'Server error' }
      };

      const axiosError = new AxiosError('Server Error');
      axiosError.response = errorResponse;

      // Always fail
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      const requestPromise = apiClient.get('/always-fail');

      // Advance through all retry attempts
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(10000);
        await Promise.resolve();
      }

      await expect(requestPromise).rejects.toMatchObject({
        code: 'SERVER_ERROR'
      });

      // Should have been called initial + maxRetries times
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });
  });
});
