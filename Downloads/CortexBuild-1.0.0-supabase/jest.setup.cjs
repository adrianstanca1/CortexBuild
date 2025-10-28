// Jest setup file for parallel processing tests
import { jest } from '@jest/globals';

// Mock external dependencies
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock AI response' } }],
          usage: { total_tokens: 100 }
        })
      }
    }
  }))
}));

jest.mock('better-sqlite3', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    prepare: jest.fn().mockReturnValue({
      all: jest.fn().mockReturnValue([]),
      get: jest.fn().mockReturnValue(null),
      run: jest.fn().mockReturnValue({}),
    }),
    exec: jest.fn(),
  }))
}));

// Global test utilities
global.testUtils = {
  createMockAgent: (name, result = 'success', delay = 10) => ({
    constructor: { name },
    executeParallel: jest.fn().mockImplementation(async (data) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return {
        agentType: name,
        result,
        executionTime: delay,
        success: result !== 'error',
        error: result === 'error' ? 'Mock error' : undefined,
      };
    }),
  }),

  createMockEvent: (type = 'test_event', data = {}) => ({
    id: `event_${Date.now()}`,
    agentType: 'test_agent',
    timestamp: new Date(),
    eventType: type,
    severity: 'medium',
    data,
  }),

  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};