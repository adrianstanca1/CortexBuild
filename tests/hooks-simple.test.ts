// Simple Custom Hooks Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';
import { usePermissions } from '../hooks/usePermissions';

describe('Custom Hooks - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('useLocalStorage Hook', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      expect(result.current[0]).toBe('default');
    });

    it('should update localStorage when value changes', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      act(() => {
        result.current[1]('updated');
      });
      
      expect(result.current[0]).toBe('updated');
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '"updated"');
    });

    it('should load existing value from localStorage', () => {
      // Mock localStorage to return existing value
      (localStorage.getItem as any).mockReturnValue('"existing-value"');
      
      const { result } = renderHook(() => useLocalStorage('existing-key', 'default'));
      
      expect(result.current[0]).toBe('existing-value');
    });

    it('should handle JSON serialization', () => {
      const { result } = renderHook(() => useLocalStorage('object-key', { count: 0 }));
      
      act(() => {
        result.current[1]({ count: 5 });
      });
      
      expect(result.current[0]).toEqual({ count: 5 });
      expect(localStorage.setItem).toHaveBeenCalledWith('object-key', '{"count":5}');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      (localStorage.setItem as any).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const { result } = renderHook(() => useLocalStorage('error-key', 'default'));
      
      // Should not throw and should still update state
      act(() => {
        result.current[1]('new-value');
      });
      
      expect(result.current[0]).toBe('new-value');
    });
  });

  describe('useDebounce Hook', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce value updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );
      
      expect(result.current).toBe('initial');
      
      // Update value
      rerender({ value: 'updated', delay: 500 });
      
      // Value should not change immediately
      expect(result.current).toBe('initial');
      
      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      // Now value should be updated
      expect(result.current).toBe('updated');
    });

    it('should cancel previous timeout on new updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );
      
      // Update value multiple times quickly
      rerender({ value: 'update1', delay: 500 });
      rerender({ value: 'update2', delay: 500 });
      rerender({ value: 'final', delay: 500 });
      
      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      // Should only have the final value
      expect(result.current).toBe('final');
    });
  });

  describe('usePermissions Hook', () => {
    it('should check company admin permissions', () => {
      const mockUser = {
        id: '1',
        role: 'company_admin' as any,
        name: 'Admin User',
        email: 'admin@test.com'
      };

      const { result } = renderHook(() => usePermissions(mockUser));

      expect(result.current.can('read', 'document')).toBe(true);
      expect(result.current.can('create', 'document')).toBe(true);
      expect(result.current.can('update', 'document')).toBe(true);
      expect(result.current.can('delete', 'document')).toBe(true);
    });

    it('should check foreman permissions', () => {
      const mockUser = {
        id: '1',
        role: 'Foreman' as any,
        name: 'Foreman User',
        email: 'foreman@test.com'
      };

      const { result } = renderHook(() => usePermissions(mockUser));

      expect(result.current.can('read', 'drawing')).toBe(true);
      expect(result.current.can('create', 'drawing')).toBe(false);
      expect(result.current.can('update', 'task')).toBe(true);
      expect(result.current.can('delete', 'task')).toBe(false);
    });

    it('should handle null user', () => {
      const { result } = renderHook(() => usePermissions(null));

      expect(result.current.can('read', 'document')).toBe(false);
      expect(result.current.can('create', 'document')).toBe(false);
    });

    it('should grant super admin permissions for all actions', () => {
      const mockUser = {
        id: '1',
        role: 'super_admin' as any,
        name: 'Super Admin',
        email: 'superadmin@test.com'
      };

      const { result } = renderHook(() => usePermissions(mockUser));

      expect(result.current.can('read', 'document')).toBe(true);
      expect(result.current.can('create', 'document')).toBe(true);
      expect(result.current.can('update', 'document')).toBe(true);
      expect(result.current.can('delete', 'document')).toBe(true);
    });

    it('should handle project manager permissions', () => {
      const mockUser = {
        id: '1',
        role: 'Project Manager' as any,
        name: 'PM User',
        email: 'pm@test.com'
      };

      const { result } = renderHook(() => usePermissions(mockUser));

      expect(result.current.can('read', 'document')).toBe(true);
      expect(result.current.can('create', 'document')).toBe(true);
      expect(result.current.can('update', 'task')).toBe(true);
      expect(result.current.can('delete', 'task')).toBe(true);
    });
  });
});
