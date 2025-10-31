// 🏗️ Templates Dashboard
// Project templates, workflows, and standardized processes management

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Star, 
  StarOff, 
  Eye, 
  Settings, 
  RefreshCw, 
  BarChart3, 
  Layers, 
  Workflow, 
  CheckSquare, 
  Calendar, 
  Users, 
  Building, 
  Hammer, 
  Zap, 
  Target, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ArrowRight, 
  ArrowDown, 
  ArrowUp, 
  MoreVertical,
  Folder,
  FolderOpen,
  Tag,
  Share2,
  BookOpen,
  Clipboard,
  Layout,
  Grid,
  List
} from 'lucide-react';

interface TemplatesDashboardProps {
  projectId: string;
  userId: string;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'industrial' | 'infrastructure' | 'renovation' | 'custom';
  type: 'project' | 'phase' | 'task' | 'checklist' | 'workflow';
  version: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating: number;
  tags: string[];
  thumbnail?: string;
  estimatedDuration: number; // days
  estimatedCost: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  phases: TemplatePhase[];
  tasks: TemplateTask[];
  checklists: TemplateChecklist[];
  workflows: TemplateWorkflow[];
  resources: TemplateResource[];
  customFields: TemplateField[];
}

interface TemplatePhase {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedDuration: number; // days
  estimatedCost: number;
  dependencies: string[]; // phase IDs
  milestones: TemplateMilestone[];
  tasks: string[]; // task IDs
}

interface TemplateTask {
  id: string;
  name: string;
  description: string;
  phaseId: string;
  order: number;
  estimatedDuration: number; // hours
  estimatedCost: number;
  assignedRole: string;
  dependencies: string[]; // task IDs
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'design' | 'procurement' | 'construction' | 'inspection' | 'documentation' | 'approval';
  requiredSkills: string[];
  deliverables: string[];
  checklists: string[]; // checklist IDs
}

interface TemplateChecklist {
  id: string;
  name: string;
  description: string;
  category: string;
  items: ChecklistItem[];
  isRequired: boolean;
  applicablePhases: string[];
  applicableTasks: string[];
}

interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
  isRequired: boolean;
  category: string;
  order: number;
}

interface TemplateWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'automatic' | 'scheduled' | 'condition';
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  notifications: WorkflowNotification[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'task_creation' | 'status_change' | 'document_generation';
  order: number;
  assignedRole: string;
  parameters: { [key: string]: any };
  conditions: string[];
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

interface WorkflowNotification {
  id: string;
  trigger: string;
  recipients: string[];
  template: string;
  channels: ('email' | 'push' | 'sms')[];
}

interface TemplateMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: number; // days from project start
  criteria: string[];
  deliverables: string[];
}

interface TemplateResource {
  id: string;
  name: string;
  type: 'document' | 'form' | 'specification' | 'drawing' | 'contract' | 'permit';
  url?: string;
  content?: string;
  isRequired: boolean;
  applicablePhases: string[];
}

interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'file';
  label: string;
  description?: string;
  isRequired: boolean;
  options?: string[];
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface TemplateMetrics {
  totalTemplates: number;
  publicTemplates: number;
  favoriteTemplates: number;
  recentlyUsed: number;
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  popularTemplates: {
    template: ProjectTemplate;
    usageCount: number;
  }[];
  usageStats: {
    date: Date;
    templatesUsed: number;
    projectsCreated: number;
  }[];
}

