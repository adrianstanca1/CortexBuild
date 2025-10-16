'use client';

import { useState, useEffect } from 'react';
import { Project, Client } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

// Mock clients data
const mockClients: Client[] = [
  {
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
  {
    id: '2',
    name: 'Premier Developments',
    contactPerson: 'Sarah Johnson',
    contactEmail: 'sarah@premierdevelopments.co.uk',
    contactPhone: '+44 161 234 5678',
    companyEmail: 'contact@premierdevelopments.co.uk',
    companyPhone: '+44 161 234 5600',
    address: {
      street: '456 Development Street',
      city: 'Manchester',
      state: 'England',
      zipCode: 'M1 1AA',
      country: 'United Kingdom',
    },
    billingAddress: '456 Development Street, Manchester, M1 1AA, UK',
    paymentTerms: 'Net 15',
    isActive: true,
    projects: [],
    totalValue: 89500,
    createdAt: '2024-02-01T14:30:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
  },
  {
    id: '3',
    name: 'Heritage Properties',
    contactPerson: 'Michael Brown',
    contactEmail: 'michael@heritageproperties.co.uk',
    contactPhone: '+44 113 345 6789',
    companyEmail: 'office@heritageproperties.co.uk',
    companyPhone: '+44 113 345 6700',
    address: {
      street: '789 Heritage Lane',
      city: 'Leeds',
      state: 'England',
      zipCode: 'LS1 1AA',
      country: 'United Kingdom',
    },
    billingAddress: '789 Heritage Lane, Leeds, LS1 1AA, UK',
    paymentTerms: 'Net 30',
    isActive: true,
    projects: [],
    totalValue: 234000,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
  },
];

// Mock projects data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Commercial Roofing - Main Street Office',
    description: 'Complete roof replacement for 5-story office building including waterproofing and insulation.',
    clientId: '1',
    client: mockClients[0],
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
    team: [],
    tasks: [],
    documents: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'Residential Cladding - Apartment Complex',
    description: 'External cladding installation for new 3-building residential complex with modern composite materials.',
    clientId: '2',
    client: mockClients[1],
    status: 'planning',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-06-30T00:00:00Z',
    budget: 120000,
    actualCost: 15000,
    progress: 25,
    location: {
      lat: 53.4808,
      lng: -2.2426,
      address: '456 Development Street, Manchester, M1 1AA, UK',
    },
    team: [],
    tasks: [],
    documents: [],
    createdAt: '2024-02-01T14:30:00Z',
    updatedAt: '2024-02-25T09:15:00Z',
  },
  {
    id: '3',
    name: 'Heritage Building Restoration',
    description: 'Careful restoration of Victorian-era building roof and facade while maintaining historical integrity.',
    clientId: '3',
    client: mockClients[2],
    status: 'completed',
    startDate: '2023-10-01T00:00:00Z',
    endDate: '2024-01-31T00:00:00Z',
    budget: 95000,
    actualCost: 92500,
    progress: 100,
    location: {
      lat: 53.8008,
      lng: -1.5491,
      address: '789 Heritage Lane, Leeds, LS1 1AA, UK',
    },
    team: [],
    tasks: [],
    documents: [],
    createdAt: '2023-10-01T09:00:00Z',
    updatedAt: '2024-01-31T16:45:00Z',
  },
  {
    id: '4',
    name: 'Industrial Warehouse Roofing',
    description: 'Large-scale industrial roofing project with specialized materials for warehouse facility.',
    clientId: '1',
    client: mockClients[0],
    status: 'active',
    startDate: '2024-02-15T00:00:00Z',
    endDate: '2024-05-15T00:00:00Z',
    budget: 150000,
    actualCost: 90000,
    progress: 60,
    location: {
      lat: 51.4816,
      lng: -0.0481,
      address: '321 Industrial Park, London, SE10 0EX, UK',
    },
    team: [],
    tasks: [],
    documents: [],
    createdAt: '2024-02-15T11:20:00Z',
    updatedAt: '2024-02-28T13:10:00Z',
  },
  {
    id: '5',
    name: 'School Building Cladding Repair',
    description: 'Emergency cladding repair and safety compliance work for primary school building.',
    clientId: '2',
    client: mockClients[1],
    status: 'on-hold',
    startDate: '2024-04-01T00:00:00Z',
    endDate: '2024-07-01T00:00:00Z',
    budget: 75000,
    actualCost: 5000,
    progress: 10,
    location: {
      lat: 53.4630,
      lng: -2.2913,
      address: '159 School Lane, Manchester, M15 6PA, UK',
    },
    team: [],
    tasks: [],
    documents: [],
    createdAt: '2024-03-01T08:30:00Z',
    updatedAt: '2024-03-05T10:15:00Z',
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Simulate API call
    const loadProjects = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProjects(mockProjects);
      setLoading(false);
    };

    loadProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'In Progress';
      case 'planning':
        return 'Planning';
      case 'completed':
        return 'Completed';
      case 'on-hold':
        return 'On Hold';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Calculate statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalActualCost = projects.reduce((sum, project) => sum + project.actualCost, 0);
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex space-x-4">
          <div className="h-12 bg-gray-200 rounded flex-1"></div>
          <div className="h-12 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-80"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your construction projects and track progress</p>
          {/* Test Link */}
          <div className="mt-2">
            <a
              href="/dashboard/projects/1"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              🔗 Test Link: View Project #1 Details
            </a>
          </div>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects, clients, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select w-40"
          >
            <option value="all">All Status</option>
            <option value="active">In Progress</option>
            <option value="planning">Planning</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
              <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card-hover cursor-pointer" onClick={() => window.location.href = `/dashboard/projects/${project.id}`}>
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <ClipboardDocumentListIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600">{project.client?.name}</p>
                  </div>
                </div>
                <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="Edit">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Project Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Project Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="truncate">{project.location.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span>
                    {formatCurrency(project.actualCost)} / {formatCurrency(project.budget)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Status and Budget */}
              <div className="flex justify-between items-center mb-4">
                <span className={`badge ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
              </div>

              {/* View Details Button */}
              <div className="pt-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
                  className="w-full btn-primary text-center py-2"
                >
                  View Project Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {project.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {project.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.client?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(project.budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(project.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters.'
              : 'Get started by creating your first project.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="mt-6">
              <button className="btn-primary flex items-center space-x-2 mx-auto">
                <PlusIcon className="w-5 h-5" />
                <span>New Project</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
