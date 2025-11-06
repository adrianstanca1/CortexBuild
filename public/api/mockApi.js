// CortexBuild Mock API for Development and Testing
// This file provides mock data and API responses for the developer console

/**
 * @typedef {Object} MockApiConfig
 * @property {number} [delay]
 * @property {number} [failureRate]
 * @property {boolean} [enableLogging]
 */

/**
 * @typedef {Object} MockResponse
 * @property {boolean} success
 * @property {*} data
 * @property {string} [message]
 * @property {string} timestamp
 * @property {string} requestId
 */

class MockApiService {
  constructor(config = {}) {
    this.config = {
      delay: 500,
      failureRate: 0.1,
      enableLogging: true,
      ...config
    };
    this.requestCounter = 0;
  }

  generateRequestId() {
    return `mock_${++this.requestCounter}_${Date.now()}`;
  }

  async simulateDelay() {
    if (this.config.delay && this.config.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.delay));
    }
  }

  shouldSimulateFailure() {
    return Math.random() < (this.config.failureRate || 0);
  }

  log(message, data) {
    if (this.config.enableLogging) {
      console.log(`[MockAPI] ${message}`, data || '');
    }
  }

  async get(endpoint, params) {
    const requestId = this.generateRequestId();
    this.log(`GET ${endpoint}`, params);

    await this.simulateDelay();

    if (this.shouldSimulateFailure()) {
      throw new Error(`Mock API: Simulated failure for ${endpoint}`);
    }

    // Mock data based on endpoint
    let mockData;
    switch (endpoint) {
      case '/projects':
        mockData = [
          { id: 1, name: 'Mock Project 1', status: 'active' },
          { id: 2, name: 'Mock Project 2', status: 'planning' }
        ];
        break;
      case '/tasks':
        mockData = [
          { id: 1, title: 'Mock Task 1', status: 'pending' },
          { id: 2, title: 'Mock Task 2', status: 'in_progress' }
        ];
        break;
      case '/users':
        mockData = [
          { id: 1, name: 'John Doe', role: 'admin' },
          { id: 2, name: 'Jane Smith', role: 'user' }
        ];
        break;
      default:
        mockData = { message: `Mock data for ${endpoint}` };
    }

    return {
      success: true,
      data: mockData,
      message: 'Mock API response',
      timestamp: new Date().toISOString(),
      requestId
    };
  }

  async post(endpoint, data) {
    const requestId = this.generateRequestId();
    this.log(`POST ${endpoint}`, data);

    await this.simulateDelay();

    if (this.shouldSimulateFailure()) {
      throw new Error(`Mock API: Simulated failure for ${endpoint}`);
    }

    return {
      success: true,
      data: { ...data, id: Math.random().toString(36).substr(2, 9) },
      message: 'Resource created successfully',
      timestamp: new Date().toISOString(),
      requestId
    };
  }

  async put(endpoint, data) {
    const requestId = this.generateRequestId();
    this.log(`PUT ${endpoint}`, data);

    await this.simulateDelay();

    if (this.shouldSimulateFailure()) {
      throw new Error(`Mock API: Simulated failure for ${endpoint}`);
    }

    return {
      success: true,
      data: data,
      message: 'Resource updated successfully',
      timestamp: new Date().toISOString(),
      requestId
    };
  }

  async delete(endpoint) {
    const requestId = this.generateRequestId();
    this.log(`DELETE ${endpoint}`);

    await this.simulateDelay();

    if (this.shouldSimulateFailure()) {
      throw new Error(`Mock API: Simulated failure for ${endpoint}`);
    }

    return {
      success: true,
      data: null,
      message: 'Resource deleted successfully',
      timestamp: new Date().toISOString(),
      requestId
    };
  }
}

// Create default instance
export const mockApi = new MockApiService();

// Export the class for custom configurations
export { MockApiService };

// Utility functions for testing
export const createMockApiWithConfig = (config) => {
  return new MockApiService(config);
};

export const resetMockApi = () => {
  // Reset any internal state if needed
  console.log('[MockAPI] Reset completed');
};

console.log('CortexBuild Mock API loaded successfully');