export const TemplatesDashboard: React.FC<TemplatesDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('templates');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [metrics, setMetrics] = useState<TemplateMetrics | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');

  useEffect(() => {
    loadTemplateData();
  }, [projectId]);

  const loadTemplateData = async () => {
    setLoading(true);
    try {
      // Load mock data
      const mockTemplates = getMockTemplates();
      const mockMetrics = calculateMetrics(mockTemplates);

      setTemplates(mockTemplates);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading template data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockTemplates = (): ProjectTemplate[] => {
    return [
      {
        id: 'template-1',
        name: 'Commercial Office Building',
        description: 'Complete template for commercial office building construction including all phases from design to occupancy',
        category: 'commercial',
        type: 'project',
        version: '2.1',
        isPublic: true,
        isFavorite: true,
        createdBy: 'System',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        usageCount: 45,
        rating: 4.8,
        tags: ['office', 'commercial', 'multi-story', 'LEED'],
        estimatedDuration: 365,
        estimatedCost: 5000000,
        complexity: 'complex',
        phases: [
          {
            id: 'phase-1',
            name: 'Pre-Construction',
            description: 'Design, permits, and planning phase',
            order: 1,
            estimatedDuration: 90,
            estimatedCost: 500000,
            dependencies: [],
            milestones: [
              {
                id: 'milestone-1',
                name: 'Design Approval',
                description: 'Final design approval from client and authorities',
                targetDate: 60,
                criteria: ['Architectural plans approved', 'Structural plans approved', 'MEP plans approved'],
                deliverables: ['Approved drawings', 'Permit applications']
              }
            ],
            tasks: ['task-1', 'task-2']
          },
          {
            id: 'phase-2',
            name: 'Foundation & Structure',
            description: 'Foundation and structural construction',
            order: 2,
            estimatedDuration: 120,
            estimatedCost: 2000000,
            dependencies: ['phase-1'],
            milestones: [
              {
                id: 'milestone-2',
                name: 'Structure Complete',
                description: 'Structural frame completion',
                targetDate: 210,
                criteria: ['Foundation complete', 'Frame erected', 'Roof installed'],
                deliverables: ['Structural inspection reports', 'Progress photos']
              }
            ],
            tasks: ['task-3', 'task-4']
          }
        ],
        tasks: [
          {
            id: 'task-1',
            name: 'Architectural Design',
            description: 'Create detailed architectural drawings and specifications',
            phaseId: 'phase-1',
            order: 1,
            estimatedDuration: 160,
            estimatedCost: 150000,
            assignedRole: 'Architect',
            dependencies: [],
            priority: 'high',
            type: 'design',
            requiredSkills: ['AutoCAD', 'Revit', 'Building Codes'],
            deliverables: ['Floor plans', 'Elevations', 'Sections', 'Details'],
            checklists: ['checklist-1']
          },
          {
            id: 'task-2',
            name: 'Permit Applications',
            description: 'Submit and manage building permit applications',
            phaseId: 'phase-1',
            order: 2,
            estimatedDuration: 40,
            estimatedCost: 25000,
            assignedRole: 'Project Manager',
            dependencies: ['task-1'],
            priority: 'critical',
            type: 'documentation',
            requiredSkills: ['Permit Process', 'Code Compliance'],
            deliverables: ['Permit applications', 'Code compliance reports'],
            checklists: ['checklist-2']
          }
        ],
        checklists: [
          {
            id: 'checklist-1',
            name: 'Architectural Design Review',
            description: 'Comprehensive review checklist for architectural designs',
            category: 'Design',
            isRequired: true,
            applicablePhases: ['phase-1'],
            applicableTasks: ['task-1'],
            items: [
              {
                id: 'item-1',
                text: 'Floor plans show all required spaces',
                description: 'Verify all programmatic requirements are met',
                isRequired: true,
                category: 'Planning',
                order: 1
              },
              {
                id: 'item-2',
                text: 'Accessibility compliance verified',
                description: 'Check ADA compliance for all areas',
                isRequired: true,
                category: 'Code Compliance',
                order: 2
              },
              {
                id: 'item-3',
                text: 'Fire egress paths clearly marked',
                description: 'Verify fire safety and egress requirements',
                isRequired: true,
                category: 'Safety',
                order: 3
              }
            ]
          }
        ],
        workflows: [
          {
            id: 'workflow-1',
            name: 'Design Approval Workflow',
            description: 'Standard approval process for design documents',
            trigger: 'manual',
            steps: [
              {
                id: 'step-1',
                name: 'Initial Review',
                type: 'approval',
                order: 1,
                assignedRole: 'Design Manager',
                parameters: { timeout: 72 },
                conditions: []
              },
              {
                id: 'step-2',
                name: 'Client Review',
                type: 'approval',
                order: 2,
                assignedRole: 'Client',
                parameters: { timeout: 168 },
                conditions: ['step-1-approved']
              }
            ],
            conditions: [],
            notifications: []
          }
        ],
        resources: [
          {
            id: 'resource-1',
            name: 'Design Standards Manual',
            type: 'document',
            url: '/templates/design-standards.pdf',
            isRequired: true,
            applicablePhases: ['phase-1']
          },
          {
            id: 'resource-2',
            name: 'Permit Application Form',
            type: 'form',
            url: '/templates/permit-form.pdf',
            isRequired: true,
            applicablePhases: ['phase-1']
          }
        ],
        customFields: [
          {
            id: 'field-1',
            name: 'building_height',
            type: 'number',
            label: 'Building Height (stories)',
            description: 'Number of stories in the building',
            isRequired: true,
            validation: { min: 1, max: 50 }
          },
          {
            id: 'field-2',
            name: 'leed_certification',
            type: 'select',
            label: 'LEED Certification Target',
            description: 'Target LEED certification level',
            isRequired: false,
            options: ['None', 'Certified', 'Silver', 'Gold', 'Platinum']
          }
        ]
      },
      {
        id: 'template-2',
        name: 'Residential Single Family Home',
        description: 'Standard template for single family residential construction',
        category: 'residential',
        type: 'project',
        version: '1.5',
        isPublic: true,
        isFavorite: false,
        createdBy: 'John Smith',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        usageCount: 28,
        rating: 4.5,
        tags: ['residential', 'single-family', 'custom-home'],
        estimatedDuration: 180,
        estimatedCost: 750000,
        complexity: 'moderate',
        phases: [],
        tasks: [],
        checklists: [],
        workflows: [],
        resources: [],
        customFields: []
      },
      {
        id: 'template-3',
        name: 'Safety Inspection Checklist',
        description: 'Comprehensive safety inspection checklist for construction sites',
        category: 'custom',
        type: 'checklist',
        version: '3.0',
        isPublic: true,
        isFavorite: true,
        createdBy: 'Safety Department',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        usageCount: 156,
        rating: 4.9,
        tags: ['safety', 'inspection', 'compliance', 'OSHA'],
        estimatedDuration: 1,
        estimatedCost: 0,
        complexity: 'simple',
        phases: [],
        tasks: [],
        checklists: [],
        workflows: [],
        resources: [],
        customFields: []
      },
      {
        id: 'template-4',
        name: 'Change Order Approval Workflow',
        description: 'Standardized workflow for change order approvals',
        category: 'custom',
        type: 'workflow',
        version: '2.0',
        isPublic: false,
        isFavorite: false,
        createdBy: 'Project Management',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        usageCount: 89,
        rating: 4.3,
        tags: ['change-order', 'approval', 'workflow', 'budget'],
        estimatedDuration: 7,
        estimatedCost: 0,
        complexity: 'moderate',
        phases: [],
        tasks: [],
        checklists: [],
        workflows: [],
        resources: [],
        customFields: []
      }
    ];
  };

  const calculateMetrics = (templates: ProjectTemplate[]): TemplateMetrics => {
    const totalTemplates = templates.length;
    const publicTemplates = templates.filter(t => t.isPublic).length;
    const favoriteTemplates = templates.filter(t => t.isFavorite).length;
    const recentlyUsed = templates.filter(t => 
      new Date(t.updatedAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    ).length;

    const categories = ['residential', 'commercial', 'industrial', 'infrastructure', 'renovation', 'custom'];
    const categoryDistribution = categories.map(category => {
      const count = templates.filter(t => t.category === category).length;
      return {
        category,
        count,
        percentage: totalTemplates > 0 ? (count / totalTemplates) * 100 : 0
      };
    });

    const popularTemplates = templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map(template => ({
        template,
        usageCount: template.usageCount
      }));

    return {
      totalTemplates,
      publicTemplates,
      favoriteTemplates,
      recentlyUsed,
      categoryDistribution,
      popularTemplates,
      usageStats: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), templatesUsed: 12, projectsCreated: 8 },
        { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), templatesUsed: 18, projectsCreated: 12 },
        { date: new Date(), templatesUsed: 25, projectsCreated: 15 }
      ]
    };
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'complex': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return Building;
      case 'phase': return Layers;
      case 'task': return CheckSquare;
      case 'checklist': return Clipboard;
      case 'workflow': return Workflow;
      default: return FileText;
    }
  };

  const toggleFavorite = (templateId: string) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesComplexity = complexityFilter === 'all' || template.complexity === complexityFilter;
    
    return matchesSearch && matchesCategory && matchesType && matchesComplexity;
  });

  const tabs = [
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare },
    { id: 'overview', label: 'Overview', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600">Project templates, workflows, and standardized processes</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="renovation">Renovation</option>
                <option value="custom">Custom</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="project">Project</option>
                <option value="phase">Phase</option>
                <option value="task">Task</option>
                <option value="checklist">Checklist</option>
                <option value="workflow">Workflow</option>
              </select>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'templates' && (
          <TemplatesTab 
            templates={filteredTemplates}
            viewMode={viewMode}
            onSelectTemplate={setSelectedTemplate}
            onToggleFavorite={toggleFavorite}
            onCreateTemplate={() => setShowCreateModal(true)}
            getComplexityColor={getComplexityColor}
            getTypeIcon={getTypeIcon}
          />
        )}
        {activeTab === 'workflows' && (
          <WorkflowsTab 
            templates={filteredTemplates.filter(t => t.type === 'workflow')}
            viewMode={viewMode}
            onSelectTemplate={setSelectedTemplate}
            getComplexityColor={getComplexityColor}
          />
        )}
        {activeTab === 'checklists' && (
          <ChecklistsTab 
            templates={filteredTemplates.filter(t => t.type === 'checklist')}
            viewMode={viewMode}
            onSelectTemplate={setSelectedTemplate}
            getComplexityColor={getComplexityColor}
          />
        )}
        {activeTab === 'overview' && metrics && (
          <OverviewTab 
            metrics={metrics}
            templates={templates}
          />
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newTemplate) => {
            setTemplates([...templates, newTemplate]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUpdate={(updatedTemplate) => {
            setTemplates(templates.map(t => 
              t.id === updatedTemplate.id ? updatedTemplate : t
            ));
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Templates Tab Component
const TemplatesTab: React.FC<{
  templates: ProjectTemplate[];
  viewMode: 'grid' | 'list';
  onSelectTemplate: (template: ProjectTemplate) => void;
  onToggleFavorite: (templateId: string) => void;
  onCreateTemplate: () => void;
  getComplexityColor: (complexity: string) => string;
  getTypeIcon: (type: string) => any;
}> = ({ templates, viewMode, onSelectTemplate, onToggleFavorite, onCreateTemplate, getComplexityColor, getTypeIcon }) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
        <p className="text-gray-600 mb-4">Create your first template to get started</p>
        <button
          onClick={onCreateTemplate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </button>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => {
          const TypeIcon = getTypeIcon(template.type);
          return (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TypeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(template.complexity)}`}>
                      {template.complexity}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(template.id);
                  }}
                  className="text-gray-400 hover:text-yellow-500"
                >
                  {template.isFavorite ? (
                    <Star className="w-5 h-5 fill-current text-yellow-500" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div onClick={() => onSelectTemplate(template)}>
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.description}</p>

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Duration:</span>
                    <span>{template.estimatedDuration} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cost:</span>
                    <span>${template.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Used:</span>
                    <span>{template.usageCount} times</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rating:</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span className="ml-1">{template.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => {
        const TypeIcon = getTypeIcon(template.type);
        return (
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TypeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(template.complexity)}`}>
                      {template.complexity}
                    </span>
                    {template.isPublic && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Public
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{template.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium capitalize">{template.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium capitalize">{template.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <p className="font-medium">{template.estimatedDuration} days</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Usage:</span>
                      <p className="font-medium">{template.usageCount} times</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleFavorite(template.id)}
                  className="p-2 text-gray-400 hover:text-yellow-500"
                >
                  {template.isFavorite ? (
                    <Star className="w-5 h-5 fill-current text-yellow-500" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800" title="Copy Template">
                  <Copy className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800" title="Edit Template">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800" title="More Options">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Workflows Tab Component
const WorkflowsTab: React.FC<{
  templates: ProjectTemplate[];
  viewMode: 'grid' | 'list';
  onSelectTemplate: (template: ProjectTemplate) => void;
  getComplexityColor: (complexity: string) => string;
}> = ({ templates, viewMode, onSelectTemplate, getComplexityColor }) => {
  return (
    <div className="text-center py-12">
      <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Templates</h3>
      <p className="text-gray-600">Manage automated workflows and approval processes</p>
      <p className="text-sm text-gray-500 mt-2">{templates.length} workflow templates available</p>
    </div>
  );
};

// Checklists Tab Component
const ChecklistsTab: React.FC<{
  templates: ProjectTemplate[];
  viewMode: 'grid' | 'list';
  onSelectTemplate: (template: ProjectTemplate) => void;
  getComplexityColor: (complexity: string) => string;
}> = ({ templates, viewMode, onSelectTemplate, getComplexityColor }) => {
  return (
    <div className="text-center py-12">
      <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Checklist Templates</h3>
      <p className="text-gray-600">Standardized checklists for quality control and inspections</p>
      <p className="text-sm text-gray-500 mt-2">{templates.length} checklist templates available</p>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  metrics: TemplateMetrics;
  templates: ProjectTemplate[];
}> = ({ metrics, templates }) => {
  const kpis = [
    {
      title: 'Total Templates',
      value: metrics.totalTemplates.toString(),
      change: 0,
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Public Templates',
      value: metrics.publicTemplates.toString(),
      change: 0,
      icon: Share2,
      color: 'green'
    },
    {
      title: 'Favorites',
      value: metrics.favoriteTemplates.toString(),
      change: 0,
      icon: Star,
      color: 'yellow'
    },
    {
      title: 'Recently Used',
      value: metrics.recentlyUsed.toString(),
      change: 0,
      icon: Clock,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${kpi.color}-100`}>
                  <Icon className={`w-5 h-5 text-${kpi.color}-600`} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Popular Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {metrics.categoryDistribution.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{category.category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{category.count}</span>
                  <span className="text-xs text-gray-500">({category.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Templates</h3>
          <div className="space-y-3">
            {metrics.popularTemplates.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.template.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.template.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{item.usageCount}</span>
                  <span className="text-xs text-gray-500">uses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Template Modal Component
const CreateTemplateModal: React.FC<{
  onClose: () => void;
  onSuccess: (template: ProjectTemplate) => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as ProjectTemplate['category'],
    type: 'project' as ProjectTemplate['type'],
    complexity: 'moderate' as ProjectTemplate['complexity'],
    estimatedDuration: 30,
    estimatedCost: 100000,
    isPublic: false,
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTemplate: ProjectTemplate = {
      id: `template-${Date.now()}`,
      ...formData,
      version: '1.0',
      isFavorite: false,
      createdBy: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      rating: 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      phases: [],
      tasks: [],
      checklists: [],
      workflows: [],
      resources: [],
      customFields: []
    };

    onSuccess(newTemplate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Template</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter template name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the template purpose and usage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectTemplate['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="renovation">Renovation</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectTemplate['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="project">Project</option>
                <option value="phase">Phase</option>
                <option value="task">Task</option>
                <option value="checklist">Checklist</option>
                <option value="workflow">Workflow</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData({ ...formData, complexity: e.target.value as ProjectTemplate['complexity'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (days)</label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., office, commercial, multi-story"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
              Make this template public (visible to all users)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Template Detail Modal Component
const TemplateDetailModal: React.FC<{
  template: ProjectTemplate;
  onClose: () => void;
  onUpdate: (template: ProjectTemplate) => void;
}> = ({ template, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Template Information</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium capitalize">{template.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium capitalize">{template.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Complexity:</span>
                  <span className="ml-2 font-medium capitalize">{template.complexity}</span>
                </div>
                <div>
                  <span className="text-gray-500">Version:</span>
                  <span className="ml-2 font-medium">{template.version}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created by:</span>
                  <span className="ml-2 font-medium">{template.createdBy}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 font-medium">{template.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Usage Statistics</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Times used:</span>
                  <span className="ml-2 font-medium">{template.usageCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rating:</span>
                  <div className="ml-2 inline-flex items-center">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span className="ml-1 font-medium">{template.rating}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Estimated duration:</span>
                  <span className="ml-2 font-medium">{template.estimatedDuration} days</span>
                </div>
                <div>
                  <span className="text-gray-500">Estimated cost:</span>
                  <span className="ml-2 font-medium">${template.estimatedCost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Public:</span>
                  <span className="ml-2 font-medium">{template.isPublic ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{template.description}</p>
          </div>

          {template.tags.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {template.phases.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Phases ({template.phases.length})</h4>
              <div className="space-y-2">
                {template.phases.map((phase) => (
                  <div key={phase.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900">{phase.name}</h5>
                      <span className="text-sm text-gray-500">{phase.estimatedDuration} days</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between">
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Copy className="w-4 h-4 mr-2 inline" />
                Duplicate
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2 inline" />
                Export
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Use Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesDashboard;
