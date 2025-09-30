import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { 
  Activity, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Wifi,
  WifiOff
} from 'lucide-react';

interface PerformanceIndicatorsProps {
  metrics: {
    systemHealth: number;
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
  isConnected: boolean;
  lastUpdate: Date;
}

interface PerformanceMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  threshold: {
    excellent: number;
    good: number;
    warning: number;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'good':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusFromValue = (value: number, thresholds: any, isInverted = false) => {
  if (isInverted) {
    // For metrics where lower is better (like error rate, response time)
    if (value <= thresholds.excellent) return 'excellent';
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  } else {
    // For metrics where higher is better (like uptime, system health)
    if (value >= thresholds.excellent) return 'excellent';
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.warning) return 'warning';
    return 'critical';
  }
};

export const PerformanceIndicators: React.FC<PerformanceIndicatorsProps> = ({
  metrics,
  isConnected,
  lastUpdate,
}) => {
  const [realtimeMetrics, setRealtimeMetrics] = useState(metrics);

  // Simulate real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics(prev => ({
        systemHealth: Math.max(85, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2)),
        responseTime: Math.max(100, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 20)),
        uptime: Math.max(95, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.1)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.2)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'system-health',
      label: 'System Health',
      value: realtimeMetrics.systemHealth,
      unit: '%',
      status: getStatusFromValue(realtimeMetrics.systemHealth, {
        excellent: 95,
        good: 90,
        warning: 80,
      }),
      icon: <Activity size={20} />,
      trend: realtimeMetrics.systemHealth > metrics.systemHealth ? 'up' : 
             realtimeMetrics.systemHealth < metrics.systemHealth ? 'down' : 'stable',
      threshold: { excellent: 95, good: 90, warning: 80 },
    },
    {
      id: 'response-time',
      label: 'Response Time',
      value: realtimeMetrics.responseTime,
      unit: 'ms',
      status: getStatusFromValue(realtimeMetrics.responseTime, {
        excellent: 200,
        good: 300,
        warning: 500,
      }, true),
      icon: <Zap size={20} />,
      trend: realtimeMetrics.responseTime < metrics.responseTime ? 'up' : 
             realtimeMetrics.responseTime > metrics.responseTime ? 'down' : 'stable',
      threshold: { excellent: 200, good: 300, warning: 500 },
    },
    {
      id: 'uptime',
      label: 'Uptime',
      value: realtimeMetrics.uptime,
      unit: '%',
      status: getStatusFromValue(realtimeMetrics.uptime, {
        excellent: 99.5,
        good: 99,
        warning: 98,
      }),
      icon: <Clock size={20} />,
      trend: 'stable',
      threshold: { excellent: 99.5, good: 99, warning: 98 },
    },
    {
      id: 'error-rate',
      label: 'Error Rate',
      value: realtimeMetrics.errorRate,
      unit: '%',
      status: getStatusFromValue(realtimeMetrics.errorRate, {
        excellent: 0.1,
        good: 0.5,
        warning: 1,
      }, true),
      icon: <AlertTriangle size={20} />,
      trend: realtimeMetrics.errorRate < metrics.errorRate ? 'up' : 
             realtimeMetrics.errorRate > metrics.errorRate ? 'down' : 'stable',
      threshold: { excellent: 0.1, good: 0.5, warning: 1 },
    },
  ];

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  const overallStatus = () => {
    const criticalCount = performanceMetrics.filter(m => m.status === 'critical').length;
    const warningCount = performanceMetrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    if (performanceMetrics.every(m => m.status === 'excellent')) return 'excellent';
    return 'good';
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">Performance Indicators</h3>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi size={16} />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff size={16} />
                  <span className="text-sm">Disconnected</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* Overall Status */}
        <div className={`p-4 rounded-lg border ${getStatusColor(overallStatus())}`}>
          <div className="flex items-center gap-3">
            <CheckCircle size={24} />
            <div>
              <h4 className="font-semibold">
                System Status: {overallStatus().charAt(0).toUpperCase() + overallStatus().slice(1)}
              </h4>
              <p className="text-sm opacity-80">
                {overallStatus() === 'excellent' && 'All systems operating optimally'}
                {overallStatus() === 'good' && 'Systems operating within normal parameters'}
                {overallStatus() === 'warning' && 'Some metrics require attention'}
                {overallStatus() === 'critical' && 'Critical issues detected - immediate attention required'}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceMetrics.map((metric) => (
            <div
              key={metric.id}
              className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="text-2xl font-bold mb-1">
                {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
              </div>
              
              <div className="text-xs opacity-70">
                Target: {metric.threshold.excellent}{metric.unit}+
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 bg-white/50 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (metric.value / (metric.threshold.excellent * 1.1)) * 100)}%`,
                    backgroundColor: 'currentColor',
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Performance History */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Performance History</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">99.8%</div>
              <div className="text-xs text-gray-600">7-day uptime</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">245ms</div>
              <div className="text-xs text-gray-600">Avg response time</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">0.05%</div>
              <div className="text-xs text-gray-600">Error rate</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
