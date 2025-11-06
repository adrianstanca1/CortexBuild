/**
 * DashboardHeader Component
 * Reusable header component for dashboards
 */

import React from 'react';
import { DashboardHeaderProps } from '../types/dashboardTypes';

export const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(({
  title,
  subtitle,
  icon: Icon,
  actions,
  gradient,
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-xl shadow-lg p-8 mb-8`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
            <p className="text-white/80">{subtitle}</p>
          </div>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;

