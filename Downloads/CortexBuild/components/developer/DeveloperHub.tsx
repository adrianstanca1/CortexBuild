import React, { useState, useEffect } from 'react';
import { Terminal, Code, Database, Activity, Settings, BookOpen, Package, Zap, TrendingUp, Shield } from 'lucide-react';
import { DeveloperConsole } from './DeveloperConsole';
import { DeveloperEnvironment } from './DeveloperEnvironment';
import { DeveloperAPIExplorer } from './DeveloperAPIExplorer';
import { DeveloperAnalytics } from './DeveloperAnalytics';
import { DeveloperSDKManager } from './DeveloperSDKManager';
import { DeveloperDatabaseTools } from './DeveloperDatabaseTools';

type DeveloperTab = 'dashboard' | 'console' | 'code' | 'api' | 'sdk' | 'database' | 'analytics' | 'docs' | 'settings';

interface DeveloperStats {
  apiCalls24h: number;
  activeProjects: number;
  deployments: number;
  errorRate: number;
}

export const DeveloperHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DeveloperTab>('dashboard');
  const [stats, setStats] = useState<DeveloperStats>({
    apiCalls24h: 0,
    activeProjects: 0,
    deployments: 0,
    errorRate: 0
  });
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Check user role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsDeveloper(user.role === 'developer' || user.accessClass === 'developer');
    setIsSuperAdmin(user.role === 'super_admin' || user.accessClass === 'super_admin');
    
    // Fetch developer stats
    fetchDeveloperStats();
  }, []);

  const fetchDeveloperStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/developer/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch developer stats:', error);
      // Set demo stats
      setStats({
        apiCalls24h: 15234,
        activeProjects: 8,
        deployments: 42,
        errorRate: 0.3
      });
    }
  };

  if (!isDeveloper && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-24 h-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You need developer or super admin privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4]">
      {/* Header */}
      <div className="bg-[#252526] border-b border-[#3e3e42] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Developer Hub</h1>
                <p className="text-sm text-gray-400">Production Development Environment</p>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.apiCalls24h.toLocaleString()}</div>
              <div className="text-xs text-gray-500">API Calls (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.activeProjects}</div>
              <div className="text-xs text-gray-500">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.deployments}</div>
              <div className="text-xs text-gray-500">Deployments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.errorRate}%</div>
              <div className="text-xs text-gray-500">Error Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#252526] border-b border-[#3e3e42]">
        <nav className="flex px-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'console', label: 'Console', icon: Terminal },
            { id: 'code', label: 'Code Editor', icon: Code },
            { id: 'api', label: 'API Explorer', icon: Zap },
            { id: 'sdk', label: 'SDK Manager', icon: Package },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'analytics', label: 'Analytics', icon: Activity },
            { id: 'docs', label: 'Documentation', icon: BookOpen },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DeveloperTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'dashboard' && (
          <DeveloperDashboard stats={stats} />
        )}
        
        {activeTab === 'console' && (
          <DeveloperConsole />
        )}
        
        {activeTab === 'code' && (
          <DeveloperEnvironment />
        )}
        
        {activeTab === 'api' && (
          <DeveloperAPIExplorer />
        )}
        
        {activeTab === 'sdk' && (
          <DeveloperSDKManager />
        )}
        
        {activeTab === 'database' && (
          <DeveloperDatabaseTools />
        )}
        
        {activeTab === 'analytics' && (
          <DeveloperAnalytics />
        )}
        
        {activeTab === 'docs' && (
          <DeveloperDocumentation />
        )}
        
        {activeTab === 'settings' && (
          <DeveloperSettings />
        )}
      </div>
    </div>
  );
};

// Dashboard Component
const DeveloperDashboard: React.FC<{ stats: DeveloperStats }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Developer Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="API Calls (24h)"
          value={stats.apiCalls24h.toLocaleString()}
          icon={Zap}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects.toString()}
          icon={Package}
          color="green"
          trend="+2"
        />
        <StatCard
          title="Deployments"
          value={stats.deployments.toString()}
          icon={TrendingUp}
          color="purple"
          trend="+5"
        />
        <StatCard
          title="Error Rate"
          value={`${stats.errorRate}%`}
          icon={Activity}
          color="yellow"
          trend="-0.1%"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-[#252526] rounded-lg p-6 border border-[#3e3e42]">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon={Terminal} label="Open Console" />
          <QuickActionButton icon={Code} label="New Project" />
          <QuickActionButton icon={Database} label="Query Database" />
          <QuickActionButton icon={Zap} label="Test API" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#252526] rounded-lg p-6 border border-[#3e3e42]">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <ActivityItem time="2 min ago" action="Deployed to production" status="success" />
          <ActivityItem time="15 min ago" action="API test completed" status="success" />
          <ActivityItem time="1 hour ago" action="Database migration" status="warning" />
          <ActivityItem time="2 hours ago" action="Code pushed to main" status="success" />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{ title: string; value: string; icon: any; color: string; trend?: string }> = 
  ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
    yellow: 'from-yellow-600 to-yellow-700'
  };

  return (
    <div className="bg-[#252526] rounded-lg p-6 border border-[#3e3e42]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && <span className="text-sm text-green-400">{trend}</span>}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
};

const QuickActionButton: React.FC<{ icon: any; label: string }> = ({ icon: Icon, label }) => (
  <button
    type="button"
    className="flex flex-col items-center gap-2 p-4 bg-[#1e1e1e] rounded-lg border border-[#3e3e42] hover:border-blue-500 transition-colors"
  >
    <Icon className="w-6 h-6 text-blue-400" />
    <span className="text-sm text-gray-300">{label}</span>
  </button>
);

const ActivityItem: React.FC<{ time: string; action: string; status: 'success' | 'warning' | 'error' }> = 
  ({ time, action, status }) => {
  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
      <span className="text-gray-300 flex-1">{action}</span>
      <span className="text-sm text-gray-500">{time}</span>
    </div>
  );
};

const DeveloperDocumentation: React.FC = () => (
  <div className="bg-[#252526] rounded-lg p-6 border border-[#3e3e42]">
    <h2 className="text-2xl font-bold text-white mb-4">API Documentation</h2>
    <p className="text-gray-400">Documentation interface coming soon...</p>
  </div>
);

const DeveloperSettings: React.FC = () => (
  <div className="bg-[#252526] rounded-lg p-6 border border-[#3e3e42]">
    <h2 className="text-2xl font-bold text-white mb-4">Developer Settings</h2>
    <p className="text-gray-400">Settings interface coming soon...</p>
  </div>
);

