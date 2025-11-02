/**
 * DashboardCard Component
 * Reusable card component for dashboard stats
 */

import React from 'react';
import { DashboardCardProps } from '../types/dashboardTypes';
import { getColorClasses, getTrendIcon, getTrendColor } from '../utils/dashboardUtils';
import { ANIMATION_CONFIG, BORDER_RADIUS, SHADOWS, TRANSITIONS } from '../config/dashboardConfig';

export const DashboardCard: React.FC<DashboardCardProps> = React.memo(({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  bgGradient,
  onClick,
  delay = 0,
}) => {
  const colorClasses = getColorClasses(color as any);
  const trendColor = trend ? getTrendColor(trend) : '';
  const trendIcon = trend ? getTrendIcon(trend) : '';

  return (
    <div
      className={`${BORDER_RADIUS.card} ${SHADOWS.card} ${SHADOWS.cardHover} ${TRANSITIONS.default} cursor-pointer transform hover:scale-${ANIMATION_CONFIG.hoverScale} bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6`}
      onClick={onClick}
      style={{
        animation: `fadeIn ${ANIMATION_CONFIG.fadeInDuration}ms ease-in-out ${delay}ms forwards`,
        opacity: 0,
      }}
    >
      {/* Icon */}
      <div className={`w-12 h-12 ${BORDER_RADIUS.button} bg-gradient-to-br ${bgGradient} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>

      {/* Value */}
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-white">{value}</p>
        
        {/* Trend */}
        {change && trend && (
          <span className={`text-sm font-medium ${trendColor} flex items-center`}>
            {trendIcon} {change}
          </span>
        )}
      </div>
    </div>
  );
});

DashboardCard.displayName = 'DashboardCard';

export default DashboardCard;

