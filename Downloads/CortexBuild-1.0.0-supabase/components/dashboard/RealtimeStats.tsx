/**
 * Real-time Statistics Component
 * Displays live statistics with auto-refresh
 */

import React, { useState, useEffect } from 'react';

interface Stat {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export const RealtimeStats: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([
    {
      label: 'Active Users',
      value: 24,
      change: 12,
      trend: 'up',
      icon: '👥',
      color: 'blue'
    },
    {
      label: 'Projects',
      value: 12,
      change: 8,
      trend: 'up',
      icon: '📊',
      color: 'green'
    },
    {
      label: 'Tasks Today',
      value: 47,
      change: -5,
      trend: 'down',
      icon: '✅',
      color: 'purple'
    },
    {
      label: 'Completion Rate',
      value: 87,
      change: 3,
      trend: 'up',
      icon: '📈',
      color: 'orange'
    }
  ]);

  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setStats(prevStats => prevStats.map(stat => ({
        ...stat,
        value: stat.value + Math.floor(Math.random() * 3) - 1,
        change: Math.floor(Math.random() * 10) - 5
      })));
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Live Statistics</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Updated {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={index}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${colors.text} mt-2`}>
                    {stat.value}
                    {stat.label.includes('Rate') && '%'}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-xs text-gray-500">vs last hour</span>
                  </div>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

