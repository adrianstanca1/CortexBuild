/**
 * QuickStats Component
 * Reusable quick stats grid component
 */

import React, { useMemo } from 'react';
import { QuickStatsProps } from '../types/dashboardTypes';
import { DashboardCard } from './DashboardCard';
import { getGridColumns, getStaggerDelay } from '../utils/dashboardUtils';
import { GRID_CONFIGS, SPACING } from '../config/dashboardConfig';

export const QuickStats: React.FC<QuickStatsProps> = React.memo(({ stats, columns = 4 }) => {
  const gridClasses = useMemo(() => {
    const config = GRID_CONFIGS.stats;
    return `grid ${config.mobile} ${config.tablet} ${config.desktop} ${SPACING.grid}`;
  }, []);

  return (
    <div className={gridClasses}>
      {stats.map((stat, index) => (
        <DashboardCard
          key={stat.title}
          {...stat}
          delay={getStaggerDelay(index)}
        />
      ))}
    </div>
  );
});

QuickStats.displayName = 'QuickStats';

export default QuickStats;

