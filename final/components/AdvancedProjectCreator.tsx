// 🏗️ Advanced Project Creator
// Comprehensive project creation wizard inspired by Procore and Fieldwire

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  FileText, 
  Settings, 
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  X,
  Upload,
  Copy
} from 'lucide-react';
import { projectManagementService } from '../services/projectManagementService';
import { ProjectTemplate, ProjectCategory } from '../types/project-management';

interface AdvancedProjectCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

interface ProjectFormData {
  // Basic Information
  name: string;
  description: string;
  category: ProjectCategory;
  type: string;
  
  // Location & Details
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Timeline
  startDate: string;
  endDate: string;
  phases: ProjectPhase[];
  
  // Budget
  totalBudget: number;
  currency: string;
  costCodes: CostCodeSetup[];
  
  // Team
  projectManager: string;
  superintendent: string;
  teamMembers: TeamMember[];
  
  // Settings
  template: string;
  customFields: CustomField[];
  workflows: WorkflowSetup[];
  
  // Documents
  drawings: File[];
  specifications: File[];
  contracts: File[];
}

interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
}

interface CostCodeSetup {
  code: string;
  name: string;
  category: string;
  budgetAmount: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  permissions: string[];
}

interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface WorkflowSetup {
  id: string;
  name: string;
  type: string;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  name: string;
  assignee: string;
  action: string;
}

interface Milestone {
  id: string;
  name: string;
  date: string;
  type: string;
}

