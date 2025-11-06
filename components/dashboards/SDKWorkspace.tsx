import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import {
  CodeBracketIcon,
  RectangleStackIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  DocumentTextIcon,
  BeakerIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

// Simple Card Component
const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Simple Dashboard Header Component
const DashboardHeader: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  gradient: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, gradient, actions }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl p-8 text-white mb-8`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-white/80">{subtitle}</p>
        </div>
      </div>
      {actions && (
        <div className="flex gap-3">
          {actions}
        </div>
      )}
    </div>
  </div>
);

// Simple Section Grid Component
const SectionGrid: React.FC<{
  sections: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    status?: 'active' | 'beta' | 'coming_soon';
    action?: () => void;
  }>;
  onSectionClick: (id: string) => void;
  columns?: number;
}> = ({ sections, onSectionClick, columns = 3 }) => (
  <div className={`grid gap-6 ${columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
    {sections.map((section, index) => (
      <Card key={section.id} className="p-6" onClick={() => section.action?.()}>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-${section.color}-100 rounded-lg flex items-center justify-center`}>
            <section.icon className={`w-6 h-6 text-${section.color}-600`} />
          </div>
          {section.status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              section.status === 'active' ? 'bg-green-100 text-green-700' :
              section.status === 'beta' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {section.status.replace('_', ' ')}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
        <p className="text-sm text-gray-600">{section.description}</p>
      </Card>
    ))}
  </div>
);

interface SDKWorkspaceProps {
  user: User;
  onNavigate?: (section: string) => void;
}

export const SDKWorkspace: React.FC<SDKWorkspaceProps> = ({
  user,
  onNavigate
}) => {
  const [workspaceStats, setWorkspaceStats] = useState({
    activeProjects: 0,
    totalApps: 0,
    apiCalls: 0,
    storageUsed: 0
  });

  useEffect(() => {
    // Load workspace statistics
    const loadWorkspaceStats = async () => {
      try {
        // Mock data - replace with actual API calls
        setWorkspaceStats({
          activeProjects: 3,
          totalApps: 12,
          apiCalls: 15420,
          storageUsed: 2.4
        });
      } catch (error) {
        console.error('Failed to load workspace stats:', error);
      }
    };

    loadWorkspaceStats();
  }, [user.id]);

  const workspaceSections = [
    {
      id: 'ai-builder',
      title: 'AI Code Builder',
      description: 'Generate React components and full applications using AI prompts',
      icon: CodeBracketIcon,
      color: 'purple',
      status: 'active' as const,
      action: () => onNavigate?.('ai-builder')
    },
    {
      id: 'workflow-designer',
      title: 'Workflow Designer',
      description: 'Visual workflow builder with drag-and-drop interface',
      icon: RectangleStackIcon,
      color: 'blue',
      status: 'active' as const,
      action: () => onNavigate?.('workflow-designer')
    },
    {
      id: 'agent-orchestration',
      title: 'Agent Orchestration',
      description: 'Manage and monitor AI agents in your workspace',
      icon: PlayIcon,
      color: 'green',
      status: 'active' as const,
      action: () => onNavigate?.('agent-orchestration')
    },
    {
      id: 'sandbox-environment',
      title: 'Sandbox Environment',
      description: 'Isolated testing environment for your applications',
      icon: BeakerIcon,
      color: 'orange',
      status: 'active' as const,
      action: () => onNavigate?.('sandbox-environment')
    },
    {
      id: 'version-control',
      title: 'Version Control',
      description: 'Track changes and manage versions of your projects',
      icon: DocumentTextIcon,
      color: 'gray',
      status: 'beta' as const,
      action: () => onNavigate?.('version-control')
    },
    {
      id: 'deployment-tools',
      title: 'Deployment Tools',
      description: 'Deploy applications to production environments',
      icon: CloudIcon,
      color: 'indigo',
      status: 'coming_soon' as const,
      action: () => onNavigate?.('deployment-tools')
    }
  ];

  const quickActions = [
    { label: 'New Project', action: () => console.log('New project') },
    { label: 'Import Code', action: () => console.log('Import code') },
    { label: 'Run Tests', action: () => console.log('Run tests') },
    { label: 'View Logs', action: () => console.log('View logs') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <DashboardHeader
          title="SDK Workspace"
          subtitle="Complete development environment for building AI-powered applications"
          icon={RectangleStackIcon}
          gradient="from-purple-600 via-blue-600 to-indigo-600"
          actions={
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                Documentation
              </button>
              <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-colors">
                Settings
              </button>
            </div>
          }
        />

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Projects', value: workspaceStats.activeProjects, unit: '' },
            { label: 'Total Apps', value: workspaceStats.totalApps, unit: '' },
            { label: 'API Calls', value: workspaceStats.apiCalls.toLocaleString(), unit: '' },
            { label: 'Storage Used', value: workspaceStats.storageUsed, unit: 'GB' }
          ].map((stat, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}{stat.unit}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Development Tools Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Development Tools</h2>
          <SectionGrid
            sections={workspaceSections}
            onSectionClick={(id) => {
              const section = workspaceSections.find(s => s.id === id);
              section?.action?.();
            }}
            columns={3}
          />
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your recently worked on projects and applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Construction Safety Monitor', type: 'AI Agent', updated: '2 hours ago', status: 'active' },
                { name: 'Project Timeline Dashboard', type: 'React App', updated: '1 day ago', status: 'draft' },
                { name: 'Invoice Processing Workflow', type: 'Automation', updated: '3 days ago', status: 'active' },
                { name: 'Quality Inspection Tool', type: 'Mobile App', updated: '1 week ago', status: 'testing' }
              ].map((project, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.type === 'AI Agent' ? 'bg-purple-100 text-purple-700' :
                        project.type === 'React App' ? 'bg-blue-100 text-blue-700' :
                        project.type === 'Automation' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Updated {project.updated}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-100 text-green-700' :
                      project.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.status}
                    </span>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};