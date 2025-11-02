// Test Setup Configuration
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3002',
    origin: 'http://localhost:3002',
    protocol: 'http:',
    host: 'localhost:3002',
    hostname: 'localhost',
    port: '3002',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  localStorageMock.clear.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  
  // Reset localStorage mock implementation
  localStorageMock.getItem.mockImplementation((key: string) => {
    return localStorageMock[key] || null;
  });
  
  localStorageMock.setItem.mockImplementation((key: string, value: string) => {
    localStorageMock[key] = value;
  });
  
  localStorageMock.removeItem.mockImplementation((key: string) => {
    delete localStorageMock[key];
  });
  
  localStorageMock.clear.mockImplementation(() => {
    Object.keys(localStorageMock).forEach(key => {
      if (typeof localStorageMock[key] === 'string') {
        delete localStorageMock[key];
      }
    });
  });
  
  // Mock fetch with default success response
  (global.fetch as any).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ success: true }),
    text: async () => 'OK',
    headers: new Headers(),
  });
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});

// Suppress console errors and warnings in tests unless they're expected
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Only log errors that are not expected React testing errors
    const message = args[0];
    if (
      typeof message === 'string' &&
      !message.includes('Warning: ReactDOM.render is no longer supported') &&
      !message.includes('Warning: An invalid form control') &&
      !message.includes('Error: Not implemented: HTMLCanvasElement.prototype.getContext')
    ) {
      originalConsoleError(...args);
    }
  };
  
  console.warn = (...args: any[]) => {
    // Only log warnings that are not expected React testing warnings
    const message = args[0];
    if (
      typeof message === 'string' &&
      !message.includes('Warning: ReactDOM.render is no longer supported') &&
      !message.includes('Warning: componentWillReceiveProps has been renamed')
    ) {
      originalConsoleWarn(...args);
    }
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Export localStorage mock for use in tests
export { localStorageMock, sessionStorageMock };
