/**
 * Dashboard Configuration
 * Centralized configuration for all dashboard components
 */

import { ColorClasses, ColorName, AnimationConfig, GridConfigs } from '../types/dashboardTypes';

// ==================== COLOR SYSTEM ====================

export const DASHBOARD_COLORS: Record<ColorName, ColorClasses> = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    hover: 'hover:bg-blue-500/20',
    gradient: 'from-blue-500 to-blue-600',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    hover: 'hover:bg-purple-500/20',
    gradient: 'from-purple-500 to-purple-600',
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/20',
    hover: 'hover:bg-green-500/20',
    gradient: 'from-green-500 to-green-600',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
    hover: 'hover:bg-orange-500/20',
    gradient: 'from-orange-500 to-orange-600',
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
    hover: 'hover:bg-red-500/20',
    gradient: 'from-red-500 to-red-600',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
    hover: 'hover:bg-cyan-500/20',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/20',
    hover: 'hover:bg-pink-500/20',
    gradient: 'from-pink-500 to-pink-600',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20',
    hover: 'hover:bg-yellow-500/20',
    gradient: 'from-yellow-500 to-yellow-600',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
    hover: 'hover:bg-indigo-500/20',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  gray: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/20',
    hover: 'hover:bg-gray-500/20',
    gradient: 'from-gray-500 to-gray-600',
  },
};

// ==================== GRADIENT SYSTEM ====================

export const DASHBOARD_GRADIENTS = {
  admin: 'from-blue-600 via-purple-600 to-pink-600',
  company: 'from-green-600 via-blue-600 to-purple-600',
  developer: 'from-green-600 via-blue-600 to-purple-600',
  analytics: 'from-purple-600 via-pink-600 to-red-600',
  default: 'from-blue-600 via-indigo-600 to-purple-600',
};

// ==================== ANIMATION CONFIG ====================

export const ANIMATION_CONFIG: AnimationConfig = {
  fadeInDuration: 1000,
  staggerDelay: 100,
  hoverScale: 1.05,
  transitionDuration: 300,
};

// ==================== GRID CONFIGS ====================

export const GRID_CONFIGS: GridConfigs = {
  stats: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-4',
  },
  sections: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3',
  },
  cards: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-4',
  },
};

// ==================== SPACING ====================

export const SPACING = {
  section: 'mb-8',
  card: 'p-6',
  header: 'mb-6',
  grid: 'gap-6',
};

// ==================== BORDER RADIUS ====================

export const BORDER_RADIUS = {
  card: 'rounded-xl',
  button: 'rounded-lg',
  badge: 'rounded-full',
};

// ==================== SHADOWS ====================

export const SHADOWS = {
  card: 'shadow-lg',
  cardHover: 'hover:shadow-xl',
  button: 'shadow-md',
};

// ==================== TRANSITIONS ====================

export const TRANSITIONS = {
  default: 'transition-all duration-300',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-500',
};

