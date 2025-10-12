/**
 * Dashboard Components Index
 * Central export point for all dashboard components, types, config, and utils
 */

// ==================== SHARED COMPONENTS ====================
export {
  DashboardCard,
  DashboardHeader,
  QuickStats,
  SectionGrid,
  DashboardTabs,
} from './shared';

// ==================== TYPES ====================
export type {
  User,
  DashboardStat,
  DashboardSection,
  DashboardTab,
  DashboardProps,
  DashboardCardProps,
  DashboardHeaderProps,
  QuickStatsProps,
  SectionGridProps,
  DashboardTabsProps,
  ColorClasses,
  ColorName,
  AnimationConfig,
  GridConfig,
  GridConfigs,
} from './types/dashboardTypes';

// ==================== CONFIGURATION ====================
export {
  DASHBOARD_COLORS,
  DASHBOARD_GRADIENTS,
  ANIMATION_CONFIG,
  GRID_CONFIGS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  TRANSITIONS,
} from './config/dashboardConfig';

// ==================== UTILITIES ====================
export {
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
} from './utils/dashboardUtils';

// ==================== DEFAULT EXPORT ====================
export default {
  // Components
  DashboardCard,
  DashboardHeader,
  QuickStats,
  SectionGrid,
  DashboardTabs,
  
  // Config
  DASHBOARD_COLORS,
  DASHBOARD_GRADIENTS,
  ANIMATION_CONFIG,
  GRID_CONFIGS,
  
  // Utils
  getColorClasses,
  formatNumber,
  formatCurrency,
  calculateTrend,
};

