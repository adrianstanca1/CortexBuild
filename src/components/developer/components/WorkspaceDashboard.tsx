/**
 * Workspace Dashboard Component
 * Main dashboard for developer console showing workspace overview
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  Database,
  Bug,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Server,
  Layers,
  Workflow,
  Bot,
  Terminal,
  FileText,
  Code2
} from 'lucide-react';

import { DeveloperWorkspace, DebugSession } from '../types/index';
import { developerAPI } from '../services/developerAPI';
import { useToast } from '../../hooks/useToast';

interface WorkspaceDashboardProps {
  user: any;
  company?: any;
  selectedWorkspace: DeveloperWorkspace | null;
  onWorkspaceSelect: (workspace: DeveloperWorkspace) => void;
  workspaces: DeveloperWorkspace[];
  debugSessions: DebugSession[];
  analytics: any;
  refreshData: () => void;
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  user,
  selectedWorkspace,
  onWorkspaceSelect,
  workspaces,
  debugSessions,
  analytics,
  refreshData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const { showToast } = useToast();

  // Filter workspaces based on search and status
  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesSearch = workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workspace.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workspace.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateWorkspace = async () => {
    setIsCreatingWorkspace(true);
    try {
      const newWorkspace = await developerAPI.createWorkspace({
        name: `New Workspace ${Date.now()}`,
        description: 'A new development workspace',
        type: 'development',
        status: 'active',
        developer_id: user.id,
        company_id: user.company_id,
        settings: {
          allow_external_collaboration: false,
          require_approval_for_changes: true,
          auto_save: true,
          notifications: true,
          debugging_enabled: true,
          performance_monitoring: true,
          error_tracking: true
        }
      });

      refreshData();
      onWorkspaceSelect(newWorkspace);

      showToast({
        type: 'success',
        title: 'Workspace created',
        message: `${newWorkspace.name} has been created successfully`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to create workspace',
        message: 'Could not create the workspace'
      });
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const handleWorkspaceAction = async (action: string, workspace: DeveloperWorkspace) => {
    try {
      switch (action) {
        case 'activate':
          await developerAPI.updateWorkspace(workspace.id, { status: 'active' });
          break;
        case 'deactivate':
          await developerAPI.updateWorkspace(workspace.id, { status: 'inactive' });
          break;
        case 'delete':
          await developerAPI.deleteWorkspace(workspace.id);
          break;
      }
      refreshData();

      showToast({
        type: 'success',
        title: 'Workspace updated',
        message: `Workspace ${action}d successfully`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Action failed',
        message: `Failed to ${action} workspace`
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Pause className="h-4 w-4 text-gray-500" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'development':
        return <Code2 className="h-4 w-4" />;
      case 'testing':
        return <Bug className="h-4 w-4" />;
      case 'staging':
        return <Server className="h-4 w-4" />;
      case 'production':
        return <Globe className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const WorkspaceCard: React.FC<{ workspace: DeveloperWorkspace }> = ({ workspace }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className={`
        bg-gray-800 rounded-lg border border-gray-700 p-6 cursor-pointer transition-all
        ${selectedWorkspace?.id === workspace.id ? 'ring-2 ring-purple-500 border-purple-500' : 'hover:bg-gray-750'}
      `}
      onClick={() => onWorkspaceSelect(workspace)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            {getTypeIcon(workspace.type)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{workspace.name}</h3>
            <p className="text-sm text-gray-400">{workspace.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon(workspace.status)}
          <button className="p-1 hover:bg-gray-700 rounded">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(workspace.status)}`}>
            {workspace.status}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(workspace.type)}`}>
            {workspace.type}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(workspace.updated_at).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300">{workspace.members.length} members</span>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300">{workspace.projects.length} projects</span>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300">{workspace.metadata.active_sessions} active</span>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300">{workspace.metadata.performance_score}% perf</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-white">Workspace Dashboard</h2>
          <p className="text-sm text-gray-400">Manage your development workspaces</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Create Workspace Button */}
          <motion.button
            onClick={handleCreateWorkspace}
            disabled={isCreatingWorkspace}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingWorkspace ? 'Creating...' : 'New Workspace'}
          </motion.button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-6 border-b border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Workspaces</p>
                <p className="text-2xl font-semibold text-white">{workspaces.length}</p>
              </div>
              <Layers className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Sessions</p>
                <p className="text-2xl font-semibold text-white">
                  {workspaces.reduce((acc, w) => acc + w.metadata.active_sessions, 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Errors</p>
                <p className="text-2xl font-semibold text-white">
                  {workspaces.reduce((acc, w) => acc + w.metadata.total_errors, 0)}
                </p>
              </div>
              <Bug className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Performance</p>
                <p className="text-2xl font-semibold text-white">
                  {workspaces.length > 0
                    ? Math.round(workspaces.reduce((acc, w) => acc + w.metadata.performance_score, 0) / workspaces.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredWorkspaces.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No workspaces found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first workspace'}
            </p>
            <button
              onClick={handleCreateWorkspace}
              disabled={isCreatingWorkspace}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreatingWorkspace ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map(workspace => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        )}
      </div>

      {/* Selected Workspace Details */}
      {selectedWorkspace && (
        <div className="border-t border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Workspace Details</h3>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                Configure
              </button>
              <button className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600">
                View Logs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">External Collaboration</span>
                  <span className={selectedWorkspace.settings.allow_external_collaboration ? 'text-green-400' : 'text-red-400'}>
                    {selectedWorkspace.settings.allow_external_collaboration ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Auto Save</span>
                  <span className={selectedWorkspace.settings.auto_save ? 'text-green-400' : 'text-red-400'}>
                    {selectedWorkspace.settings.auto_save ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Error Tracking</span>
                  <span className={selectedWorkspace.settings.error_tracking ? 'text-green-400' : 'text-red-400'}>
                    {selectedWorkspace.settings.error_tracking ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Performance Score</span>
                  <span className="text-white">{selectedWorkspace.metadata.performance_score}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-white">{selectedWorkspace.metadata.uptime_percentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Sessions</span>
                  <span className="text-white">{selectedWorkspace.metadata.active_sessions}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Members</h4>
              <div className="space-y-2">
                {selectedWorkspace.members.slice(0, 3).map(member => (
                  <div key={member.user_id} className="flex items-center space-x-2">
                    <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">
                        {member.user_id.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">User {member.user_id}</p>
                      <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </div>
                ))}
                {selectedWorkspace.members.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{selectedWorkspace.members.length - 3} more members
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};