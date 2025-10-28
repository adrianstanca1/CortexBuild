'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  activeProjects: number;
  totalClients: number;
  teamMembers: number;
  monthlyRevenue: number;
}

interface RecentProject {
  id: string;
  name: string;
  client: string;
  status: 'In Progress' | 'Planning' | 'Completed' | 'On Hold';
  progress: number;
}

interface UpcomingTask {
  id: string;
  title: string;
  due: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const mockStats: DashboardStats = {
  activeProjects: 12,
  totalClients: 48,
  teamMembers: 23,
  monthlyRevenue: 125430,
};

const mockRecentProjects: RecentProject[] = [
  {
    id: '1',
    name: 'Roofing - 123 Main St',
    client: 'ABC Construction',
    status: 'In Progress',
    progress: 75,
  },
  {
    id: '2',
    name: 'Cladding - Office Complex',
    client: 'Premier Developments',
    status: 'Planning',
    progress: 25,
  },
  {
    id: '3',
    name: 'Roof Repair - Heritage Building',
    client: 'Heritage Properties',
    status: 'Completed',
    progress: 100,
  },
  {
    id: '4',
    name: 'New Build Cladding',
    client: 'Modern Homes Ltd',
    status: 'In Progress',
    progress: 60,
  },
];

const mockUpcomingTasks: UpcomingTask[] = [
  {
    id: '1',
    title: 'Site inspection - Main St project',
    due: 'Today',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Material delivery coordination',
    due: 'Tomorrow',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Client meeting - Heritage Properties',
    due: 'Friday',
    priority: 'high',
  },
  {
    id: '4',
    title: 'Safety training session',
    due: 'Next week',
    priority: 'low',
  },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'planning':
      return 'bg-yellow-100 text-yellow-800';
    case 'on hold':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRecentProjects(mockRecentProjects);
      setUpcomingTasks(mockUpcomingTasks);
      setLoading(false);
    };

    loadData();
  }, []);

  const statsCards = [
    {
      name: 'Active Projects',
      value: stats.activeProjects.toString(),
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: ClipboardDocumentListIcon,
      color: 'blue',
    },
    {
      name: 'Total Clients',
      value: stats.totalClients.toString(),
      change: '+5.4%',
      changeType: 'positive' as const,
      icon: BuildingOfficeIcon,
      color: 'green',
    },
    {
      name: 'Team Members',
      value: stats.teamMembers.toString(),
      change: '+1.2%',
      changeType: 'positive' as const,
      icon: UsersIcon,
      color: 'purple',
    },
    {
      name: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: CurrencyDollarIcon,
      color: 'yellow',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card h-96"></div>
          <div className="card h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, Adrian!</h1>
        <p className="text-primary-100 mt-2">
          Here's what's happening with your construction projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card-hover">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.client}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`badge ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div>
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
              <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{task.due}</p>
                      <span className={`badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-primary-900">
                    Create New Project
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Add New Client</span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <UsersIcon className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    Schedule Team Meeting
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
