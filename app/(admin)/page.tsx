'use client';

/**
 * Admin Page - Super Admin & Company Admin Dashboard
 * Full-featured admin interface with management panels
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Building2, Settings, BarChart3, Database, Shield,
  TrendingUp, Activity, DollarSign, FolderKanban, AlertCircle,
  Plus, Search, Filter, Download
} from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">
                  {isSuperAdmin ? 'SUPER ADMIN' : 'COMPANY ADMIN'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'companies', label: 'Companies', icon: Building2 },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && <OverviewTab isSuperAdmin={isSuperAdmin} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'companies' && <CompaniesTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

// Overview Tab
function OverviewTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isSuperAdmin ? [
          { label: 'Total Users', value: '15,489', change: '+12%', icon: Users, color: 'blue' },
          { label: 'Companies', value: '247', change: '+8%', icon: Building2, color: 'green' },
          { label: 'Active Projects', value: '1,234', change: '+23%', icon: FolderKanban, color: 'purple' },
          { label: 'Revenue', value: '$124K', change: '+15%', icon: DollarSign, color: 'orange' }
        ] : [
          { label: 'Team Members', value: '156', change: '+12', icon: Users, color: 'blue' },
          { label: 'Active Projects', value: '24', change: '+3', icon: FolderKanban, color: 'green' },
          { label: 'Tasks This Week', value: '89', change: '+15', icon: Activity, color: 'purple' },
          { label: 'Budget Used', value: '67%', change: '-5%', icon: DollarSign, color: 'orange' }
        ]}.map((metric, i) => {
          const Icon = metric.icon;
          const colorClasses: any = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
          };

          return (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[metric.color]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-semibold ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-500">{metric.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'New user registered', time: '2 min ago', type: 'user' },
              { action: 'Project created', time: '15 min ago', type: 'project' },
              { action: 'Payment processed', time: '1 hour ago', type: 'payment' },
              { action: 'API key generated', time: '2 hours ago', type: 'api' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.action}</div>
                  <div className="text-xs text-gray-500">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            {[
              { label: 'API Response Time', value: '45ms', status: 'good' },
              { label: 'Database Queries', value: '1,234/sec', status: 'good' },
              { label: 'Active Connections', value: '856', status: 'good' },
              { label: 'Error Rate', value: '0.02%', status: 'good' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Users Tab
function UsersTab() {
  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: 'Adrian Stanca', email: 'adrian.stanca1@gmail.com', role: 'Super Admin', company: 'Platform', status: 'active' },
                { name: 'John Doe', email: 'john@company.com', role: 'Company Admin', company: 'ABC Construction', status: 'active' },
                { name: 'Jane Smith', email: 'jane@company.com', role: 'Developer', company: 'XYZ Tech', status: 'active' }
              ].map((user, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Companies Tab
function CompaniesTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'ABC Construction', users: 45, projects: 12, status: 'active' },
          { name: 'XYZ Tech', users: 23, projects: 8, status: 'active' },
          { name: 'BuildCo', users: 67, projects: 18, status: 'active' }
        ].map((company, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {company.name.charAt(0)}
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {company.status}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{company.name}</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Users:</span>
                <span className="font-medium">{company.users}</span>
              </div>
              <div className="flex justify-between">
                <span>Projects:</span>
                <span className="font-medium">{company.projects}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                Manage
              </button>
              <button className="flex-1 text-sm text-gray-600 hover:text-gray-700 font-medium">
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Analytics Tab
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Analytics & Reports</h3>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p>Analytics charts will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {[
          { label: 'Platform Configuration', desc: 'General platform settings' },
          { label: 'Security & Permissions', desc: 'Access control and security' },
          { label: 'Email Notifications', desc: 'Configure email templates' },
          { label: 'API Settings', desc: 'API keys and rate limiting' },
          { label: 'Backup & Recovery', desc: 'Database backup configuration' }
        ].map((setting, i) => (
          <div key={i} className="p-6 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{setting.label}</h4>
                <p className="text-sm text-gray-500 mt-1">{setting.desc}</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
