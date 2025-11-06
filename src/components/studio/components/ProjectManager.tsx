/**
 * Project Manager Component
 * Handles project creation, management, and organization
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Copy,
  Play,
  Settings,
  Users,
  Calendar,
  Tag,
  Star,
  GitBranch,
  ExternalLink,
  Folder,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  Package
} from 'lucide-react';

import { StudioProject } from '../types/index';
import { useToast } from '../../hooks/useToast';

interface ProjectManagerProps {
  user: any;
  company?: any;
  selectedProject: StudioProject | null;
  onProjectSelect: (project: StudioProject) => void;
  onProjectCreate: (project: Partial<StudioProject>) => void;
  projects: StudioProject[];
  workspaces: any[];
  refreshData: () => void;
}

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'archived' | 'draft';
type FilterType = 'all' | 'web-app' | 'api' | 'mobile' | 'desktop' | 'library';

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  user,
  company,
  selectedProject,
  onProjectSelect,
  onProjectCreate,
  projects,
  workspaces,
  refreshData
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { showToast } = useToast();

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateProject = async (projectData: Partial<StudioProject>) => {
    setIsCreating(true);
    try {
      await onProjectCreate(projectData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectAction = async (action: string, project: StudioProject) => {
    try {
      switch (action) {
        case 'archive':
          // Archive project logic
          showToast({
            type: 'success',
            title: 'Project archived',
            message: `${project.name} has been archived`
          });
          break;
        case 'delete':
          // Delete project logic
          showToast({
            type: 'success',
            title: 'Project deleted',
            message: `${project.name} has been deleted`
          });
          break;
        case 'duplicate': {
          // Duplicate project logic
          const duplicatedProject = {
            ...project,
            name: `${project.name} (Copy)`,
            status: 'draft' as const
          };
          await handleCreateProject(duplicatedProject);
          break;
        }
      }
      refreshData();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Action failed',
        message: `Failed to ${action} project`
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web-app':
        return <Globe className="h-4 w-4" />;
      case 'api':
        return <GitBranch className="h-4 w-4" />;
      case 'mobile':
        return <Settings className="h-4 w-4" />;
      case 'desktop':
        return <Settings className="h-4 w-4" />;
      case 'library':
        return <Package className="h-4 w-4" />;
      default:
        return <Folder className="h-4 w-4" />;
    }
  };

  const ProjectCard: React.FC<{ project: StudioProject }> = ({ project }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className={`
        bg-white rounded-lg border border-gray-200 p-6 cursor-pointer transition-all
        ${selectedProject?.id === project.id ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-md'}
      `}
      onClick={() => onProjectSelect(project)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getTypeIcon(project.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon(project.status)}
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.type)}`}>
            {project.type}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(project.updated_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{project.metadata.collaborator_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitBranch className="h-4 w-4" />
            <span>{project.metadata.deployment_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Tag className="h-4 w-4" />
            <span>{project.tech_stack.length}</span>
          </div>
        </div>

        {project.repository_url && (
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              window.open(project.repository_url, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );

  const ProjectListItem: React.FC<{ project: StudioProject }> = ({ project }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer rounded-lg
        ${selectedProject?.id === project.id ? 'bg-blue-50 border border-blue-200' : ''}
      `}
      onClick={() => onProjectSelect(project)}
    >
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          {getTypeIcon(project.type)}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{project.name}</h3>
          <p className="text-sm text-gray-500">{project.description}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.type)}`}>
            {project.type}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{project.metadata.collaborator_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-600">Manage your development projects</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FilterType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="web-app">Web App</option>
            <option value="api">API</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="library">Library</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Create Project Button */}
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first project'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProjects.map(project => (
                  <ProjectListItem key={project.id} project={project} />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Project</h3>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateProject({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  type: formData.get('type') as any,
                  status: 'draft'
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="My Awesome Project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of your project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="web-app">Web Application</option>
                      <option value="api">API</option>
                      <option value="mobile">Mobile App</option>
                      <option value="desktop">Desktop App</option>
                      <option value="library">Library</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};