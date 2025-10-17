/**
 * Enhanced Dashboard Component
 * Features:
 * - Real-time statistics
 * - API health monitoring
 * - User session info
 * - Quick actions
 * - Recent activity
 */

import React, { useState, useEffect } from 'react';
import * as authService from '../../auth/authService';
import { RealtimeStats } from './RealtimeStats';
import { RecentActivity } from './RecentActivity';
import { NotificationCenter } from './NotificationCenter';
import { DeveloperDashboard } from '../developer/DeveloperDashboard';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  teamMembers: number;
  pendingRFIs: number;
  openPunchItems: number;
}

interface HealthStatus {
  api: string;
  database: string;
  timestamp: string;
  uptime: number;
  version: string;
  stats?: {
    users: number;
    sessions: number;
    companies: number;
  };
}

export const EnhancedDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    teamMembers: 24,
    pendingRFIs: 15,
    openPunchItems: 47,
  });

  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load current user
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      // Load health status
      const health = await authService.getHealthStatus();
      setHealthStatus(health);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickAction: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
  }> = ({ title, description, icon, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left w-full"
    >
      <div className="p-2 bg-blue-50 rounded-lg mr-4">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentUser?.role === 'developer') {
    return <DeveloperDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Welcome back, {currentUser?.name || 'User'}!</h1>
        <p className="mt-2 text-blue-100">
          {currentUser?.role === 'super_admin' ? 'Platform Administrator' :
            currentUser?.role === 'company_admin' ? 'Company Administrator' :
              'Team Member'}
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {currentUser?.email}
          </div>
          {currentUser?.companyName && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              {currentUser.companyName}
            </div>
          )}
        </div>
      </div>

      {/* System Health Status */}
      {healthStatus && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthStatus.api === 'healthy' && healthStatus.database === 'healthy'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {healthStatus.api === 'healthy' && healthStatus.database === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${healthStatus.api === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">API: {healthStatus.api}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${healthStatus.database === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">Database: {healthStatus.database}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Version: {healthStatus.version}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Uptime: {Math.floor(healthStatus.uptime / 60)}m</span>
            </div>
          </div>
          {healthStatus.stats && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{healthStatus.stats.users}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{healthStatus.stats.sessions}</p>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{healthStatus.stats.companies}</p>
                  <p className="text-sm text-gray-600">Companies</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          color="bg-blue-100"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="bg-green-100"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Team Members"
          value={stats.teamMembers}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="bg-purple-100"
        />
        <StatCard
          title="Pending RFIs"
          value={stats.pendingRFIs}
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-yellow-100"
        />
        <StatCard
          title="Open Punch Items"
          value={stats.openPunchItems}
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="bg-red-100"
        />
        <StatCard
          title="Completed Projects"
          value={stats.completedProjects}
          icon={
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-teal-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="New Project"
            description="Create a new construction project"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            onClick={() => console.log('New Project')}
          />
          <QuickAction
            title="Submit RFI"
            description="Request for information"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            onClick={() => console.log('Submit RFI')}
          />
          <QuickAction
            title="Add Punch Item"
            description="Create a new punch list item"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            onClick={() => console.log('Add Punch Item')}
          />
          <QuickAction
            title="View Reports"
            description="Access project reports"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            onClick={() => console.log('View Reports')}
          />
        </div>
      </div>

      {/* Real-time Statistics */}
      <RealtimeStats />

      {/* Performance Charts */}
      <PerformanceCharts />

      {/* Two Column Layout for Activity and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity />

        {/* Notification Center */}
        <NotificationCenter />
      </div>
    </div>
  );
};