export const AdvancedProjectCreator: React.FC<AdvancedProjectCreatorProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    category: ProjectCategory.COMMERCIAL,
    type: 'new_construction',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    startDate: '',
    endDate: '',
    phases: [],
    totalBudget: 0,
    currency: 'USD',
    costCodes: [],
    projectManager: '',
    superintendent: '',
    teamMembers: [],
    template: '',
    customFields: [],
    workflows: [],
    drawings: [],
    specifications: [],
    contracts: []
  });

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: Building },
    { id: 'location', title: 'Location & Details', icon: MapPin },
    { id: 'timeline', title: 'Timeline & Phases', icon: Calendar },
    { id: 'budget', title: 'Budget & Cost Codes', icon: DollarSign },
    { id: 'team', title: 'Team & Permissions', icon: Users },
    { id: 'settings', title: 'Settings & Workflows', icon: Settings },
    { id: 'documents', title: 'Documents & Files', icon: FileText },
    { id: 'review', title: 'Review & Create', icon: Check }
  ];

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const templateData = await projectManagementService.getProjectTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let project;
      if (formData.template) {
        project = await projectManagementService.createProjectFromTemplate(formData.template, formData);
      } else {
        // Create project from scratch
        project = await createProjectFromScratch(formData);
      }
      onProjectCreated(project);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProjectFromScratch = async (data: ProjectFormData) => {
    // Mock implementation - would integrate with actual API
    return {
      id: `project-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      status: 'active'
    };
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPhase = () => {
    const newPhase: ProjectPhase = {
      id: `phase-${Date.now()}`,
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      milestones: []
    };
    setFormData(prev => ({
      ...prev,
      phases: [...prev.phases, newPhase]
    }));
  };

  const updatePhase = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.map((phase, i) => 
        i === index ? { ...phase, [field]: value } : phase
      )
    }));
  };

  const removePhase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index)
    }));
  };

  const addCostCode = () => {
    const newCostCode: CostCodeSetup = {
      code: '',
      name: '',
      category: 'labor',
      budgetAmount: 0
    };
    setFormData(prev => ({
      ...prev,
      costCodes: [...prev.costCodes, newCostCode]
    }));
  };

  const updateCostCode = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      costCodes: prev.costCodes.map((costCode, i) => 
        i === index ? { ...costCode, [field]: value } : costCode
      )
    }));
  };

  const removeCostCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      costCodes: prev.costCodes.filter((_, i) => i !== index)
    }));
  };

  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: '',
      email: '',
      role: '',
      company: '',
      permissions: []
    };
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember]
    }));
  };

  const updateTeamMember = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <p className="text-gray-600">Set up your construction project with comprehensive planning</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive ? 'border-blue-600 bg-blue-600 text-white' :
                    isCompleted ? 'border-green-600 bg-green-600 text-white' :
                    'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 0 && <BasicInformationStep formData={formData} updateFormData={updateFormData} templates={templates} />}
          {currentStep === 1 && <LocationDetailsStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <TimelinePhasesStep formData={formData} updateFormData={updateFormData} addPhase={addPhase} updatePhase={updatePhase} removePhase={removePhase} />}
          {currentStep === 3 && <BudgetCostCodesStep formData={formData} updateFormData={updateFormData} addCostCode={addCostCode} updateCostCode={updateCostCode} removeCostCode={removeCostCode} />}
          {currentStep === 4 && <TeamPermissionsStep formData={formData} updateFormData={updateFormData} addTeamMember={addTeamMember} updateTeamMember={updateTeamMember} removeTeamMember={removeTeamMember} />}
          {currentStep === 5 && <SettingsWorkflowsStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 6 && <DocumentsFilesStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 7 && <ReviewCreateStep formData={formData} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components will be implemented in the next part due to length constraints
const BasicInformationStep: React.FC<any> = ({ formData, updateFormData, templates }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Project Information</h3>
        
        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start from Template (Optional)
          </label>
          <select
            value={formData.template}
            onChange={(e) => updateFormData('template', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Create from scratch</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => updateFormData('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value={ProjectCategory.COMMERCIAL}>Commercial</option>
              <option value={ProjectCategory.RESIDENTIAL}>Residential</option>
              <option value={ProjectCategory.INDUSTRIAL}>Industrial</option>
              <option value={ProjectCategory.INFRASTRUCTURE}>Infrastructure</option>
              <option value={ProjectCategory.RENOVATION}>Renovation</option>
              <option value={ProjectCategory.MAINTENANCE}>Maintenance</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the project scope, objectives, and key details"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => updateFormData('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="new_construction">New Construction</option>
            <option value="renovation">Renovation</option>
            <option value="addition">Addition</option>
            <option value="tenant_improvement">Tenant Improvement</option>
            <option value="maintenance">Maintenance</option>
            <option value="demolition">Demolition</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Additional step components would be implemented here...
const LocationDetailsStep: React.FC<any> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Location & Project Details</h3>
      <div className="text-center text-gray-500">
        <MapPin className="w-16 h-16 mx-auto mb-4" />
        <p>Location details form will be implemented here</p>
      </div>
    </div>
  );
};

const TimelinePhasesStep: React.FC<any> = ({ formData, updateFormData, addPhase, updatePhase, removePhase }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Timeline & Project Phases</h3>
      <div className="text-center text-gray-500">
        <Calendar className="w-16 h-16 mx-auto mb-4" />
        <p>Timeline and phases form will be implemented here</p>
      </div>
    </div>
  );
};

const BudgetCostCodesStep: React.FC<any> = ({ formData, updateFormData, addCostCode, updateCostCode, removeCostCode }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Budget & Cost Codes</h3>
      <div className="text-center text-gray-500">
        <DollarSign className="w-16 h-16 mx-auto mb-4" />
        <p>Budget and cost codes form will be implemented here</p>
      </div>
    </div>
  );
};

const TeamPermissionsStep: React.FC<any> = ({ formData, updateFormData, addTeamMember, updateTeamMember, removeTeamMember }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Team & Permissions</h3>
      <div className="text-center text-gray-500">
        <Users className="w-16 h-16 mx-auto mb-4" />
        <p>Team and permissions form will be implemented here</p>
      </div>
    </div>
  );
};

const SettingsWorkflowsStep: React.FC<any> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Settings & Workflows</h3>
      <div className="text-center text-gray-500">
        <Settings className="w-16 h-16 mx-auto mb-4" />
        <p>Settings and workflows form will be implemented here</p>
      </div>
    </div>
  );
};

const DocumentsFilesStep: React.FC<any> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Documents & Files</h3>
      <div className="text-center text-gray-500">
        <FileText className="w-16 h-16 mx-auto mb-4" />
        <p>Documents and files upload will be implemented here</p>
      </div>
    </div>
  );
};

const ReviewCreateStep: React.FC<any> = ({ formData }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Review & Create Project</h3>
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4">Project Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Project Name:</p>
            <p className="font-medium">{formData.name || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Category:</p>
            <p className="font-medium">{formData.category || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Start Date:</p>
            <p className="font-medium">{formData.startDate || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget:</p>
            <p className="font-medium">${formData.totalBudget.toLocaleString() || '0'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedProjectCreator;
