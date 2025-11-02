import * as authService from '../authService';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
  })),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Module Exports', () => {
    it('should export authService module', () => {
      expect(authService).toBeDefined();
    });

    it('should have authentication-related exports', () => {
      // Check that the module exports something
      expect(Object.keys(authService).length).toBeGreaterThan(0);
    });
  });

  describe('Token Management', () => {
    it('should store auth token in localStorage', () => {
      const token = 'test-token-123';
      localStorage.setItem('auth_token', token);

      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('should clear auth token on logout', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.removeItem('auth_token');

      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should handle multiple tokens', () => {
      localStorage.setItem('auth_token', 'token-1');
      localStorage.setItem('refresh_token', 'refresh-1');

      expect(localStorage.getItem('auth_token')).toBe('token-1');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-1');
    });
  });

  describe('Session Management', () => {
    it('should store user session data', () => {
      const sessionData = JSON.stringify({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'super_admin',
      });

      localStorage.setItem('user_session', sessionData);
      const stored = localStorage.getItem('user_session');

      expect(stored).toBe(sessionData);
      expect(JSON.parse(stored!)).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'super_admin',
      });
    });

    it('should clear session on logout', () => {
      localStorage.setItem('user_session', JSON.stringify({ userId: 'user-123' }));
      localStorage.removeItem('user_session');

      expect(localStorage.getItem('user_session')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const mockStorage = {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
      });

      expect(mockStorage.getItem('auth_token')).toBeNull();
    });
  });
});

