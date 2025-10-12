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
import * as SharedComponents from './shared';
import * as DashboardConfig from './config/dashboardConfig';
import * as DashboardUtils from './utils/dashboardUtils';

export default {
  // Components
  DashboardCard: SharedComponents.DashboardCard,
  DashboardHeader: SharedComponents.DashboardHeader,
  QuickStats: SharedComponents.QuickStats,
  SectionGrid: SharedComponents.SectionGrid,
  DashboardTabs: SharedComponents.DashboardTabs,

  // Config
  DASHBOARD_COLORS: DashboardConfig.DASHBOARD_COLORS,
  DASHBOARD_GRADIENTS: DashboardConfig.DASHBOARD_GRADIENTS,
  ANIMATION_CONFIG: DashboardConfig.ANIMATION_CONFIG,
  GRID_CONFIGS: DashboardConfig.GRID_CONFIGS,

  // Utils
  getColorClasses: DashboardUtils.getColorClasses,
  formatNumber: DashboardUtils.formatNumber,
  formatCurrency: DashboardUtils.formatCurrency,
  calculateTrend: DashboardUtils.calculateTrend,
};

