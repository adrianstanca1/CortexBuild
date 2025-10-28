import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Building2, FolderOpen, PieChart } from 'lucide-react';

interface Analytics {
  userGrowth: Array<{ date: string; count: number }>;
  companyGrowth: Array<{ date: string; count: number }>;
  projectGrowth: Array<{ date: string; count: number }>;
  topCompanies: Array<{ name: string; subscription_plan: string; user_count: number; project_count: number }>;
  subscriptionDistribution: Array<{ subscription_plan: string; count: number }>;
  roleDistribution: Array<{ role: string; count: number }>;
}

export const PlatformAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/analytics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const getPlanColor = (plan: string) => {
    const colors: any = {
      'enterprise': 'bg-purple-100 text-purple-800',
      'pro': 'bg-blue-100 text-blue-800',
      'starter': 'bg-green-100 text-green-800',
      'free': 'bg-gray-100 text-gray-800'
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GrowthCard
          title="User Growth"
          data={analytics?.userGrowth || []}
          icon={Users}
          color="blue"
        />
        <GrowthCard
          title="Company Growth"
          data={analytics?.companyGrowth || []}
          icon={Building2}
          color="green"
        />
        <GrowthCard
          title="Project Growth"
          data={analytics?.projectGrowth || []}
          icon={FolderOpen}
          color="purple"
        />
      </div>

      {/* Top Companies */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-gray-600" />
          <span>Top Companies</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.topCompanies.map((company, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(company.subscription_plan)}`}>
                      {company.subscription_plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.user_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.project_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-gray-600" />
            <span>Subscription Distribution</span>
          </h3>
          <div className="space-y-3">
            {analytics?.subscriptionDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPlanColor(item.subscription_plan)}`}>
                    {item.subscription_plan}
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span>Role Distribution</span>
          </h3>
          <div className="space-y-3">
            {analytics?.roleDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{item.role}</span>
                <span className="text-2xl font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Growth Card Component
const GrowthCard: React.FC<{
  title: string;
  data: Array<{ date: string; count: number }>;
  icon: any;
  color: string;
}> = ({ title, data, icon: Icon, color }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const latest = data[0]?.count || 0;
  const previous = data[1]?.count || 0;
  const change = previous > 0 ? ((latest - previous) / previous * 100).toFixed(1) : '0';

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">{total}</p>
        <div className="flex items-center space-x-2">
          <TrendingUp className={`w-4 h-4 ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          <span className={`text-sm font-medium ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change}%
          </span>
          <span className="text-sm text-gray-500">vs previous period</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Recent: {data.slice(0, 3).map(d => d.count).join(', ')}
        </p>
      </div>
    </div>
  );
};

