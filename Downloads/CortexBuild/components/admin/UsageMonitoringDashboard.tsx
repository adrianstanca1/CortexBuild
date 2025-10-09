import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, DollarSign, Zap, Users, Code, MessageSquare, AlertCircle, Download } from 'lucide-react';

interface UsageStats {
  total_requests: number;
  total_cost: number;
  total_tokens: number;
  active_users: number;
  requests_today: number;
  cost_today: number;
  requests_this_month: number;
  cost_this_month: number;
  avg_response_time: number;
  success_rate: number;
}

interface UserUsage {
  user_id: string;
  user_name: string;
  user_email: string;
  company_name: string;
  total_requests: number;
  total_cost: number;
  total_tokens: number;
  last_request: string;
  tier: string;
}

interface RequestLog {
  id: number;
  user_email: string;
  request_type: string;
  tokens_used: number;
  cost: number;
  timestamp: string;
  success: boolean;
}

export const UsageMonitoringDashboard: React.FC = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [userUsage, setUserUsage] = useState<UserUsage[]>([]);
  const [recentRequests, setRecentRequests] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadUsageData();
    const interval = setInterval(loadUsageData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadUsageData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load overall stats
      const statsResponse = await fetch(`http://localhost:3001/api/admin/sdk/usage?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Load user usage
      const userResponse = await fetch('http://localhost:3001/api/admin/sdk/usage/by-user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();
      if (userData.success) {
        setUserUsage(userData.data);
      }

      // Load recent requests
      const requestsResponse = await fetch('http://localhost:3001/api/admin/sdk/usage/recent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const requestsData = await requestsResponse.json();
      if (requestsData.success) {
        setRecentRequests(requestsData.data);
      }
    } catch (error) {
      console.error('Load usage data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportUsageReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/sdk/usage/export?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  if (loading || !stats) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading usage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Usage Monitoring</h2>
          </div>
          <p className="text-gray-600">Real-time SDK usage analytics and cost tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={exportUsageReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total Requests</span>
          </div>
          <p className="text-3xl font-bold">{formatNumber(stats.total_requests)}</p>
          <p className="text-sm opacity-80 mt-1">
            {formatNumber(stats.requests_today)} today
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total Cost</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats.total_cost)}</p>
          <p className="text-sm opacity-80 mt-1">
            {formatCurrency(stats.cost_today)} today
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Active Users</span>
          </div>
          <p className="text-3xl font-bold">{formatNumber(stats.active_users)}</p>
          <p className="text-sm opacity-80 mt-1">
            {((stats.success_rate || 0) * 100).toFixed(1)}% success rate
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Code className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total Tokens</span>
          </div>
          <p className="text-3xl font-bold">{formatNumber(stats.total_tokens)}</p>
          <p className="text-sm opacity-80 mt-1">
            {stats.avg_response_time.toFixed(0)}ms avg response
          </p>
        </div>
      </div>

      {/* Monthly Forecast */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Forecast</h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.cost_this_month)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Projected</p>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(stats.cost_this_month * (30 / new Date().getDate()))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all"
            style={{ width: `${Math.min((stats.cost_this_month / 1000) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(1000)} budget</span>
        </div>
      </div>

      {/* Top Users by Usage */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Users by Usage</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Request</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userUsage.slice(0, 10).map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.user_name}</p>
                      <p className="text-sm text-gray-500">{user.user_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.company_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.tier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      user.tier === 'pro' ? 'bg-blue-100 text-blue-800' :
                      user.tier === 'starter' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.tier.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(user.total_requests)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(user.total_tokens)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(user.total_cost)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.last_request).toLocaleString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent API Requests</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentRequests.slice(0, 20).map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{request.user_email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {request.request_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(request.tokens_used)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(request.cost)}</td>
                  <td className="px-6 py-4">
                    {request.success ? (
                      <span className="flex items-center space-x-1 text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-xs font-medium">Success</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-xs font-medium">Failed</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(request.timestamp).toLocaleString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

