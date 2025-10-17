// React Hooks Unit Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../hooks/useNavigation';
import { useToast } from '../hooks/useToast';
import { usePermissions } from '../hooks/usePermissions';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';

describe('Custom Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('useNavigation Hook', () => {
    it('should initialize with default screen', () => {
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.currentScreen).toBe('dashboard');
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.navigationStack).toHaveLength(1);
    });

    it('should navigate to new screen', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigateTo('projects', { projectId: '123' });
      });
      
      expect(result.current.currentScreen).toBe('projects');
      expect(result.current.canGoBack).toBe(true);
      expect(result.current.navigationStack).toHaveLength(2);
    });

    it('should go back to previous screen', () => {
      const { useNavigation } = require('../hooks/useNavigation');
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigateTo('projects', { projectId: '123' });
      });
      
      act(() => {
        result.current.goBack();
      });
      
      expect(result.current.currentScreen).toBe('dashboard');
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.navigationStack).toHaveLength(1);
    });

    it('should not go back when at root screen', () => {
      const { useNavigation } = require('../hooks/useNavigation');
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.goBack();
      });
      
      expect(result.current.currentScreen).toBe('dashboard');
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.navigationStack).toHaveLength(1);
    });
  });

  describe('useToast Hook', () => {
    it('should initialize with empty toasts', () => {
      const { useToast } = require('../hooks/useToast');
      const { result } = renderHook(() => useToast());
      
      expect(result.current.toasts).toEqual([]);
    });

    it('should add toast message', () => {
      const { useToast } = require('../hooks/useToast');
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.addToast({
          type: 'success',
          title: 'Success',
          message: 'Operation completed'
        });
      });
      
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].title).toBe('Success');
      expect(result.current.toasts[0].message).toBe('Operation completed');
      expect(result.current.toasts[0].id).toBeDefined();
    });

    it('should remove toast message', () => {
      const { useToast } = require('../hooks/useToast');
      const { result } = renderHook(() => useToast());
      
      let toastId: string;
      
      act(() => {
        result.current.addToast({
          type: 'info',
          title: 'Info',
          message: 'Information message'
        });
      });
      
      toastId = result.current.toasts[0].id;
      
      act(() => {
        result.current.removeToast(toastId);
      });
      
      expect(result.current.toasts).toHaveLength(0);
    });

    it('should auto-remove toast after duration', async () => {
      vi.useFakeTimers();
      
      const { useToast } = require('../hooks/useToast');
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.addToast({
          type: 'warning',
          title: 'Warning',
          message: 'Warning message',
          duration: 1000
        });
      });
      
      expect(result.current.toasts).toHaveLength(1);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(result.current.toasts).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('usePermissions Hook', () => {
    it('should check user permissions', () => {
      const { usePermissions } = require('../hooks/usePermissions');
      const mockUser = {
        id: '1',
        role: 'admin',
        permissions: ['read', 'write', 'delete']
      };
      
      const { result } = renderHook(() => usePermissions(mockUser));
      
      expect(result.current.can('read', 'project')).toBe(true);
      expect(result.current.can('write', 'project')).toBe(true);
      expect(result.current.can('delete', 'project')).toBe(true);
    });

    it('should deny permissions for unauthorized actions', () => {
      const { usePermissions } = require('../hooks/usePermissions');
      const mockUser = {
        id: '1',
        role: 'viewer',
        permissions: ['read']
      };
      
      const { result } = renderHook(() => usePermissions(mockUser));
      
      expect(result.current.can('read', 'project')).toBe(true);
      expect(result.current.can('write', 'project')).toBe(false);
      expect(result.current.can('delete', 'project')).toBe(false);
    });

    it('should handle null user', () => {
      const { usePermissions } = require('../hooks/usePermissions');
      
      const { result } = renderHook(() => usePermissions(null));
      
      expect(result.current.can('read', 'project')).toBe(false);
      expect(result.current.can('write', 'project')).toBe(false);
    });
  });

  describe('useLocalStorage Hook', () => {
    it('should initialize with default value', () => {
      const { useLocalStorage } = require('../hooks/useLocalStorage');
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(result.current[0]).toBe('default-value');
    });

    it('should update localStorage when value changes', () => {
      const { useLocalStorage } = require('../hooks/useLocalStorage');
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      act(() => {
        result.current[1]('updated-value');
      });
      
      expect(result.current[0]).toBe('updated-value');
      expect(localStorage.getItem('test-key')).toBe('"updated-value"');
    });

    it('should load existing value from localStorage', () => {
      localStorage.setItem('existing-key', '"existing-value"');
      
      const { useLocalStorage } = require('../hooks/useLocalStorage');
      const { result } = renderHook(() => useLocalStorage('existing-key', 'default'));
      
      expect(result.current[0]).toBe('existing-value');
    });

    it('should handle JSON serialization', () => {
      const { useLocalStorage } = require('../hooks/useLocalStorage');
      const { result } = renderHook(() => useLocalStorage('object-key', { count: 0 }));
      
      act(() => {
        result.current[1]({ count: 5, name: 'test' });
      });
      
      expect(result.current[0]).toEqual({ count: 5, name: 'test' });
      expect(JSON.parse(localStorage.getItem('object-key')!)).toEqual({ count: 5, name: 'test' });
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const { useLocalStorage } = require('../hooks/useLocalStorage');
      const { result } = renderHook(() => useLocalStorage('error-key', 'default'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      // Should still update the state even if localStorage fails
      expect(result.current[0]).toBe('new-value');
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restore
      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe('useDebounce Hook', () => {
    it('should debounce value updates', async () => {
      vi.useFakeTimers();
      
      const { useDebounce } = require('../hooks/useDebounce');
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );
      
      expect(result.current).toBe('initial');
      
      // Update value multiple times quickly
      rerender({ value: 'update1', delay: 500 });
      rerender({ value: 'update2', delay: 500 });
      rerender({ value: 'final', delay: 500 });
      
      // Value should not change immediately
      expect(result.current).toBe('initial');
      
      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      // Now value should be updated to the final value
      expect(result.current).toBe('final');
      
      vi.useRealTimers();
    });

    it('should cancel previous timeout on new updates', () => {
      vi.useFakeTimers();
      
      const { useDebounce } = require('../hooks/useDebounce');
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 1000 } }
      );
      
      rerender({ value: 'intermediate', delay: 1000 });
      
      // Advance time partially
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      // Update again before timeout
      rerender({ value: 'final', delay: 1000 });
      
      // Advance remaining time from first update
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      // Should still be initial value
      expect(result.current).toBe('initial');
      
      // Advance full delay for second update
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Now should be final value
      expect(result.current).toBe('final');
      
      vi.useRealTimers();
    });
  });
});
