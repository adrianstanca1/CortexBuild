import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  FolderOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  LogOut,
  User,
  Building2,
  FileText,
  Activity
} from 'lucide-react';
import { User as UserType, DashboardStats } from '../types';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    completedTasks: 0,
    totalTasks: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data - in real app this would come from API
      setStats({
        totalProjects: 24,
        activeProjects: 18,
        totalClients: 156,
        totalRevenue: 2450000,
        monthlyRevenue: 185000,
        pendingInvoices: 12,
        overdueInvoices: 3,
        completedTasks: 89,
        totalTasks: 124,
      });

      setRecentActivity([
        { id: 1, type: 'project', message: 'New project "Downtown Complex" created', time: '2 hours ago' },
        { id: 2, type: 'invoice', message: 'Invoice #INV-2024-001 paid', time: '4 hours ago' },
        { id: 3, type: 'task', message: 'Task "Foundation inspection" completed', time: '6 hours ago' },
        { id: 4, type: 'client', message: 'New client "ABC Construction" added', time: '1 day ago' },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, to, color }: any) => (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
      >
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </motion.div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ConstructAI</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/settings"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FolderOpen}
            color="bg-blue-500"
            change={12}
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={Activity}
            color="bg-green-500"
            change={8}
          />
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={Users}
            color="bg-purple-500"
            change={15}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${(stats.monthlyRevenue / 1000).toFixed(0)}k`}
            icon={DollarSign}
            color="bg-yellow-500"
            change={23}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            title="New Project"
            description="Create a new construction project"
            icon={FolderOpen}
            to="/projects"
            color="bg-blue-500"
          />
          <QuickActionCard
            title="Add Client"
            description="Register a new client"
            icon={Users}
            to="/clients"
            color="bg-green-500"
          />
          <QuickActionCard
            title="Create Invoice"
            description="Generate a new invoice"
            icon={FileText}
            to="/invoices"
            color="bg-purple-500"
          />
          <QuickActionCard
            title="View Reports"
            description="Access analytics and reports"
            icon={BarChart3}
            to="/reports"
            color="bg-orange-500"
          />
        </div>

        {/* Recent Activity & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Task Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Task Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Completed</span>
                </div>
                <span className="text-sm font-bold text-green-600">{stats.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">In Progress</span>
                </div>
                <span className="text-sm font-bold text-yellow-600">{stats.totalTasks - stats.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-900">Overdue</span>
                </div>
                <span className="text-sm font-bold text-red-600">3</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Role-specific content */}
        {(user.role === 'admin' || user.role === 'super_admin') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-6 text-white"
          >
            <h2 className="text-xl font-bold mb-4">Admin Panel Access</h2>
            <p className="mb-4">You have administrative privileges. Access advanced features and system management.</p>
            <div className="flex space-x-4">
              <Link
                to="/admin"
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Admin Dashboard
              </Link>
              {user.role === 'super_admin' && (
                <Link
                  to="/super-admin"
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  Super Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {user.role === 'developer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-green-600 to-teal-500 rounded-xl p-6 text-white"
          >
            <h2 className="text-xl font-bold mb-4">Developer Tools</h2>
            <p className="mb-4">Access to developer console, API documentation, and debugging tools.</p>
            <Link
              to="/developer"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              Developer Dashboard
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;