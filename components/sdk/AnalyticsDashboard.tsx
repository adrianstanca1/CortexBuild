import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Zap, Clock, BarChart3, Activity, Code, Users } from 'lucide-react';

interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgResponseTime: number;
  successRate: number;
}

interface ModelUsage {
  provider: string;
  model: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/sdk/usage?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // Calculate aggregate stats
        const totalRequests = data.data.usage.reduce((sum: number, u: ModelUsage) => sum + u.total_requests, 0);
        const totalTokens = data.data.usage.reduce((sum: number, u: ModelUsage) => sum + u.total_tokens, 0);
        const totalCost = data.data.usage.reduce((sum: number, u: ModelUsage) => sum + u.total_cost, 0);
        
        setStats({
          totalRequests,
          totalTokens,
          totalCost,
          avgResponseTime: 1.2, // Mock for now
          successRate: 98.5 // Mock for now
        });
        
        setModelUsage(data.data.usage);
        setRecentRequests(data.data.recentRequests);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: string;
  }> = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <span className="text-sm text-green-600 font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor your SDK usage and performance</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
          {[
            { value: '24h', label: '24 Hours' },
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: 'all', label: 'All Time' }
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total API Requests"
          value={stats?.totalRequests.toLocaleString() || '0'}
          icon={Zap}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Total Tokens Used"
          value={stats?.totalTokens.toLocaleString() || '0'}
          icon={Activity}
          color="purple"
          trend="+8%"
        />
        <StatCard
          title="Total Cost"
          value={`$${stats?.totalCost.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          color="green"
          trend="+5%"
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Model Usage Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Model Usage Breakdown
        </h3>
        
        <div className="space-y-4">
          {modelUsage.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No usage data available</p>
          ) : (
            modelUsage.map((usage, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{usage.model}</h4>
                    <p className="text-sm text-gray-500">{usage.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${usage.total_cost.toFixed(4)}</p>
                    <p className="text-sm text-gray-500">{usage.total_requests} requests</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(usage.total_requests / (stats?.totalRequests || 1)) * 100}%`
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{usage.total_tokens.toLocaleString()} tokens</span>
                  <span>{((usage.total_requests / (stats?.totalRequests || 1)) * 100).toFixed(1)}% of total</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Recent API Requests
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Model</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tokens</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Cost</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No recent requests
                  </td>
                </tr>
              ) : (
                recentRequests.slice(0, 10).map((request, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(request.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {request.request_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{request.model}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      {request.total_tokens.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      ${request.estimated_cost.toFixed(4)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Response Time
          </h3>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats?.avgResponseTime.toFixed(2)}s
            </div>
            <p className="text-gray-600">Average Response Time</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2 text-blue-600" />
            Request Types
          </h3>
          <div className="space-y-3">
            {[
              { type: 'Code Generation', count: Math.floor((stats?.totalRequests || 0) * 0.6), color: 'blue' },
              { type: 'Chat', count: Math.floor((stats?.totalRequests || 0) * 0.25), color: 'purple' },
              { type: 'Analysis', count: Math.floor((stats?.totalRequests || 0) * 0.15), color: 'green' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.type}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${item.color}-600 h-2 rounded-full`}
                    style={{ width: `${(item.count / (stats?.totalRequests || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

