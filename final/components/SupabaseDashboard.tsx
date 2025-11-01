// 📊 Supabase Dashboard Component
// Real-time dashboard with live data from Supabase

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Wrench, AlertTriangle, CheckCircle, 
  TrendingUp, Calendar, MapPin, Activity, Database 
} from 'lucide-react';
import { useProjects } from '../hooks/useSupabase';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';
import { projects, tasks, equipment, safety, users } from '../lib/supabase';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalEquipment: number;
  availableEquipment: number;
  safetyIncidents: number;
  totalUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'task' | 'safety' | 'equipment';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export default function SupabaseDashboard() {
  const { user } = useUnifiedAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    safetyIncidents: 0,
    totalUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock company ID for demo - in real app this would come from user context
  const companyId = 'demo-company-1';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [
        projectsResult,
        usersResult,
        equipmentResult
      ] = await Promise.all([
        projects.getByCompany(companyId),
        users.getByCompany(companyId),
        equipment.getByCompany(companyId)
      ]);

      if (projectsResult.error) throw new Error(projectsResult.error.message);
      if (usersResult.error) throw new Error(usersResult.error.message);
      if (equipmentResult.error) throw new Error(equipmentResult.error.message);

      const projectsData = projectsResult.data || [];
      const usersData = usersResult.data || [];
      const equipmentData = equipmentResult.data || [];

      // Calculate project stats
      const activeProjects = projectsData.filter(p => p.status === 'active').length;

      // Get tasks for all projects
      let allTasks: any[] = [];
      let allIncidents: any[] = [];

      for (const project of projectsData) {
        const [tasksResult, incidentsResult] = await Promise.all([
          tasks.getByProject(project.id),
          safety.getIncidents(project.id)
        ]);

        if (tasksResult.data) allTasks = [...allTasks, ...tasksResult.data];
        if (incidentsResult.data) allIncidents = [...allIncidents, ...incidentsResult.data];
      }

      const completedTasks = allTasks.filter(t => t.status === 'completed').length;
      const availableEquipment = equipmentData.filter(e => e.status === 'available').length;

      setStats({
        totalProjects: projectsData.length,
        activeProjects,
        totalTasks: allTasks.length,
        completedTasks,
        totalEquipment: equipmentData.length,
        availableEquipment,
        safetyIncidents: allIncidents.length,
        totalUsers: usersData.length
      });

      // Generate recent activity
      const activities: RecentActivity[] = [
        ...projectsData.slice(0, 3).map(p => ({
          id: p.id,
          type: 'project' as const,
          title: `Project: ${p.name}`,
          description: `Status: ${p.status}`,
          timestamp: p.updated_at || p.created_at,
          user: p.project_manager?.first_name
        })),
        ...allTasks.slice(0, 3).map(t => ({
          id: t.id,
          type: 'task' as const,
          title: `Task: ${t.name}`,
          description: `Progress: ${t.progress_percentage}%`,
          timestamp: t.updated_at || t.created_at,
          user: t.assigned_user?.first_name
        })),
        ...allIncidents.slice(0, 2).map(i => ({
          id: i.id,
          type: 'safety' as const,
          title: `Safety Incident: ${i.title}`,
          description: `Severity: ${i.severity}`,
          timestamp: i.incident_date,
          user: i.reported_by_user?.first_name
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentActivity(activities.slice(0, 8));

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project': return <Building2 className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'equipment': return <Wrench className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project': return 'text-blue-600 bg-blue-100';
      case 'task': return 'text-green-600 bg-green-100';
      case 'safety': return 'text-red-600 bg-red-100';
      case 'equipment': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="font-medium text-red-900">Error Loading Dashboard</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <Database className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">Live Database</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              <p className="text-xs text-green-600">{stats.activeProjects} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
              <p className="text-xs text-green-600">{stats.completedTasks} completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
              <p className="text-xs text-green-600">{stats.availableEquipment} available</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Safety</p>
              <p className="text-2xl font-bold text-gray-900">{stats.safetyIncidents}</p>
              <p className="text-xs text-gray-600">incidents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(activity.timestamp).toLocaleDateString()}
                      {activity.user && (
                        <>
                          <span className="mx-1">•</span>
                          <Users className="h-3 w-3 mr-1" />
                          {activity.user}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Building2 className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">New Project</p>
              <p className="text-sm text-gray-500">Start a new construction project</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Report Incident</p>
              <p className="text-sm text-gray-500">Log a safety incident</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Wrench className="h-6 w-6 text-yellow-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Equipment</p>
              <p className="text-sm text-gray-500">Register new equipment</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
