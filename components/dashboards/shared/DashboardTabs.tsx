/**
 * DashboardTabs Component
 * Reusable tabs component for dashboards
 */

import React from 'react';
import { DashboardTabsProps } from '../types/dashboardTypes';
import { TRANSITIONS } from '../config/dashboardConfig';

export const DashboardTabs: React.FC<DashboardTabsProps> = React.memo(({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b border-slate-700 mb-8">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${TRANSITIONS.default} ${
                isActive
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
});

DashboardTabs.displayName = 'DashboardTabs';

export default DashboardTabs;

