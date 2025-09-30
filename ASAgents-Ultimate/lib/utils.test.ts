// @ts-nocheck - Test file with type issues
/**
 * Utility Functions Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  debounce,
  truncate,
  generateId,
  sleep,
} from './utils';

describe('Utility Functions', () => {
  describe('cn (class name merger)', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toContain('foo');
      expect(result).toContain('bar');
    });

    it('should handle conditional classes', () => {
      const result = cn('foo', false && 'bar', 'baz');
      expect(result).toContain('foo');
      expect(result).toContain('baz');
      expect(result).not.toContain('bar');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD by default', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1,234.56');
      expect(result).toContain('$');
    });

    it('should format custom currency', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toContain('1,234.56');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-1234.56);
      expect(result).toContain('1,234.56');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T12:00:00Z');

    it('should format date in short format by default', () => {
      const result = formatDate(testDate);
      expect(result).toContain('2024');
    });

    it('should format date in long format', () => {
      const result = formatDate(testDate, 'long');
      expect(result).toContain('2024');
      expect(result).toContain('January');
    });

    it('should format time', () => {
      const result = formatDate(testDate, 'time');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should handle string dates', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('2024');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('test', 123);

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('test', 123);
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const result = truncate('This is a long string', 10);
      expect(result).toBe('This is a ...');
      expect(result.length).toBe(13); // 10 + '...'
    });

    it('should not truncate short strings', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });

    it('should handle exact length', () => {
      const result = truncate('Exact', 5);
      expect(result).toBe('Exact');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('should return string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should delay execution', async () => {
      const promise = sleep(100);
      let resolved = false;
      
      promise.then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);

      vi.advanceTimersByTime(100);
      await promise;

      expect(resolved).toBe(true);
    });
  });
});
