import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertCircle, Zap, Users, Database } from 'lucide-react';

interface AnalyticsData {
  apiCalls: { time: string; count: number }[];
  errorRate: number;
  avgResponseTime: number;
  activeUsers: number;
  dbConnections: number;
  cacheHitRate: number;
}

export const DeveloperAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    apiCalls: [],
    errorRate: 0.3,
    avgResponseTime: 45,
    activeUsers: 12,
    dbConnections: 8,
    cacheHitRate: 87.5
  });

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/developer/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Generate demo data
      setAnalytics({
        apiCalls: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          count: Math.floor(Math.random() * 1000) + 500
        })),
        errorRate: 0.3,
        avgResponseTime: 45,
        activeUsers: 12,
        dbConnections: 8,
        cacheHitRate: 87.5
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Developer Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Avg Response Time"
          value={`${analytics.avgResponseTime}ms`}
          icon={Zap}
          color="blue"
          trend="-5ms"
          trendUp={false}
        />
        <MetricCard
          title="Error Rate"
          value={`${analytics.errorRate}%`}
          icon={AlertCircle}
          color="red"
          trend="-0.1%"
          trendUp={false}
        />
        <MetricCard
          title="Active Users"
          value={analytics.activeUsers.toString()}
          icon={Users}
          color="green"
          trend="+3"
          trendUp={true}
        />
        <MetricCard
          title="DB Connections"
          value={analytics.dbConnections.toString()}
          icon={Database}
          color="purple"
          trend="Stable"
          trendUp={true}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${analytics.cacheHitRate}%`}
          icon={TrendingUp}
          color="green"
          trend="+2.5%"
          trendUp={true}
        />
        <MetricCard
          title="API Calls (24h)"
          value="15,234"
          icon={Activity}
          color="blue"
          trend="+12%"
          trendUp={true}
        />
      </div>

      {/* API Calls Chart */}
      <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Calls (Last 24 Hours)</h3>
        <div className="h-64 flex items-end gap-1">
          {analytics.apiCalls.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-500 hover:to-blue-300"
                style={{ height: `${(data.count / 1500) * 100}%` }}
                title={`${data.time}: ${data.count} calls`}
              ></div>
              {i % 4 === 0 && (
                <span className="text-xs text-gray-500 mt-2">{data.time}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Errors</h3>
        <div className="space-y-3">
          <ErrorItem
            time="2 min ago"
            error="TypeError: Cannot read property 'id' of undefined"
            endpoint="/api/projects/123"
            status={500}
          />
          <ErrorItem
            time="15 min ago"
            error="Authentication failed"
            endpoint="/api/auth/login"
            status={401}
          />
          <ErrorItem
            time="1 hour ago"
            error="Database connection timeout"
            endpoint="/api/users"
            status={503}
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Response Time Distribution</h3>
          <div className="space-y-3">
            <DistributionBar label="< 50ms" percentage={65} color="green" />
            <DistributionBar label="50-100ms" percentage={25} color="yellow" />
            <DistributionBar label="100-500ms" percentage={8} color="orange" />
            <DistributionBar label="> 500ms" percentage={2} color="red" />
          </div>
        </div>

        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Endpoints</h3>
          <div className="space-y-3">
            <EndpointItem endpoint="/api/projects" calls={3245} avgTime={42} />
            <EndpointItem endpoint="/api/users" calls={2156} avgTime={38} />
            <EndpointItem endpoint="/api/tasks" calls={1893} avgTime={51} />
            <EndpointItem endpoint="/api/auth/login" calls={1234} avgTime={125} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: any;
  color: string;
  trend?: string;
  trendUp?: boolean;
}> = ({ title, value, icon: Icon, color, trend, trendUp }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
    red: 'from-red-600 to-red-700'
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-sm ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
};

const ErrorItem: React.FC<{
  time: string;
  error: string;
  endpoint: string;
  status: number;
}> = ({ time, error, endpoint, status }) => (
  <div className="flex items-start gap-3 p-3 bg-[#1e1e1e] rounded border border-[#3e3e42]">
    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-white">{error}</span>
        <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded">{status}</span>
      </div>
      <div className="text-xs text-gray-400">{endpoint}</div>
    </div>
    <span className="text-xs text-gray-500">{time}</span>
  </div>
);

const DistributionBar: React.FC<{
  label: string;
  percentage: number;
  color: string;
}> = ({ label, percentage, color }) => {
  const colorClasses = {
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    orange: 'bg-orange-600',
    red: 'bg-red-600'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm text-white">{percentage}%</span>
      </div>
      <div className="h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const EndpointItem: React.FC<{
  endpoint: string;
  calls: number;
  avgTime: number;
}> = ({ endpoint, calls, avgTime }) => (
  <div className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded border border-[#3e3e42]">
    <div>
      <div className="text-sm font-semibold text-white mb-1">{endpoint}</div>
      <div className="text-xs text-gray-400">{calls.toLocaleString()} calls</div>
    </div>
    <div className="text-right">
      <div className="text-sm font-semibold text-blue-400">{avgTime}ms</div>
      <div className="text-xs text-gray-500">avg</div>
    </div>
  </div>
);

