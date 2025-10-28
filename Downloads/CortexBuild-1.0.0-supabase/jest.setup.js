/**
 * Jest Setup File
 * Provides global test utilities and mocks
 */

// Mock agent factory for parallel agent tests
const createMockAgent = (name, resultValue, executionTime = 10) => {
  return {
    constructor: { name },
    executeParallel: jest.fn().mockImplementation(async (data, sessionId) => {
      // Simulate async work
      await new Promise(resolve => setTimeout(resolve, executionTime));

      // Special handling for error results
      if (resultValue === 'error') {
        throw new Error('Mock error');
      }

      return {
        agentType: name,
        result: resultValue,
        executionTime,
        success: true,
        confidence: 0.85,
        metadata: {
          sessionId,
          timestamp: new Date().toISOString(),
        },
      };
    }),
  };
};

// Mock event for event distributor tests
const createMockEvent = (eventType, data = {}) => {
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
    priority: 'medium',
  };
};

// Mock aggregation function
const createMockAggregator = () => {
  return {
    aggregate: jest.fn().mockImplementation((results) => {
      if (!results || results.length === 0) {
        return null;
      }

      const successfulResults = results.filter(r => r.success);

      if (successfulResults.length === 0) {
        return {
          consensus: null,
          confidence: 0,
          summary: 'No successful results',
        };
      }

      // Calculate consensus (most common result)
      const resultCounts = {};
      successfulResults.forEach(r => {
        const key = JSON.stringify(r.result);
        resultCounts[key] = (resultCounts[key] || 0) + 1;
      });

      const sortedResults = Object.entries(resultCounts).sort((a, b) => b[1] - a[1]);
      const consensusKey = sortedResults[0][0];
      const consensusCount = sortedResults[0][1];

      return {
        consensus: JSON.parse(consensusKey),
        confidence: consensusCount / successfulResults.length,
        summary: `${consensusCount} out of ${successfulResults.length} agents agreed`,
        allResults: successfulResults.map(r => r.result),
      };
    }),
  };
};

// Add utilities to global scope
global.testUtils = {
  createMockAgent,
  createMockEvent,
  createMockAggregator,
};

// Mock console methods to reduce test noise (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup default test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
