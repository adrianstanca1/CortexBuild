import React, { useState } from 'react';
import {
  Clock, Webhook, Database, Mail, Zap, GitBranch, FileText, Users,
  Building2, Calendar, MessageSquare, Bell, Code, Settings, Filter,
  Search, Play, Pause, RotateCcw, CheckCircle, XCircle, AlertTriangle,
  Globe, Smartphone, Monitor, Cpu, HardDrive, Activity
} from 'lucide-react';

export interface NodeTemplate {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'integration';
  category: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  config: Record<string, any>;
  inputs?: string[];
  outputs?: string[];
  premium?: boolean;
}

interface WorkflowNodeLibraryProps {
  onNodeSelect: (template: NodeTemplate) => void;
  onClose: () => void;
}

export const WorkflowNodeLibrary: React.FC<WorkflowNodeLibraryProps> = ({
  onNodeSelect,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const nodeTemplates: NodeTemplate[] = [
    // TRIGGERS
    {
      id: 'time-trigger',
      type: 'trigger',
      category: 'Triggers',
      title: 'Schedule Trigger',
      description: 'Run workflow on a schedule (daily, weekly, monthly)',
      icon: Clock,
      config: {
        schedule: 'daily',
        time: '09:00',
        timezone: 'UTC',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      outputs: ['timestamp', 'schedule_info']
    },
    {
      id: 'webhook-trigger',
      type: 'trigger',
      category: 'Triggers',
      title: 'Webhook Trigger',
      description: 'Trigger workflow via HTTP webhook',
      icon: Webhook,
      config: {
        method: 'POST',
        path: '/webhook',
        authentication: 'none',
        headers: {}
      },
      outputs: ['request_body', 'headers', 'query_params']
    },
    {
      id: 'database-trigger',
      type: 'trigger',
      category: 'Triggers',
      title: 'Database Trigger',
      description: 'Trigger on database changes (insert, update, delete)',
      icon: Database,
      config: {
        table: 'projects',
        event: 'insert',
        conditions: {}
      },
      outputs: ['record_data', 'event_type', 'timestamp']
    },
    {
      id: 'user-action-trigger',
      type: 'trigger',
      category: 'Triggers',
      title: 'User Action Trigger',
      description: 'Trigger when user performs specific action',
      icon: Users,
      config: {
        action: 'login',
        user_role: 'any',
        conditions: {}
      },
      outputs: ['user_data', 'action_details', 'timestamp']
    },

    // ACTIONS
    {
      id: 'send-email',
      type: 'action',
      category: 'Communications',
      title: 'Send Email',
      description: 'Send email notification to users',
      icon: Mail,
      config: {
        to: '',
        subject: '',
        template: 'default',
        attachments: []
      },
      inputs: ['recipient', 'subject', 'body'],
      outputs: ['email_id', 'status', 'timestamp']
    },
    {
      id: 'send-sms',
      type: 'action',
      category: 'Communications',
      title: 'Send SMS',
      description: 'Send SMS notification',
      icon: Smartphone,
      config: {
        to: '',
        message: '',
        provider: 'twilio'
      },
      inputs: ['phone_number', 'message'],
      outputs: ['sms_id', 'status', 'timestamp']
    },
    {
      id: 'slack-notification',
      type: 'action',
      category: 'Communications',
      title: 'Slack Notification',
      description: 'Send message to Slack channel',
      icon: MessageSquare,
      config: {
        channel: '#general',
        message: '',
        webhook_url: ''
      },
      inputs: ['channel', 'message', 'attachments'],
      outputs: ['message_id', 'status', 'timestamp']
    },
    {
      id: 'api-call',
      type: 'action',
      category: 'Integrations',
      title: 'HTTP API Call',
      description: 'Make HTTP request to external API',
      icon: Zap,
      config: {
        url: '',
        method: 'GET',
        headers: {},
        body: {},
        timeout: 30
      },
      inputs: ['url', 'headers', 'body'],
      outputs: ['response_body', 'status_code', 'headers']
    },
    {
      id: 'database-action',
      type: 'action',
      category: 'Data',
      title: 'Database Action',
      description: 'Create, update, or delete database records',
      icon: Database,
      config: {
        table: '',
        action: 'insert',
        data: {},
        conditions: {}
      },
      inputs: ['table', 'data', 'conditions'],
      outputs: ['record_id', 'affected_rows', 'timestamp']
    },
    {
      id: 'create-project',
      type: 'action',
      category: 'CortexBuild',
      title: 'Create Project',
      description: 'Create new project in CortexBuild',
      icon: Building2,
      config: {
        name: '',
        description: '',
        client_id: '',
        template: 'default'
      },
      inputs: ['name', 'description', 'client_id'],
      outputs: ['project_id', 'project_data', 'timestamp']
    },
    {
      id: 'assign-task',
      type: 'action',
      category: 'CortexBuild',
      title: 'Assign Task',
      description: 'Assign task to team member',
      icon: CheckCircle,
      config: {
        project_id: '',
        assignee_id: '',
        title: '',
        description: '',
        due_date: ''
      },
      inputs: ['project_id', 'assignee_id', 'task_details'],
      outputs: ['task_id', 'task_data', 'timestamp']
    },

    // CONDITIONS
    {
      id: 'if-condition',
      type: 'condition',
      category: 'Logic',
      title: 'If/Then/Else',
      description: 'Conditional branching logic',
      icon: GitBranch,
      config: {
        condition: '',
        operator: 'equals',
        value: '',
        true_path: '',
        false_path: ''
      },
      inputs: ['input_value', 'condition_value'],
      outputs: ['result', 'path_taken']
    },
    {
      id: 'switch-condition',
      type: 'condition',
      category: 'Logic',
      title: 'Switch/Case',
      description: 'Multiple condition branching',
      icon: GitBranch,
      config: {
        input_field: '',
        cases: [
          { value: '', path: '' }
        ],
        default_path: ''
      },
      inputs: ['switch_value'],
      outputs: ['matched_case', 'path_taken']
    },
    {
      id: 'filter-condition',
      type: 'condition',
      category: 'Logic',
      title: 'Filter',
      description: 'Filter data based on conditions',
      icon: Filter,
      config: {
        field: '',
        operator: 'contains',
        value: '',
        case_sensitive: false
      },
      inputs: ['data_array', 'filter_criteria'],
      outputs: ['filtered_data', 'count']
    },

    // DELAYS
    {
      id: 'wait-delay',
      type: 'delay',
      category: 'Timing',
      title: 'Wait/Delay',
      description: 'Add delay before next action',
      icon: Clock,
      config: {
        duration: 5,
        unit: 'minutes'
      },
      inputs: ['trigger'],
      outputs: ['completion_time']
    },
    {
      id: 'wait-until',
      type: 'delay',
      category: 'Timing',
      title: 'Wait Until',
      description: 'Wait until specific time or condition',
      icon: Calendar,
      config: {
        type: 'time',
        time: '17:00',
        condition: ''
      },
      inputs: ['condition_check'],
      outputs: ['completion_time', 'condition_met']
    },

    // INTEGRATIONS
    {
      id: 'quickbooks-sync',
      type: 'integration',
      category: 'Integrations',
      title: 'QuickBooks Sync',
      description: 'Sync data with QuickBooks',
      icon: FileText,
      config: {
        action: 'sync_invoices',
        company_id: '',
        filters: {}
      },
      inputs: ['sync_data'],
      outputs: ['sync_result', 'records_processed'],
      premium: true
    },
    {
      id: 'google-drive',
      type: 'integration',
      category: 'Integrations',
      title: 'Google Drive',
      description: 'Upload/download files from Google Drive',
      icon: HardDrive,
      config: {
        action: 'upload',
        folder_id: '',
        file_name: ''
      },
      inputs: ['file_data', 'folder_path'],
      outputs: ['file_id', 'file_url'],
      premium: true
    }
  ];

  const categories = [
    'all',
    ...Array.from(new Set(nodeTemplates.map(template => template.category)))
  ];

  const filteredTemplates = nodeTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Triggers': return Play;
      case 'Communications': return Mail;
      case 'Integrations': return Globe;
      case 'Data': return Database;
      case 'CortexBuild': return Building2;
      case 'Logic': return GitBranch;
      case 'Timing': return Clock;
      default: return Settings;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Triggers': return 'text-green-600 bg-green-100';
      case 'Communications': return 'text-blue-600 bg-blue-100';
      case 'Integrations': return 'text-purple-600 bg-purple-100';
      case 'Data': return 'text-orange-600 bg-orange-100';
      case 'CortexBuild': return 'text-indigo-600 bg-indigo-100';
      case 'Logic': return 'text-yellow-600 bg-yellow-100';
      case 'Timing': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Node Library</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            aria-label="Close node library"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Filter nodes by category"
          title="Filter nodes by category"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredTemplates.map((template) => {
            const CategoryIcon = getCategoryIcon(template.category);

            return (
              <div
                key={template.id}
                draggable
                onDragStart={() => onNodeSelect(template)}
                onClick={() => onNodeSelect(template)}
                className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                    <template.icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{template.title}</p>
                      {template.premium && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>

                    {/* Category Badge */}
                    <div className="flex items-center mt-2">
                      <CategoryIcon className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-400">{template.category}</span>
                    </div>

                    {/* Input/Output indicators */}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      {template.inputs && (
                        <span>Inputs: {template.inputs.length}</span>
                      )}
                      {template.outputs && (
                        <span>Outputs: {template.outputs.length}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No nodes found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <p>{filteredTemplates.length} nodes available</p>
          <p className="mt-1">Drag nodes to canvas to add them</p>
        </div>
      </div>
    </div>
  );
};
