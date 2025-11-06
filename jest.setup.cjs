// Jest setup file for CortexBuild tests

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.VITE_API_URL = 'http://localhost:3001/api';

// Mock import.meta for Vite
global.import = global.import || {};
global.import.meta = {
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_API_URL: 'http://localhost:3001/api',
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false
  }
};

// Mock window object for browser APIs
global.window = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
};


// Mock navigator
global.navigator = {
  onLine: true
};

// Mock console methods to reduce noise during tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  createMockResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data
  })
};
