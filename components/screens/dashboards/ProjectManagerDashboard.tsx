import React from 'react';
import { User } from '../../../types';
import { Card } from '../../ui/Card';
import { Building2, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface ProjectManagerDashboardProps {
  currentUser: User;
  navigateTo: (screen: any, params?: any) => void;
}

/**
 * Project Manager Dashboard
 * Focused on project oversight, team coordination, and budget management
 */
const ProjectManagerDashboard: React.FC<ProjectManagerDashboardProps> = ({ currentUser, navigateTo }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {currentUser.firstName || currentUser.email}</p>
        </div>
        <button
          onClick={() => navigateTo('create-project')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <Building2 className="h-12 w-12 text-blue-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 2 new this month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">48</p>
            </div>
            <Users className="h-12 w-12 text-purple-500" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Across all projects</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">$2.4M</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">82% utilized</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">67%</p>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">On track</p>
        </Card>
      </div>

      {/* Projects Requiring Attention */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Projects Requiring Attention</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Tower A Construction</p>
                <p className="text-sm text-gray-600">Budget: 92% used • Timeline: 3 days behind</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('project-home', { projectId: 'proj-1' })}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Review
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">Bridge Renovation</p>
                <p className="text-sm text-gray-600">Budget: 105% used • 2 safety incidents</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('project-home', { projectId: 'proj-2' })}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Review
            </button>
          </div>
        </div>
      </Card>

      {/* Recent Activity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">Task completed: Foundation pour</p>
                <p className="text-xs text-gray-500">Tower A • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">Team member added: John Smith</p>
                <p className="text-xs text-gray-500">Bridge Renovation • 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">Invoice paid: $45,000</p>
                <p className="text-xs text-gray-500">Shopping Mall • Yesterday</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Tasks</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">Safety inspection due</p>
                <p className="text-xs text-gray-500">Tower A • Due today</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">Budget review meeting</p>
                <p className="text-xs text-gray-500">All Projects • Tomorrow 10 AM</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">Client presentation</p>
                <p className="text-xs text-gray-500">Shopping Mall • Friday 2 PM</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigateTo('tasks')}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
          >
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">View All Projects</p>
          </button>
          <button
            onClick={() => navigateTo('team')}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
          >
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Team</p>
          </button>
          <button
            onClick={() => navigateTo('financial-dashboard')}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Financial Reports</p>
          </button>
          <button
            onClick={() => navigateTo('calendar')}
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
          >
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">View Calendar</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ProjectManagerDashboard;
