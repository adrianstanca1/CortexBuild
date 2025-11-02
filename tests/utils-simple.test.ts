// Simple Utility Functions Tests
import { describe, it, expect } from 'vitest';

// Import utility functions
import { logger } from '../utils/logger';
import { formatDate, getRelativeTime, isDateInRange } from '../utils/dateUtils';
import { capitalize, toTitleCase, truncate, slugify } from '../utils/stringUtils';
import { removeDuplicates, chunk, sortBy, groupBy } from '../utils/arrayUtils';
import { deepClone, deepMerge, get, set } from '../utils/objectUtils';
import { formatCurrency, formatPercentage, roundTo, clamp } from '../utils/numberUtils';

describe('Utility Functions - Simple Tests', () => {
  describe('Date Utilities', () => {
    it('should format dates correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      
      expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2024-01-15');
      expect(formatDate(testDate, 'DD/MM/YYYY')).toBe('15/01/2024');
      expect(formatDate(testDate, 'MMM DD, YYYY')).toBe('Jan 15, 2024');
    });

    it('should calculate relative time', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      expect(getRelativeTime(oneHourAgo)).toBe('1 hour ago');
      expect(getRelativeTime(oneDayAgo)).toBe('1 day ago');
    });

    it('should validate date ranges', () => {
      const testDate = new Date('2024-01-15');
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      expect(isDateInRange(testDate, startDate, endDate)).toBe(true);
      expect(isDateInRange(new Date('2024-02-01'), startDate, endDate)).toBe(false);
    });
  });

  describe('String Utilities', () => {
    it('should capitalize strings correctly', () => {
      expect(capitalize('hello world')).toBe('Hello world');
      expect(capitalize('HELLO WORLD')).toBe('Hello world');
      expect(capitalize('')).toBe('');
    });

    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    });

    it('should truncate strings with ellipsis', () => {
      expect(truncate('This is a long string', 10)).toBe('This is...');
      expect(truncate('Short', 10)).toBe('Short');
      expect(truncate('Ten chars!', 10)).toBe('Ten chars!');
    });

    it('should generate slugs from strings', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Special Characters!@#')).toBe('special-characters');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });
  });

  describe('Array Utilities', () => {
    it('should remove duplicates from arrays', () => {
      expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(removeDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(removeDuplicates([])).toEqual([]);
    });

    it('should chunk arrays into smaller arrays', () => {
      expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([[1, 2], [3, 4], [5, 6]]);
      expect(chunk([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [4, 5]]);
      expect(chunk([], 2)).toEqual([]);
    });

    it('should sort arrays by property', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 35 }
      ];
      
      const sortedByAge = sortBy(data, 'age');
      expect(sortedByAge[0].age).toBe(25);
      expect(sortedByAge[2].age).toBe(35);
      
      const sortedByName = sortBy(data, 'name');
      expect(sortedByName[0].name).toBe('Bob');
      expect(sortedByName[2].name).toBe('John');
    });

    it('should group arrays by property', () => {
      const data = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
        { category: 'C', value: 4 }
      ];
      
      const grouped = groupBy(data, 'category');
      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(1);
      expect(grouped.C).toHaveLength(1);
    });
  });

  describe('Object Utilities', () => {
    it('should deep clone objects', () => {
      const original = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        e: new Date('2024-01-01')
      };
      
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    it('should merge objects deeply', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      
      const merged = deepMerge(obj1, obj2);
      
      expect(merged).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      });
    });

    it('should get nested object values safely', () => {
      const obj = {
        a: {
          b: {
            c: 'value'
          }
        }
      };
      
      expect(get(obj, 'a.b.c')).toBe('value');
      expect(get(obj, 'a.b.d', 'default')).toBe('default');
      expect(get(obj, 'x.y.z')).toBeUndefined();
    });

    it('should set nested object values', () => {
      const obj = {};
      
      set(obj, 'a.b.c', 'value');
      
      expect(obj).toEqual({
        a: {
          b: {
            c: 'value'
          }
        }
      });
    });
  });

  describe('Number Utilities', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
      expect(formatCurrency(500.5, 'GBP')).toBe('£500.50');
    });

    it('should format percentages', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%');
      expect(formatPercentage(0.5)).toBe('50.00%');
      expect(formatPercentage(1.5)).toBe('150.00%');
    });

    it('should round numbers to specified decimals', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
      expect(roundTo(3.14159, 0)).toBe(3);
      expect(roundTo(3.14159, 4)).toBe(3.1416);
    });

    it('should clamp numbers within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });
});
