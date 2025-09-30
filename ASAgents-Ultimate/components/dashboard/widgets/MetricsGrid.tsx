import React from 'react';
import { DashboardWidget } from './DashboardWidget';
import { TrendingUp, TrendingDown, Minus, Users, Briefcase, DollarSign, Activity } from 'lucide-react';

interface MetricsGridProps {
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  editMode: boolean;
  metrics: any;
  config: any;
  onConfigChange: (config: any) => void;
  onToggleVisibility: () => void;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  subtitle,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'decrease':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Minus size={16} className="text-gray-500" />;
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-xs font-medium ${
              changeType === 'increase' ? 'text-green-600' : 
              changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {formatValue(value)}
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-600">{subtitle}</p>
      )}
    </div>
  );
};

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  title,
  size,
  editMode,
  metrics,
  config,
  onConfigChange,
  onToggleVisibility,
}) => {
  if (!metrics) {
    return (
      <DashboardWidget
        title={title}
        size={size}
        editMode={editMode}
        loading={true}
        onConfigChange={onConfigChange}
        onToggleVisibility={onToggleVisibility}
      >
        <div>Loading metrics...</div>
      </DashboardWidget>
    );
  }

  const projectMetrics = [
    {
      title: 'Total Projects',
      value: metrics.projects?.total || 0,
      change: 12,
      changeType: 'increase' as const,
      icon: <Briefcase size={16} />,
      subtitle: `${metrics.projects?.active || 0} active`,
      color: 'blue' as const,
    },
    {
      title: 'Completion Rate',
      value: `${((metrics.tasks?.completed || 0) / (metrics.tasks?.total || 1) * 100).toFixed(1)}%`,
      change: 5.2,
      changeType: 'increase' as const,
      icon: <Activity size={16} />,
      subtitle: `${metrics.tasks?.completed || 0} of ${metrics.tasks?.total || 0} tasks`,
      color: 'green' as const,
    },
    {
      title: 'Team Members',
      value: metrics.team?.total || 0,
      change: 0,
      changeType: 'neutral' as const,
      icon: <Users size={16} />,
      subtitle: `${metrics.team?.active || 0} active`,
      color: 'purple' as const,
    },
    {
      title: 'Revenue',
      value: `$${((metrics.financial?.revenue || 0) / 1000).toFixed(0)}K`,
      change: 8.7,
      changeType: 'increase' as const,
      icon: <DollarSign size={16} />,
      subtitle: `$${((metrics.financial?.profit || 0) / 1000).toFixed(0)}K profit`,
      color: 'green' as const,
    },
  ];

  const budgetMetrics = [
    {
      title: 'Total Budget',
      value: `$${((metrics.projects?.budget?.total || 0) / 1000).toFixed(0)}K`,
      subtitle: 'Allocated across all projects',
      color: 'blue' as const,
    },
    {
      title: 'Budget Spent',
      value: `$${((metrics.projects?.budget?.spent || 0) / 1000).toFixed(0)}K`,
      change: -3.2,
      changeType: 'decrease' as const,
      subtitle: `${(((metrics.projects?.budget?.spent || 0) / (metrics.projects?.budget?.total || 1)) * 100).toFixed(1)}% of total`,
      color: 'yellow' as const,
    },
    {
      title: 'Remaining Budget',
      value: `$${((metrics.projects?.budget?.remaining || 0) / 1000).toFixed(0)}K`,
      subtitle: 'Available for allocation',
      color: 'green' as const,
    },
    {
      title: 'Burn Rate',
      value: `$${((metrics.financial?.burnRate || 0) / 1000).toFixed(0)}K`,
      subtitle: 'Monthly spending rate',
      color: 'red' as const,
    },
  ];

  return (
    <DashboardWidget
      title={title}
      size={size}
      editMode={editMode}
      onConfigChange={onConfigChange}
      onToggleVisibility={onToggleVisibility}
    >
      <div className="space-y-6">
        {/* Primary Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Key Performance Indicators</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {projectMetrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
        </div>

        {/* Budget Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Budget Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {budgetMetrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.performance?.systemHealth || 0}%
              </div>
              <div className="text-xs text-gray-600">System Health</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.team?.utilization || 0}%
              </div>
              <div className="text-xs text-gray-600">Team Utilization</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.performance?.uptime || 0}%
              </div>
              <div className="text-xs text-gray-600">System Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
};
