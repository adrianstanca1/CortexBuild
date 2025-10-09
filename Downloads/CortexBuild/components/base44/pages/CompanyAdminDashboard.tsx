import React, { useState, useEffect } from 'react';
import { Users, FolderOpen, FileText, TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface CompanyStats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
  teamMembers: number;
}

export const CompanyAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<CompanyStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    teamMembers: 0
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchCompanyStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchCompanyStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch projects
      const projectsRes = await fetch('http://localhost:3001/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const projectsData = await projectsRes.json();
      const projects = projectsData.data || [];
      
      // Fetch clients
      const clientsRes = await fetch('http://localhost:3001/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const clientsData = await clientsRes.json();
      const clients = clientsData.data || [];
      
      // Fetch invoices
      const invoicesRes = await fetch('http://localhost:3001/api/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const invoicesData = await invoicesRes.json();
      const invoices = invoicesData.data || [];
      
      // Calculate stats
      const activeProjects = projects.filter((p: any) => p.status === 'active').length;
      const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
      
      setStats({
        totalProjects: projects.length,
        activeProjects,
        totalClients: clients.length,
        totalInvoices: invoices.length,
        totalRevenue,
        teamMembers: 1 // Will be updated when we have team management
      });
    } catch (error) {
      console.error('Failed to fetch company stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name || 'Admin'}! Here's your company overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          subtitle={`${stats.activeProjects} active`}
          icon={FolderOpen}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`£${stats.totalRevenue.toLocaleString('en-GB')}`}
          icon={DollarSign}
          color="purple"
          trend="+8%"
        />
        <StatCard
          title="Invoices"
          value={stats.totalInvoices}
          icon={FileText}
          color="orange"
        />
        <StatCard
          title="Team Members"
          value={stats.teamMembers}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={TrendingUp}
          color="pink"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            label="New Project"
            icon={FolderOpen}
            onClick={() => window.location.href = '#/projects/new'}
          />
          <QuickActionButton
            label="New Client"
            icon={Users}
            onClick={() => window.location.href = '#/clients/new'}
          />
          <QuickActionButton
            label="New Invoice"
            icon={FileText}
            onClick={() => window.location.href = '#/invoices/new'}
          />
          <QuickActionButton
            label="View Reports"
            icon={TrendingUp}
            onClick={() => window.location.href = '#/reports'}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">No recent projects to display</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">No upcoming deadlines</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: any;
  color: string;
  subtitle?: string;
  trend?: string;
}> = ({ title, value, icon: Icon, color, subtitle, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && <p className="text-xs text-green-600 mt-1">{trend} from last month</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton: React.FC<{
  label: string;
  icon: any;
  onClick: () => void;
}> = ({ label, icon: Icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
    >
      <Icon className="w-8 h-8 text-gray-600 mb-2" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
};

