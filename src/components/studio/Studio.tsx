/**
 * Enhanced Studio - Comprehensive Development Environment
 * Features: Project Management, AI Code Generation, Testing, Deployment
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Play,
  Settings,
  Users,
  GitBranch,
  Database,
  Cloud,
  TestTube,
  FileText,
  Zap,
  Activity,
  Terminal,
  Layers,
  Workflow,
  Bot,
  BarChart3,
  Package,
  Globe,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Import studio components
import { ProjectManager } from './components/ProjectManager';
import { CodeGenerator } from './components/CodeGenerator';
import { TestingSuite } from './components/TestingSuite';
import { DeploymentManager } from './components/DeploymentManager';
import { WorkspaceManager } from './components/WorkspaceManager';
import { CollaborationHub } from './components/CollaborationHub';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AIToolsPanel } from './components/AIToolsPanel';
import { TerminalPanel } from './components/TerminalPanel';

// Import types and services
import { StudioProject, StudioWorkspace, DeploymentConfig } from './types/index';
import { studioAPI } from './services/studioAPI';
import { useToast } from '../../hooks/useToast';

interface StudioProps {
  user: any;
  company?: any;
  onProjectSelect?: (project: StudioProject) => void;
}

type StudioTab =
  | 'projects'
  | 'code-generator'
  | 'testing'
  | 'deployment'
  | 'workspaces'
  | 'collaboration'
  | 'analytics'
  | 'ai-tools'
  | 'terminal';

interface TabConfig {
  id: StudioTab;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: string;
}

const STUDIO_TABS: TabConfig[] = [
  {
    id: 'projects',
    label: 'Projects',
    icon: Package,
    description: 'Manage development projects'
  },
  {
    id: 'code-generator',
    label: 'AI Code Gen',
    icon: Bot,
    description: 'AI-powered code generation',
    badge: 'Pro'
  },
  {
    id: 'testing',
    label: 'Testing',
    icon: TestTube,
    description: 'Test suites and validation'
  },
  {
    id: 'deployment',
    label: 'Deploy',
    icon: Cloud,
    description: 'Deployment management'
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    icon: Layers,
    description: 'Workspace management'
  },
  {
    id: 'collaboration',
    label: 'Collab',
    icon: Users,
    description: 'Real-time collaboration'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Performance monitoring'
  },
  {
    id: 'ai-tools',
    label: 'AI Tools',
    icon: Zap,
    description: 'Advanced AI utilities'
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: Terminal,
    description: 'Integrated terminal'
  }
];

export const Studio: React.FC<StudioProps> = ({
  user,
  company,
  onProjectSelect
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('projects');
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [workspaces, setWorkspaces] = useState<StudioWorkspace[]>([]);
  const [selectedProject, setSelectedProject] = useState<StudioProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeDeployments: 0,
    apiCalls: 0,
    collaborators: 0
  });

  const { showToast } = useToast();

  // Load initial data
  useEffect(() => {
    loadStudioData();
    loadStats();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadStats();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user.id]);

  const loadStudioData = async () => {
    try {
      setIsLoading(true);

      // Load projects and workspaces in parallel
      const [projectsData, workspacesData] = await Promise.all([
        studioAPI.getProjects(user.id),
        studioAPI.getWorkspaces(user.id)
      ]);

      setProjects(projectsData);
      setWorkspaces(workspacesData);

      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0]);
        onProjectSelect?.(projectsData[0]);
      }
    } catch (error) {
      console.error('Failed to load studio data:', error);
      showToast({
        type: 'error',
        title: 'Failed to load studio',
        message: 'Could not load projects and workspaces'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await studioAPI.getStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleProjectSelect = useCallback((project: StudioProject) => {
    setSelectedProject(project);
    onProjectSelect?.(project);
  }, [onProjectSelect]);

  const handleProjectCreate = useCallback(async (projectData: Partial<StudioProject>) => {
    try {
      const newProject = await studioAPI.createProject({
        ...projectData,
        developer_id: user.id,
        company_id: company?.id
      });

      setProjects(prev => [newProject, ...prev]);
      setSelectedProject(newProject);
      onProjectSelect?.(newProject);

      showToast({
        type: 'success',
        title: 'Project created',
        message: `${newProject.name} has been created successfully`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to create project',
        message: 'Could not create the project'
      });
    }
  }, [user.id, company?.id, onProjectSelect, showToast]);

  const renderTabContent = () => {
    const commonProps = {
      user,
      company,
      selectedProject,
      onProjectSelect: handleProjectSelect,
      onProjectCreate: handleProjectCreate,
      projects,
      workspaces,
      refreshData: loadStudioData
    };

    switch (activeTab) {
      case 'projects':
        return <ProjectManager {...commonProps} />;
      case 'code-generator':
        return <CodeGenerator {...commonProps} />;
      case 'testing':
        return <TestingSuite {...commonProps} />;
      case 'deployment':
        return <DeploymentManager {...commonProps} />;
      case 'workspaces':
        return <WorkspaceManager {...commonProps} />;
      case 'collaboration':
        return <CollaborationHub {...commonProps} />;
      case 'analytics':
        return <AnalyticsDashboard {...commonProps} />;
      case 'ai-tools':
        return <AIToolsPanel {...commonProps} />;
      case 'terminal':
        return <TerminalPanel {...commonProps} />;
      default:
        return <ProjectManager {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CortexBuild Studio</h1>
                <p className="text-sm text-gray-600">Professional Development Environment</p>
              </div>
            </div>

            {/* Live Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{stats.totalProjects} Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{stats.activeDeployments} Deployments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">{stats.apiCalls} API Calls</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">{stats.collaborators} Collaborators</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{company?.name || 'Personal'}</p>
            </div>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Tab Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {STUDIO_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.badge && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="px-4 pb-6 border-t border-gray-200 pt-6">
            <div className="space-y-2">
              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <Settings className="mr-3 h-4 w-4" />
                Studio Settings
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <FileText className="mr-3 h-4 w-4" />
                Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Studio;