/**
 * Enhanced Developer Console
 * Advanced workspace management, debugging, analytics, and collaboration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Activity,
  Users,
  Database,
  Settings,
  Bug,
  BarChart3,
  GitBranch,
  Terminal,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Monitor,
  Workflow,
  Bot,
  Globe,
  Server,
  Layers,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Eye,
  MessageSquare,
  Bell,
  Search,
  Filter,
  Plus,
  MoreVertical
} from 'lucide-react';

// Import developer console components
import { WorkspaceDashboard } from './components/WorkspaceDashboard';
import { DebuggingPanel } from './components/DebuggingPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { CollaborationPanel } from './components/CollaborationPanel';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { ErrorTracker } from './components/ErrorTracker';
import { APIExplorer } from './components/APIExplorer';
import { DatabaseManager } from './components/DatabaseManager';
import { WorkflowManager } from './components/WorkflowManager';
import { AIAgentManager } from './components/AIAgentManager';

// Import types and services
import { DeveloperWorkspace, DebugSession, AnalyticsData } from './types';
import { developerAPI } from './services/developerAPI';
import { useToast } from '../../hooks/useToast';

interface DeveloperConsoleProps {
  user: any;
  company?: any;
  onWorkspaceSelect?: (workspace: DeveloperWorkspace) => void;
}

type ConsoleTab =
  | 'dashboard'
  | 'debugging'
  | 'analytics'
  | 'collaboration'
  | 'performance'
  | 'errors'
  | 'api-explorer'
  | 'database'
  | 'workflows'
  | 'ai-agents';

interface TabConfig {
  id: ConsoleTab;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: string;
  status?: 'active' | 'inactive' | 'warning' | 'error';
}

const CONSOLE_TABS: TabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Monitor,
    description: 'Workspace overview and management'
  },
  {
    id: 'debugging',
    label: 'Debugging',
    icon: Bug,
    description: 'Advanced debugging tools',
    status: 'active'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Performance and usage analytics'
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    icon: Users,
    description: 'Real-time team collaboration'
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: Activity,
    description: 'Performance monitoring'
  },
  {
    id: 'errors',
    label: 'Error Tracker',
    icon: AlertCircle,
    description: 'Error tracking and management',
    status: 'warning'
  },
  {
    id: 'api-explorer',
    label: 'API Explorer',
    icon: Globe,
    description: 'API testing and exploration'
  },
  {
    id: 'database',
    label: 'Database',
    icon: Database,
    description: 'Database management tools'
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: Workflow,
    description: 'Workflow automation'
  },
  {
    id: 'ai-agents',
    label: 'AI Agents',
    icon: Bot,
    description: 'AI agent management'
  }
];

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({
  user,
  company,
  onWorkspaceSelect
}) => {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('dashboard');
  const [workspaces, setWorkspaces] = useState<DeveloperWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<DeveloperWorkspace | null>(null);
  const [debugSessions, setDebugSessions] = useState<DebugSession[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeStats, setRealtimeStats] = useState({
    activeUsers: 0,
    apiCalls: 0,
    errors: 0,
    performance: 0
  });

  const { showToast } = useToast();

  // Load initial data
  useEffect(() => {
    loadConsoleData();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadRealtimeStats();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [user.id]);

  const loadConsoleData = async () => {
    try {
      setIsLoading(true);

      // Load workspaces, debug sessions, and analytics in parallel
      const [workspacesData, sessionsData, analyticsData] = await Promise.all([
        developerAPI.getWorkspaces(user.id),
        developerAPI.getDebugSessions(user.id),
        developerAPI.getAnalytics(user.id)
      ]);

      setWorkspaces(workspacesData);
      setDebugSessions(sessionsData);
      setAnalytics(analyticsData);

      if (workspacesData.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(workspacesData[0]);
        onWorkspaceSelect?.(workspacesData[0]);
      }
    } catch (error) {
      console.error('Failed to load console data:', error);
      showToast({
        type: 'error',
        title: 'Failed to load console',
        message: 'Could not load workspaces and debug sessions'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealtimeStats = async () => {
    try {
      const stats = await developerAPI.getRealtimeStats(user.id);
      setRealtimeStats(stats);
    } catch (error) {
      console.error('Failed to load realtime stats:', error);
    }
  };

  const handleWorkspaceSelect = useCallback((workspace: DeveloperWorkspace) => {
    setSelectedWorkspace(workspace);
    onWorkspaceSelect?.(workspace);
  }, [onWorkspaceSelect]);

  const handleDebugSessionCreate = useCallback(async (sessionData: Partial<DebugSession>) => {
    try {
      const newSession = await developerAPI.createDebugSession({
        ...sessionData,
        developer_id: user.id,
        workspace_id: selectedWorkspace?.id
      });

      setDebugSessions(prev => [newSession, ...prev]);

      showToast({
        type: 'success',
        title: 'Debug session created',
        message: `${newSession.name} is now active`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to create debug session',
        message: 'Could not create the debug session'
      });
    }
  }, [user.id, selectedWorkspace?.id, showToast]);

  const renderTabContent = () => {
    const commonProps = {
      user,
      company,
      selectedWorkspace,
      onWorkspaceSelect: handleWorkspaceSelect,
      workspaces,
      debugSessions,
      analytics,
      refreshData: loadConsoleData
    };

    switch (activeTab) {
      case 'dashboard':
        return <WorkspaceDashboard {...commonProps} />;
      case 'debugging':
        return <DebuggingPanel {...commonProps} onSessionCreate={handleDebugSessionCreate} />;
      case 'analytics':
        return <AnalyticsPanel {...commonProps} />;
      case 'collaboration':
        return <CollaborationPanel {...commonProps} />;
      case 'performance':
        return <PerformanceMonitor {...commonProps} />;
      case 'errors':
        return <ErrorTracker {...commonProps} />;
      case 'api-explorer':
        return <APIExplorer {...commonProps} />;
      case 'database':
        return <DatabaseManager {...commonProps} />;
      case 'workflows':
        return <WorkflowManager {...commonProps} />;
      case 'ai-agents':
        return <AIAgentManager {...commonProps} />;
      default:
        return <WorkspaceDashboard {...commonProps} />;
    }
  };

  const getTabStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">Loading Developer Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Developer Console</h1>
                <p className="text-sm text-gray-400">Advanced Development Environment</p>
              </div>
            </div>

            {/* Real-time Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">{realtimeStats.activeUsers} Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">{realtimeStats.apiCalls} API</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bug className="h-4 w-4 text-red-400" />
                <span className="text-sm text-gray-300">{realtimeStats.errors} Errors</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">{realtimeStats.performance}% Perf</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{company?.name || 'Personal'}</p>
            </div>
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Tab Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {CONSOLE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : getTabStatusColor(tab.status)}`} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.badge && (
                    <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full">
                      {tab.badge}
                    </span>
                  )}
                  {tab.status && (
                    <div className={`h-2 w-2 rounded-full ${tab.status === 'active' ? 'bg-green-500' : tab.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="px-4 pb-6 border-t border-gray-700 pt-6">
            <div className="space-y-2">
              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                <Settings className="mr-3 h-4 w-4" />
                Console Settings
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                <FileText className="mr-3 h-4 w-4" />
                Documentation
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                <Terminal className="mr-3 h-4 w-4" />
                System Terminal
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

export default DeveloperConsole;