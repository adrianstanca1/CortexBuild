import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  color = 'text-blue-600',
  subtitle
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const trendIcons = {
    up: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: null
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className={`${color} opacity-80`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trend]}`}>
            {trendIcons[trend]}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, gradient }) => {
  return (
    <div className={`rounded-xl p-6 ${gradient} text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
    </div>
  );
};

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

export const QuickStat: React.FC<QuickStatProps> = ({
  icon,
  label,
  value,
  sublabel,
  color = 'bg-blue-500'
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};
