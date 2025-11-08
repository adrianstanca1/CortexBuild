/**
 * MetricsCard Component
 * Displays a single metric with icon, value, label, and trend
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricsCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  trend?: number; // Positive or negative percentage
  trendLabel?: string;
  backgroundColor?: string;
  textColor?: string;
  isDarkMode?: boolean;
  onClick?: () => void;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  trend,
  trendLabel,
  backgroundColor = 'bg-white',
  textColor = 'text-gray-900',
  isDarkMode = false,
  onClick
}) => {
  const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : backgroundColor;
  const textClass = isDarkMode ? 'text-gray-100' : textColor;
  const labelClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  const isTrendPositive = trend && trend > 0;
  const trendColor = isTrendPositive ? 'text-green-500' : 'text-red-500';
  const trendBgColor = isTrendPositive ? 'bg-green-50' : 'bg-red-50';
  const trendBgColorDark = isTrendPositive ? 'bg-green-900/20' : 'bg-red-900/20';

  return (
    <div
      onClick={onClick}
      className={`
        ${bgClass} ${borderClass}
        rounded-lg border p-6 shadow-sm
        transition-all duration-200 hover:shadow-md
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
      `}
    >
      {/* Header with icon and title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className={`${labelClass} text-sm font-medium mb-1`}>
            {title}
          </p>
        </div>
        <div className={`
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
          rounded-lg p-2 text-gray-600
        `}>
          {icon}
        </div>
      </div>

      {/* Value display */}
      <div className="mb-4">
        <div className={`${textClass} text-3xl font-bold`}>
          {value}
          {unit && <span className="text-lg ml-1">{unit}</span>}
        </div>
      </div>

      {/* Trend indicator */}
      {trend !== undefined && (
        <div className={`
          ${isDarkMode ? trendBgColorDark : trendBgColor}
          rounded-md p-2 flex items-center gap-1
        `}>
          {isTrendPositive ? (
            <TrendingUp className={`${trendColor} w-4 h-4`} />
          ) : (
            <TrendingDown className={`${trendColor} w-4 h-4`} />
          )}
          <span className={`${trendColor} text-sm font-medium`}>
            {Math.abs(trend)}% {trendLabel || 'vs last period'}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;

