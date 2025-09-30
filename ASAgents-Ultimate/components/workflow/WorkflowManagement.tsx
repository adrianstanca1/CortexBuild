import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  FileText,
  ArrowRight,
  MoreVertical,
  Search,
  Plus,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'notification' | 'automation' | 'condition';
  status: 'pending' | 'active' | 'completed' | 'failed';
  assignee?: string;
  completedAt?: string;
  comments?: string;
}

interface WorkflowInstance {
  id: string;
  templateId: string;
  templateName: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  entityType: string;
  entityId: string;
  steps: WorkflowStep[];
  currentStep: number;
  startedAt: string;
  completedAt?: string;
  assignedTo?: string;
  context: {
    projectId?: string;
    documentId?: string;
    requesterId: string;
    metadata: Record<string, unknown>;
  };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'approval' | 'review' | 'processing' | 'notification';
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
}

export const WorkflowManagement: React.FC = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'instances' | 'templates'>('instances');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockWorkflows: WorkflowInstance[] = [
        {
          id: 'wf-001',
          templateId: 'tpl-001',
          templateName: 'Project Approval Workflow',
          status: 'active',
          priority: 'high',
          entityType: 'project',
          entityId: 'proj-123',
          currentStep: 1,
          startedAt: new Date().toISOString(),
          assignedTo: 'manager@company.com',
          steps: [
            {
              id: 'step-001',
              name: 'Initial Review',
              description: 'Review project proposal',
              type: 'approval',
              status: 'completed',
              assignee: 'reviewer@company.com',
              completedAt: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          context: {
            projectId: 'proj-123',
            requesterId: 'user-001',
            metadata: { budget: 50000, department: 'Engineering' }
          }
        }
      ];

      const mockTemplates: WorkflowTemplate[] = [
        {
          id: 'tpl-001',
          name: 'Project Approval Workflow',
          description: 'Standard workflow for project approvals',
          category: 'approval',
          isActive: true,
          createdAt: new Date().toISOString(),
          steps: [
            {
              id: 'step-template-001',
              name: 'Initial Review',
              description: 'Review project proposal',
              type: 'approval',
              status: 'pending'
            }
          ]
        }
      ];

      setWorkflows(mockWorkflows);
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'active':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesFilter = filter === 'all' || workflow.status === filter;
    const matchesSearch = workflow.templateName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredTemplates = templates.filter(template => {
    const matchesFilter = filter === 'all' || (filter === 'active' ? template.isActive : !template.isActive);
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Management</h1>
          <p className="text-gray-600">Manage and monitor automated workflows</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </Button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'instances'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('instances')}
          >
            Workflow Instances
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search workflows..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {activeTab === 'instances' ? (
        <div className="space-y-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {workflow.templateName}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Priority: {workflow.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Started:</span> {new Date(workflow.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Context</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(workflow.context).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium capitalize">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-gray-600 mt-1">{template.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
