import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: string | number;
  total?: number;
  icon: React.ComponentType<any>;
  trend?: string;
  trendDirection?: 'up' | 'down';
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  total,
  icon: Icon,
  trend,
  trendDirection,
  subtitle,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  };

  const trendColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-2xl font-semibold text-gray-900">
              {value}
              {total && (
                <span className="text-sm font-normal text-gray-500 ml-1">
                  / {total}
                </span>
              )}
            </p>
          </div>
          
          {trend && (
            <div className="flex items-center mt-2">
              {trendDirection && (
                <span className={`flex items-center text-sm ${trendColorClasses[trendDirection]}`}>
                  {trendDirection === 'up' ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {trend}
                </span>
              )}
            </div>
          )}

          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};