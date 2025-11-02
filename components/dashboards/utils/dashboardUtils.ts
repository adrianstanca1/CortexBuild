/**
 * Dashboard Utility Functions
 * Centralized utility functions for dashboard components
 */

import { DASHBOARD_COLORS } from '../config/dashboardConfig';
import { ColorClasses, ColorName } from '../types/dashboardTypes';

// ==================== COLOR UTILITIES ====================

/**
 * Get color classes for a given color name
 */
export const getColorClasses = (color: ColorName): ColorClasses => {
  return DASHBOARD_COLORS[color] || DASHBOARD_COLORS.blue;
};

// ==================== NUMBER FORMATTING ====================

/**
 * Format large numbers with K/M suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// ==================== TREND CALCULATIONS ====================

/**
 * Calculate trend from current and previous values
 */
export const calculateTrend = (
  current: number,
  previous: number
): {
  change: string;
  trend: 'up' | 'down';
} => {
  if (previous === 0) {
    return {
      change: '+100%',
      trend: 'up',
    };
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;

  return {
    change: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
    trend: percentage >= 0 ? 'up' : 'down',
  };
};

/**
 * Get trend icon based on trend direction
 */
export const getTrendIcon = (trend: 'up' | 'down'): string => {
  return trend === 'up' ? '↑' : '↓';
};

/**
 * Get trend color based on trend direction
 */
export const getTrendColor = (trend: 'up' | 'down'): string => {
  return trend === 'up' ? 'text-green-400' : 'text-red-400';
};

// ==================== DATE FORMATTING ====================

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// ==================== ANIMATION UTILITIES ====================

/**
 * Calculate stagger delay for animations
 */
export const getStaggerDelay = (index: number, baseDelay: number = 100): number => {
  return index * baseDelay;
};

/**
 * Get fade-in animation style
 */
export const getFadeInStyle = (delay: number = 0): React.CSSProperties => {
  return {
    animation: `fadeIn 1s ease-in-out ${delay}ms forwards`,
    opacity: 0,
  };
};

// ==================== GRID UTILITIES ====================

/**
 * Get grid column classes based on column count
 */
export const getGridColumns = (columns: 2 | 3 | 4): string => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  return gridClasses[columns];
};

// ==================== VALIDATION UTILITIES ====================

/**
 * Check if value is valid number
 */
export const isValidNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Check if value is valid percentage (0-100)
 */
export const isValidPercentage = (value: number): boolean => {
  return isValidNumber(value) && value >= 0 && value <= 100;
};

// ==================== STRING UTILITIES ====================

/**
 * Truncate string to max length
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert snake_case to Title Case
 */
export const snakeToTitle = (str: string): string => {
  return str
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

// ==================== ARRAY UTILITIES ====================

/**
 * Group array items by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Sort array by key
 */
export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// ==================== EXPORT ALL ====================

export default {
  getColorClasses,
  formatNumber,
  formatCurrency,
  formatPercentage,
  calculateTrend,
  getTrendIcon,
  getTrendColor,
  formatDate,
  formatRelativeTime,
  getStaggerDelay,
  getFadeInStyle,
  getGridColumns,
  isValidNumber,
  isValidPercentage,
  truncateString,
  capitalizeFirst,
  snakeToTitle,
  groupBy,
  sortBy,
};

