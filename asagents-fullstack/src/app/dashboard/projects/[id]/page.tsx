'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, Task } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Mock project data (would come from API)
const mockProject: Project = {
  id: '1',
  name: 'Commercial Roofing - Main Street Office',
  description: 'Complete roof replacement for 5-story office building including waterproofing and insulation. This is a comprehensive project that involves removing the existing roof, installing new structural elements, waterproofing membrane, insulation, and final roofing materials. The project requires coordination with building management to minimize disruption to tenants.',
  clientId: '1',
  client: {
    id: '1',
    name: 'ABC Construction Ltd',
    contactPerson: 'John Smith',
    contactEmail: 'john@abcconstruction.co.uk',
    contactPhone: '+44 20 7123 4567',
    companyEmail: 'info@abcconstruction.co.uk',
    companyPhone: '+44 20 7123 4500',
    address: {
      street: '123 Construction Way',
      city: 'London',
      state: 'England',
      zipCode: 'SW1A 1AA',
      country: 'United Kingdom',
    },
    billingAddress: '123 Construction Way, London, SW1A 1AA, UK',
    paymentTerms: 'Net 30',
    isActive: true,
    projects: [],
    totalValue: 125000,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  status: 'active',
  startDate: '2024-01-15T00:00:00Z',
  endDate: '2024-03-15T00:00:00Z',
  budget: 85000,
  actualCost: 63750,
  progress: 75,
  location: {
    lat: 51.5074,
    lng: -0.1278,
    address: '123 Main Street, London, SW1A 1AA, UK',
  },
  team: [
    {
      id: '1',
      name: 'Adrian Stanca',
      email: 'adrian.stanca1@gmail.com',
      role: 'owner',
      avatar: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1320206f2_logo.png',
      company: 'AS Cladding & Roofing Ltd',
      phone: '+44 123 456 789',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
  ],
  tasks: [],
  documents: [],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-02-20T14:30:00Z',
};

// Mock tasks data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Site Survey and Assessment',
    description: 'Complete structural assessment of existing roof and building conditions',
    projectId: '1',
    assignedTo: ['1'],
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-20T00:00:00Z',
    estimatedHours: 16,
    actualHours: 14,
    dependencies: [],
    tags: ['survey', 'assessment'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T16:30:00Z',
  },
  {
    id: '2',
    title: 'Material Procurement',
    description: 'Order and coordinate delivery of roofing materials, insulation, and waterproofing membrane',
    projectId: '1',
    assignedTo: ['1'],
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-25T00:00:00Z',
    estimatedHours: 8,
    actualHours: 10,
    dependencies: ['1'],
    tags: ['procurement', 'materials'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-25T14:20:00Z',
  },
  {
    id: '3',
    title: 'Roof Demolition',
    description: 'Safely remove existing roofing materials and prepare surface for new installation',
    projectId: '1',
    assignedTo: ['1'],
    status: 'completed',
    priority: 'medium',
    dueDate: '2024-02-05T00:00:00Z',
    estimatedHours: 32,
    actualHours: 28,
    dependencies: ['1', '2'],
    tags: ['demolition', 'preparation'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-05T17:45:00Z',
  },
  {
    id: '4',
    title: 'Structural Repairs',
    description: 'Repair and reinforce roof structure as needed based on survey findings',
    projectId: '1',
    assignedTo: ['1'],
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-02-15T00:00:00Z',
    estimatedHours: 24,
    actualHours: 18,
    dependencies: ['3'],
    tags: ['structural', 'repairs'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-12T11:30:00Z',
  },
  {
    id: '5',
    title: 'Waterproofing Installation',
    description: 'Install waterproofing membrane and ensure proper drainage',
    projectId: '1',
    assignedTo: ['1'],
    status: 'todo',
    priority: 'high',
    dueDate: '2024-02-25T00:00:00Z',
    estimatedHours: 20,
    actualHours: 0,
    dependencies: ['4'],
    tags: ['waterproofing', 'installation'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '6',
    title: 'Final Roofing Installation',
    description: 'Install final roofing materials and complete all finishing work',
    projectId: '1',
    assignedTo: ['1'],
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-03-10T00:00:00Z',
    estimatedHours: 40,
    actualHours: 0,
    dependencies: ['5'],
    tags: ['installation', 'finishing'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'documents'>('overview');

  useEffect(() => {
    // Simulate API call
    const loadProject = async () => {
      console.log('Loading project with ID:', params.id);
      await new Promise(resolve => setTimeout(resolve, 800));
      setProject(mockProject);
      setTasks(mockTasks);
      setLoading(false);
    };

    loadProject();
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'active':
        return 'badge-info';
      case 'planning':
        return 'badge-warning';
      case 'on-hold':
        return 'badge-gray';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-gray';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'review':
        return 'text-yellow-600 bg-yellow-100';
      case 'todo':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon;
      case 'in-progress':
        return ClockIcon;
      case 'review':
        return ExclamationTriangleIcon;
      case 'todo':
        return ClipboardDocumentListIcon;
      default:
        return ClipboardDocumentListIcon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card h-64"></div>
            <div className="card h-96"></div>
          </div>
          <div className="space-y-6">
            <div className="card h-48"></div>
            <div className="card h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6">
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="btn-primary"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.client?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`badge ${getStatusColor(project.status)}`}>
            {project.status === 'active' ? 'In Progress' : project.status}
          </span>
          <button className="btn-outline flex items-center space-x-2">
            <PencilIcon className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'team', label: 'Team' },
            { id: 'documents', label: 'Documents' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{project.location.address}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline</h3>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Budget Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((project.actualCost / project.budget) * 100)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(project.actualCost)} of {formatCurrency(project.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Remaining</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.max(0, Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                    </p>
                    <p className="text-sm text-gray-500">
                      Until {formatDate(project.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Budget</span>
                  </div>
                  <span className="font-medium">{formatCurrency(project.budget)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Actual Cost</span>
                  </div>
                  <span className="font-medium">{formatCurrency(project.actualCost)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Team Size</span>
                  </div>
                  <span className="font-medium">{project.team.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Tasks</span>
                  </div>
                  <span className="font-medium">{tasks.length}</span>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{project.client?.name}</p>
                  <p className="text-sm text-gray-600">{project.client?.contactPerson}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{project.client?.contactEmail}</p>
                  <p className="text-sm text-gray-600">{project.client?.contactPhone}</p>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-gray-500">Payment Terms</p>
                  <p className="text-sm font-medium">{project.client?.paymentTerms}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Tasks Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
              <p className="text-sm text-gray-600">
                {tasks.filter(t => t.status === 'completed').length} of {tasks.length} tasks completed
              </p>
            </div>
            <button className="btn-primary flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.map((task) => {
              const StatusIcon = getTaskStatusIcon(task.status);
              return (
                <div key={task.id} className="card-hover">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getTaskStatusColor(task.status)}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Due {formatDate(task.dueDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{task.actualHours}h / {task.estimatedHours}h</span>
                        </div>
                      </div>
                      
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
          <p className="text-gray-500">Team management coming soon...</p>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Documents</h2>
          <p className="text-gray-500">Document management coming soon...</p>
        </div>
      )}
    </div>
  );
}
