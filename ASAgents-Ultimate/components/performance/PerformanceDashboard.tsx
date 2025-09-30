import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { performanceMonitor, apiCache, dataCache } from '../../utils/performance';

interface PerformanceDashboardProps {
  className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
}) => {
  const [metrics, setMetrics] = useState(performanceMonitor.getSummary());
  const [apiStats, setApiStats] = useState(apiCache.getStats());
  const [dataStats, setDataStats] = useState(dataCache.getStats());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      setMetrics(performanceMonitor.getSummary());
      setApiStats(apiCache.getStats());
      setDataStats(dataCache.getStats());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = (avgTime: number) => {
    if (avgTime < 100) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle };
    if (avgTime < 500) return { status: 'good', color: 'text-blue-600', icon: CheckCircle };
    if (avgTime < 1000) return { status: 'fair', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'poor', color: 'text-red-600', icon: AlertTriangle };
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="text-primary" size={24} />
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} size={16} />
          Refresh
        </Button>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(metrics).map(([name, stats]) => {
          const status = getPerformanceStatus(stats.avg);
          const StatusIcon = status.icon;
          
          return (
            <Card key={name} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground" size={16} />
                  <h3 className="font-medium text-sm">{name.replace(/_/g, ' ')}</h3>
                </div>
                <StatusIcon className={status.color} size={16} />
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatTime(stats.avg)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Average ({stats.count} samples)
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Min:</span>
                    <span className="ml-1 font-medium">{formatTime(stats.min)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max:</span>
                    <span className="ml-1 font-medium">{formatTime(stats.max)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P95:</span>
                    <span className="ml-1 font-medium">{formatTime(stats.p95)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P99:</span>
                    <span className="ml-1 font-medium">{formatTime(stats.p99)}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Cache */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">API Cache</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {apiStats.size}
                </div>
                <div className="text-sm text-blue-800">Cached Items</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(apiStats.hitRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-800">Hit Rate</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cache Usage</span>
                <span>{apiStats.size} / {apiStats.maxSize}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(apiStats.size / apiStats.maxSize) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Top Cached Items</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {apiStats.entries.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="truncate">{entry.key}</span>
                    <span className="text-muted-foreground">{entry.hits} hits</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                apiCache.clear();
                refreshData();
              }}
              className="w-full"
            >
              Clear API Cache
            </Button>
          </div>
        </Card>

        {/* Data Cache */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">Data Cache</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {dataStats.size}
                </div>
                <div className="text-sm text-purple-800">Cached Items</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(dataStats.hitRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-orange-800">Hit Rate</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cache Usage</span>
                <span>{dataStats.size} / {dataStats.maxSize}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(dataStats.size / dataStats.maxSize) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Top Cached Items</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {dataStats.entries.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="truncate">{entry.key}</span>
                    <span className="text-muted-foreground">{entry.hits} hits</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                dataCache.clear();
                refreshData();
              }}
              className="w-full"
            >
              Clear Data Cache
            </Button>
          </div>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Performance Recommendations</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(metrics).map(([name, stats]) => {
            const recommendations = [];
            
            if (stats.avg > 1000) {
              recommendations.push(`${name} is slow (${formatTime(stats.avg)}). Consider optimization.`);
            }
            
            if (stats.p95 > stats.avg * 3) {
              recommendations.push(`${name} has high variance. Check for performance bottlenecks.`);
            }
            
            return recommendations.map((rec, index) => (
              <div key={`${name}-${index}`} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                <span className="text-sm text-yellow-800">{rec}</span>
              </div>
            ));
          })}

          {apiStats.hitRate < 0.5 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="text-blue-600 mt-0.5" size={16} />
              <span className="text-sm text-blue-800">
                API cache hit rate is low ({(apiStats.hitRate * 100).toFixed(1)}%). Consider increasing cache TTL or reviewing cache strategy.
              </span>
            </div>
          )}

          {dataStats.size / dataStats.maxSize > 0.8 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="text-orange-600 mt-0.5" size={16} />
              <span className="text-sm text-orange-800">
                Data cache is nearly full ({dataStats.size}/{dataStats.maxSize}). Consider increasing cache size or implementing better eviction policies.
              </span>
            </div>
          )}

          {Object.keys(metrics).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No performance metrics available yet.</p>
              <p className="text-sm">Metrics will appear as you use the application.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
