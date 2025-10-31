// 🏗️ Document Management Dashboard
// Comprehensive document control interface with full functionality

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Tag,
  Calendar,
  MoreVertical,
  RefreshCw,
  Grid,
  List,
  FolderOpen,
  Star,
  Share2
} from 'lucide-react';
import { documentManagementService } from '../services/documentManagementService';
import { 
  Document, 
  RFI, 
  Submittal, 
  ChangeOrder,
  DocumentFilter,
  DocumentType,
  DocumentCategory,
  DocumentStatus,
  RFIStatus,
  SubmittalStatus,
  ChangeOrderStatus,
  Priority
} from '../types/document-management';

interface DocumentManagementDashboardProps {
  projectId: string;
  userId: string;
}

export const DocumentManagementDashboard: React.FC<DocumentManagementDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const [documentData, setDocumentData] = useState<{
    documents: Document[];
    rfis: RFI[];
    submittals: Submittal[];
    changeOrders: ChangeOrder[];
    totalCounts: {
      documents: number;
      rfis: number;
      submittals: number;
      changeOrders: number;
    };
  }>({
    documents: [],
    rfis: [],
    submittals: [],
    changeOrders: [],
    totalCounts: { documents: 0, rfis: 0, submittals: 0, changeOrders: 0 }
  });

  const [filters, setFilters] = useState<DocumentFilter>({
    type: [],
    category: [],
    status: [],
    discipline: [],
    tags: [],
    searchQuery: ''
  });

  useEffect(() => {
    loadDocumentData();
  }, [projectId, filters]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery }));
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const loadDocumentData = async () => {
    setLoading(true);
    try {
      const [documentsResult, rfis, submittals, changeOrders] = await Promise.all([
        documentManagementService.getDocuments(projectId, filters),
        documentManagementService.getRFIs(projectId),
        documentManagementService.getSubmittals(projectId),
        documentManagementService.getChangeOrders(projectId)
      ]);

      setDocumentData({
        documents: documentsResult.documents,
        rfis,
        submittals,
        changeOrders,
        totalCounts: {
          documents: documentsResult.totalCount,
          rfis: rfis.length,
          submittals: submittals.length,
          changeOrders: changeOrders.length
        }
      });
    } catch (error) {
      console.error('Error loading document data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      try {
        await documentManagementService.uploadDocument(projectId, file, {
          type: DocumentType.OTHER,
          category: DocumentCategory.GENERAL,
          description: `Uploaded file: ${file.name}`
        });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    loadDocumentData();
  };

  const handleDelete = async (itemId: string, itemType: string) => {
    try {
      switch (itemType) {
        case 'document':
          await documentManagementService.deleteDocument(projectId, itemId);
          break;
        // Add other delete handlers for RFI, Submittal, Change Order
      }
      loadDocumentData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const tabs = [
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: FileText, 
      count: documentData.totalCounts.documents,
      color: 'blue'
    },
    { 
      id: 'rfis', 
      label: 'RFIs', 
      icon: MessageSquare, 
      count: documentData.totalCounts.rfis,
      color: 'orange'
    },
    { 
      id: 'submittals', 
      label: 'Submittals', 
      icon: Upload, 
      count: documentData.totalCounts.submittals,
      color: 'green'
    },
    { 
      id: 'change-orders', 
      label: 'Change Orders', 
      icon: Edit, 
      count: documentData.totalCounts.changeOrders,
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600">Centralized document control and collaboration</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
              />
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents, RFIs, submittals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <DocumentFilters filters={filters} setFilters={setFilters} />
        </div>
      )}

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
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full bg-${tab.color}-100 text-${tab.color}-800`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'documents' && (
          <DocumentsTab 
            documents={documentData.documents} 
            viewMode={viewMode}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            onDelete={(id) => handleDelete(id, 'document')}
            projectId={projectId}
          />
        )}
        {activeTab === 'rfis' && (
          <RFIsTab 
            rfis={documentData.rfis} 
            projectId={projectId}
            onRefresh={loadDocumentData}
          />
        )}
        {activeTab === 'submittals' && (
          <SubmittalsTab 
            submittals={documentData.submittals} 
            projectId={projectId}
            onRefresh={loadDocumentData}
          />
        )}
        {activeTab === 'change-orders' && (
          <ChangeOrdersTab 
            changeOrders={documentData.changeOrders} 
            projectId={projectId}
            onRefresh={loadDocumentData}
          />
        )}
      </div>
    </div>
  );
};

// Document Filters Component
const DocumentFilters: React.FC<{
  filters: DocumentFilter;
  setFilters: (filters: DocumentFilter) => void;
}> = ({ filters, setFilters }) => {
  const updateFilter = (key: keyof DocumentFilter, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          multiple
          value={filters.type || []}
          onChange={(e) => updateFilter('type', Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(DocumentType).map(type => (
            <option key={type} value={type}>{type.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          multiple
          value={filters.category || []}
          onChange={(e) => updateFilter('category', Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(DocumentCategory).map(category => (
            <option key={category} value={category}>{category.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          multiple
          value={filters.status || []}
          onChange={(e) => updateFilter('status', Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(DocumentStatus).map(status => (
            <option key={status} value={status}>{status.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
        <input
          type="text"
          placeholder="Enter discipline"
          value={filters.discipline?.join(', ') || ''}
          onChange={(e) => updateFilter('discipline', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// Documents Tab Component
const DocumentsTab: React.FC<{
  documents: Document[];
  viewMode: 'grid' | 'list';
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  onDelete: (id: string) => void;
  projectId: string;
}> = ({ documents, viewMode, selectedItems, setSelectedItems, onDelete, projectId }) => {
  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED: return 'bg-green-100 text-green-800';
      case DocumentStatus.UNDER_REVIEW: return 'bg-yellow-100 text-yellow-800';
      case DocumentStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case DocumentStatus.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.DRAWING: return <FileText className="w-5 h-5 text-blue-600" />;
      case DocumentType.SPECIFICATION: return <FileText className="w-5 h-5 text-green-600" />;
      case DocumentType.CONTRACT: return <FileText className="w-5 h-5 text-purple-600" />;
      case DocumentType.PHOTO: return <FileText className="w-5 h-5 text-orange-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-600 mb-4">Upload your first document to get started</p>
        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
          <input type="file" multiple className="hidden" />
        </label>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} onDelete={onDelete} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(documents.map(d => d.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Version
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modified
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((document) => (
            <tr key={document.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedItems.includes(document.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, document.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== document.id));
                    }
                  }}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getTypeIcon(document.type)}
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{document.name}</div>
                    <div className="text-sm text-gray-500">{document.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{document.type.replace('_', ' ')}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
                  {document.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {document.version}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {document.updatedAt.toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(document.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Document Card Component for Grid View
const DocumentCard: React.FC<{
  document: Document;
  onDelete: (id: string) => void;
}> = ({ document, onDelete }) => {
  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED: return 'bg-green-100 text-green-800';
      case DocumentStatus.UNDER_REVIEW: return 'bg-yellow-100 text-yellow-800';
      case DocumentStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case DocumentStatus.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <FileText className="w-8 h-8 text-blue-600" />
        <div className="relative">
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <h3 className="font-medium text-gray-900 mb-1 truncate">{document.name}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
          {document.status.replace('_', ' ')}
        </span>
        <span className="text-xs text-gray-500">v{document.version}</span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{document.updatedAt.toLocaleDateString()}</span>
        <div className="flex items-center space-x-2">
          <button className="text-blue-600 hover:text-blue-800">
            <Eye className="w-3 h-3" />
          </button>
          <button className="text-green-600 hover:text-green-800">
            <Download className="w-3 h-3" />
          </button>
          <button 
            onClick={() => onDelete(document.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// RFI Management Component
const RFIsTab: React.FC<{ rfis: RFI[]; projectId: string; onRefresh: () => void }> = ({
  rfis,
  projectId,
  onRefresh
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  const getStatusColor = (status: RFIStatus) => {
    switch (status) {
      case RFIStatus.OPEN: return 'bg-red-100 text-red-800';
      case RFIStatus.UNDER_REVIEW: return 'bg-yellow-100 text-yellow-800';
      case RFIStatus.RESPONDED: return 'bg-blue-100 text-blue-800';
      case RFIStatus.CLOSED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL: return 'bg-red-500';
      case Priority.HIGH: return 'bg-orange-500';
      case Priority.MEDIUM: return 'bg-yellow-500';
      case Priority.LOW: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Request for Information (RFI)</h3>
          <p className="text-sm text-gray-600">Manage project clarifications and questions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create RFI
        </button>
      </div>

      {/* RFI List */}
      {rfis.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No RFIs found</h3>
          <p className="text-gray-600 mb-4">Create your first RFI to get clarification on project details</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create RFI
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {rfis.map((rfi) => (
            <div key={rfi.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{rfi.title}</h4>
                    <span className="ml-2 text-sm text-gray-500">#{rfi.number}</span>
                    <div className={`ml-2 w-3 h-3 rounded-full ${getPriorityColor(rfi.priority)}`}></div>
                  </div>
                  <p className="text-gray-600 mb-3">{rfi.description}</p>
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Question:</p>
                    <p className="text-sm text-gray-900">{rfi.question}</p>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end space-y-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfi.status)}`}>
                    {rfi.status.replace('_', ' ')}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedRFI(rfi);
                        setShowResponseModal(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Respond"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Requested by:</span>
                  <p className="font-medium">{rfi.requestedCompany}</p>
                </div>
                <div>
                  <span className="text-gray-500">Assigned to:</span>
                  <p className="font-medium">{rfi.assignedCompany}</p>
                </div>
                <div>
                  <span className="text-gray-500">Due date:</span>
                  <p className="font-medium">{rfi.dueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Discipline:</span>
                  <p className="font-medium">{rfi.discipline}</p>
                </div>
              </div>

              {rfi.costImpact && (
                <div className="mt-3 flex items-center space-x-4 text-sm">
                  <span className="text-red-600">Cost Impact: ${rfi.costImpact.toLocaleString()}</span>
                  {rfi.scheduleImpact && (
                    <span className="text-orange-600">Schedule Impact: {rfi.scheduleImpact} days</span>
                  )}
                </div>
              )}

              {rfi.response && (
                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 mb-1">Response:</p>
                  <p className="text-sm text-blue-900">{rfi.response.content}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Responded by {rfi.response.respondedBy} on {rfi.response.respondedAt.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create RFI Modal */}
      {showCreateModal && (
        <CreateRFIModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRFI && (
        <RFIResponseModal
          rfi={selectedRFI}
          projectId={projectId}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedRFI(null);
          }}
          onSuccess={() => {
            setShowResponseModal(false);
            setSelectedRFI(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

const SubmittalsTab: React.FC<{ submittals: Submittal[]; projectId: string; onRefresh: () => void }> = ({
  submittals,
  projectId,
  onRefresh
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubmittal, setSelectedSubmittal] = useState<Submittal | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const getStatusColor = (status: SubmittalStatus) => {
    switch (status) {
      case SubmittalStatus.NOT_SUBMITTED: return 'bg-gray-100 text-gray-800';
      case SubmittalStatus.SUBMITTED: return 'bg-blue-100 text-blue-800';
      case SubmittalStatus.UNDER_REVIEW: return 'bg-yellow-100 text-yellow-800';
      case SubmittalStatus.APPROVED: return 'bg-green-100 text-green-800';
      case SubmittalStatus.APPROVED_WITH_COMMENTS: return 'bg-green-100 text-green-800';
      case SubmittalStatus.REJECTED: return 'bg-red-100 text-red-800';
      case SubmittalStatus.RESUBMIT: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL: return 'bg-red-500';
      case Priority.HIGH: return 'bg-orange-500';
      case Priority.MEDIUM: return 'bg-yellow-500';
      case Priority.LOW: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Submittal Management</h3>
          <p className="text-sm text-gray-600">Track and review project submittals</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Submittal
        </button>
      </div>

      {/* Submittal List */}
      {submittals.length === 0 ? (
        <div className="text-center py-12">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submittals found</h3>
          <p className="text-gray-600 mb-4">Create your first submittal to track project approvals</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Submittal
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {submittals.map((submittal) => (
            <div key={submittal.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{submittal.title}</h4>
                    <span className="ml-2 text-sm text-gray-500">#{submittal.number}</span>
                    <div className={`ml-2 w-3 h-3 rounded-full ${getPriorityColor(submittal.priority)}`}></div>
                  </div>
                  <p className="text-gray-600 mb-3">{submittal.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span><strong>Type:</strong> {submittal.type.replace('_', ' ')}</span>
                    <span><strong>Specification:</strong> {submittal.specification}</span>
                    <span><strong>Discipline:</strong> {submittal.discipline}</span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end space-y-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submittal.status)}`}>
                    {submittal.status.replace('_', ' ')}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedSubmittal(submittal);
                        setShowReviewModal(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Review"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Submitted by:</span>
                  <p className="font-medium">{submittal.submittedCompany}</p>
                </div>
                <div>
                  <span className="text-gray-500">Due date:</span>
                  <p className="font-medium">{submittal.dueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Submission date:</span>
                  <p className="font-medium">{submittal.submissionDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Copies:</span>
                  <p className="font-medium">{submittal.copies}</p>
                </div>
              </div>

              {submittal.reviews.length > 0 && (
                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 mb-1">Latest Review:</p>
                  <p className="text-sm text-blue-900">{submittal.reviews[submittal.reviews.length - 1].comments}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Reviewed by {submittal.reviews[submittal.reviews.length - 1].reviewedBy} on {submittal.reviews[submittal.reviews.length - 1].reviewedAt.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Submittal Modal */}
      {showCreateModal && (
        <CreateSubmittalModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSubmittal && (
        <SubmittalReviewModal
          submittal={selectedSubmittal}
          projectId={projectId}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedSubmittal(null);
          }}
          onSuccess={() => {
            setShowReviewModal(false);
            setSelectedSubmittal(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

const ChangeOrdersTab: React.FC<{ changeOrders: ChangeOrder[]; projectId: string; onRefresh: () => void }> = ({
  changeOrders,
  projectId,
  onRefresh
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<ChangeOrder | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const getStatusColor = (status: ChangeOrderStatus) => {
    switch (status) {
      case ChangeOrderStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case ChangeOrderStatus.SUBMITTED: return 'bg-blue-100 text-blue-800';
      case ChangeOrderStatus.UNDER_REVIEW: return 'bg-yellow-100 text-yellow-800';
      case ChangeOrderStatus.APPROVED: return 'bg-green-100 text-green-800';
      case ChangeOrderStatus.REJECTED: return 'bg-red-100 text-red-800';
      case ChangeOrderStatus.IMPLEMENTED: return 'bg-purple-100 text-purple-800';
      case ChangeOrderStatus.CANCELLED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL: return 'bg-red-500';
      case Priority.HIGH: return 'bg-orange-500';
      case Priority.MEDIUM: return 'bg-yellow-500';
      case Priority.LOW: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Change Order Management</h3>
          <p className="text-sm text-gray-600">Track project scope and cost changes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Change Order
        </button>
      </div>

      {/* Change Order List */}
      {changeOrders.length === 0 ? (
        <div className="text-center py-12">
          <Edit className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No change orders found</h3>
          <p className="text-gray-600 mb-4">Create your first change order to track project modifications</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Change Order
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {changeOrders.map((changeOrder) => (
            <div key={changeOrder.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{changeOrder.title}</h4>
                    <span className="ml-2 text-sm text-gray-500">#{changeOrder.number}</span>
                    <div className={`ml-2 w-3 h-3 rounded-full ${getPriorityColor(changeOrder.priority)}`}></div>
                  </div>
                  <p className="text-gray-600 mb-3">{changeOrder.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span><strong>Type:</strong> {changeOrder.type.replace('_', ' ')}</span>
                    <span><strong>Reason:</strong> {changeOrder.reason.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end space-y-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(changeOrder.status)}`}>
                    {changeOrder.status.replace('_', ' ')}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedChangeOrder(changeOrder);
                        setShowApprovalModal(true);
                      }}
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cost and Schedule Impact */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Cost Impact:</span>
                  <p className={`font-medium ${changeOrder.costImpact >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(changeOrder.costImpact)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Schedule Impact:</span>
                  <p className={`font-medium ${changeOrder.scheduleImpact > 0 ? 'text-red-600' : changeOrder.scheduleImpact < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {changeOrder.scheduleImpact > 0 ? '+' : ''}{changeOrder.scheduleImpact} days
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Requested by:</span>
                  <p className="font-medium">{changeOrder.requestedBy}</p>
                </div>
                <div>
                  <span className="text-gray-500">Assigned to:</span>
                  <p className="font-medium">{changeOrder.assignedTo}</p>
                </div>
              </div>

              {/* Justification */}
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Justification:</p>
                <p className="text-sm text-gray-900">{changeOrder.justification}</p>
              </div>

              {/* Scope Summary */}
              {changeOrder.scope && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {changeOrder.scope.addedWork.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium text-green-700 mb-1">Added Work:</p>
                      <p className="text-green-900">{changeOrder.scope.addedWork.length} items</p>
                    </div>
                  )}
                  {changeOrder.scope.deletedWork.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="font-medium text-red-700 mb-1">Deleted Work:</p>
                      <p className="text-red-900">{changeOrder.scope.deletedWork.length} items</p>
                    </div>
                  )}
                  {changeOrder.scope.modifiedWork.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium text-blue-700 mb-1">Modified Work:</p>
                      <p className="text-blue-900">{changeOrder.scope.modifiedWork.length} items</p>
                    </div>
                  )}
                </div>
              )}

              {/* Approvals */}
              {changeOrder.approvals.length > 0 && (
                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 mb-1">Approvals:</p>
                  <div className="space-y-1">
                    {changeOrder.approvals.map((approval, index) => (
                      <p key={index} className="text-sm text-blue-900">
                        {approval.approverType}: {approval.status} by {approval.approver}
                        {approval.approvedAt && ` on ${approval.approvedAt.toLocaleDateString()}`}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Change Order Modal */}
      {showCreateModal && (
        <CreateChangeOrderModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedChangeOrder && (
        <ChangeOrderApprovalModal
          changeOrder={selectedChangeOrder}
          projectId={projectId}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedChangeOrder(null);
          }}
          onSuccess={() => {
            setShowApprovalModal(false);
            setSelectedChangeOrder(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

// Create RFI Modal Component
const CreateRFIModal: React.FC<{
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    question: '',
    priority: Priority.MEDIUM,
    category: 'design_clarification',
    discipline: '',
    assignedTo: '',
    assignedCompany: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    costImpact: '',
    scheduleImpact: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await documentManagementService.createRFI(projectId, {
        ...formData,
        dueDate: new Date(formData.dueDate),
        costImpact: formData.costImpact ? parseFloat(formData.costImpact) : undefined,
        scheduleImpact: formData.scheduleImpact ? parseInt(formData.scheduleImpact) : undefined
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating RFI:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New RFI</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the RFI"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of the issue or context"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
              <textarea
                required
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Specific question that needs to be answered"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
                <option value={Priority.CRITICAL}>Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
              <input
                type="text"
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Architectural, Structural"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Person responsible for response"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Company</label>
              <input
                type="text"
                value={formData.assignedCompany}
                onChange={(e) => setFormData({ ...formData, assignedCompany: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Company responsible for response"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Impact ($)</label>
              <input
                type="number"
                value={formData.costImpact}
                onChange={(e) => setFormData({ ...formData, costImpact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Estimated cost impact"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Impact (days)</label>
              <input
                type="number"
                value={formData.scheduleImpact}
                onChange={(e) => setFormData({ ...formData, scheduleImpact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Estimated schedule impact"
              />
            </div>
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create RFI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// RFI Response Modal Component
const RFIResponseModal: React.FC<{
  rfi: RFI;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ rfi, projectId, onClose, onSuccess }) => {
  const [response, setResponse] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpActions, setFollowUpActions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await documentManagementService.respondToRFI(projectId, rfi.id, {
        content: response,
        followUpRequired,
        followUpActions: followUpRequired ? followUpActions.split('\n').filter(Boolean) : []
      });
      onSuccess();
    } catch (error) {
      console.error('Error responding to RFI:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Respond to RFI #{rfi.number}</h3>
          <p className="text-sm text-gray-600">{rfi.title}</p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Original Question:</h4>
            <p className="text-gray-700">{rfi.question}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Response *</label>
              <textarea
                required
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Provide a detailed response to the question"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="followUpRequired" className="ml-2 text-sm text-gray-700">
                Follow-up actions required
              </label>
            </div>

            {followUpRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Actions</label>
                <textarea
                  value={followUpActions}
                  onChange={(e) => setFollowUpActions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="List required follow-up actions (one per line)"
                />
              </div>
            )}

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
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Create Submittal Modal Component
const CreateSubmittalModal: React.FC<{
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'product_data',
    category: 'general',
    discipline: '',
    specification: '',
    priority: Priority.MEDIUM,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    copies: '1',
    deliveryMethod: 'electronic'
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await documentManagementService.createSubmittal(projectId, {
        ...formData,
        dueDate: new Date(formData.dueDate),
        copies: parseInt(formData.copies)
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating submittal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Submittal</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Submittal title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of the submittal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="shop_drawings">Shop Drawings</option>
                <option value="product_data">Product Data</option>
                <option value="samples">Samples</option>
                <option value="certificates">Certificates</option>
                <option value="test_reports">Test Reports</option>
                <option value="operation_manuals">Operation Manuals</option>
                <option value="warranty">Warranty</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="architectural">Architectural</option>
                <option value="structural">Structural</option>
                <option value="mechanical">Mechanical</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="fire_protection">Fire Protection</option>
                <option value="specialty">Specialty</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
              <input
                type="text"
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., HVAC, Electrical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specification</label>
              <input
                type="text"
                value={formData.specification}
                onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 05 12 00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
                <option value={Priority.CRITICAL}>Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Copies Required</label>
              <input
                type="number"
                min="1"
                value={formData.copies}
                onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
              <select
                value={formData.deliveryMethod}
                onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="electronic">Electronic</option>
                <option value="hard_copy">Hard Copy</option>
                <option value="both">Both</option>
              </select>
            </div>
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Submittal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Submittal Review Modal Component
const SubmittalReviewModal: React.FC<{
  submittal: Submittal;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ submittal, projectId, onClose, onSuccess }) => {
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    comments: '',
    actionRequired: false,
    actions: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await documentManagementService.reviewSubmittal(projectId, submittal.id, {
        ...reviewData,
        actions: reviewData.actionRequired ? reviewData.actions.split('\n').filter(Boolean) : []
      });
      onSuccess();
    } catch (error) {
      console.error('Error reviewing submittal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Review Submittal #{submittal.number}</h3>
          <p className="text-sm text-gray-600">{submittal.title}</p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Submittal Details:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Type:</strong> {submittal.type.replace('_', ' ')}</div>
              <div><strong>Specification:</strong> {submittal.specification}</div>
              <div><strong>Discipline:</strong> {submittal.discipline}</div>
              <div><strong>Due Date:</strong> {submittal.dueDate.toLocaleDateString()}</div>
            </div>
            <p className="text-gray-700 mt-2">{submittal.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Status *</label>
              <select
                required
                value={reviewData.status}
                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="approved">Approved</option>
                <option value="approved_with_comments">Approved with Comments</option>
                <option value="rejected">Rejected</option>
                <option value="revise_and_resubmit">Revise and Resubmit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments *</label>
              <textarea
                required
                value={reviewData.comments}
                onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed review comments"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="actionRequired"
                checked={reviewData.actionRequired}
                onChange={(e) => setReviewData({ ...reviewData, actionRequired: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="actionRequired" className="ml-2 text-sm text-gray-700">
                Action items required
              </label>
            </div>

            {reviewData.actionRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Items</label>
                <textarea
                  value={reviewData.actions}
                  onChange={(e) => setReviewData({ ...reviewData, actions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="List required action items (one per line)"
                />
              </div>
            )}

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
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Create Change Order Modal Component
const CreateChangeOrderModal: React.FC<{
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'addition',
    reason: 'scope_change',
    priority: Priority.MEDIUM,
    costImpact: '',
    scheduleImpact: '',
    justification: '',
    assignedTo: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await documentManagementService.createChangeOrder(projectId, {
        ...formData,
        costImpact: formData.costImpact ? parseFloat(formData.costImpact) : 0,
        scheduleImpact: formData.scheduleImpact ? parseInt(formData.scheduleImpact) : 0
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating change order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Change Order</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the change"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of the change"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="addition">Addition</option>
                <option value="deletion">Deletion</option>
                <option value="modification">Modification</option>
                <option value="time_extension">Time Extension</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="design_change">Design Change</option>
                <option value="scope_change">Scope Change</option>
                <option value="unforeseen_conditions">Unforeseen Conditions</option>
                <option value="owner_request">Owner Request</option>
                <option value="regulatory_change">Regulatory Change</option>
                <option value="material_substitution">Material Substitution</option>
                <option value="error_omission">Error/Omission</option>
                <option value="value_engineering">Value Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
                <option value={Priority.CRITICAL}>Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Person responsible for review"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Impact ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.costImpact}
                onChange={(e) => setFormData({ ...formData, costImpact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Positive for cost increase, negative for savings"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Impact (days)</label>
              <input
                type="number"
                value={formData.scheduleImpact}
                onChange={(e) => setFormData({ ...formData, scheduleImpact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Positive for delay, negative for acceleration"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Justification *</label>
              <textarea
                required
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed justification for the change order"
              />
            </div>
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Change Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Change Order Approval Modal Component
const ChangeOrderApprovalModal: React.FC<{
  changeOrder: ChangeOrder;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ changeOrder, projectId, onClose, onSuccess }) => {
  const [approvalData, setApprovalData] = useState({
    status: 'approved',
    comments: '',
    conditions: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await documentManagementService.approveChangeOrder(projectId, changeOrder.id, {
        ...approvalData,
        conditions: approvalData.conditions ? approvalData.conditions.split('\n').filter(Boolean) : []
      });
      onSuccess();
    } catch (error) {
      console.error('Error approving change order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Approve Change Order #{changeOrder.number}</h3>
          <p className="text-sm text-gray-600">{changeOrder.title}</p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Change Order Summary:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div><strong>Type:</strong> {changeOrder.type.replace('_', ' ')}</div>
              <div><strong>Reason:</strong> {changeOrder.reason.replace('_', ' ')}</div>
              <div><strong>Cost Impact:</strong> <span className={changeOrder.costImpact >= 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(changeOrder.costImpact)}</span></div>
              <div><strong>Schedule Impact:</strong> <span className={changeOrder.scheduleImpact > 0 ? 'text-red-600' : changeOrder.scheduleImpact < 0 ? 'text-green-600' : 'text-gray-900'}>{changeOrder.scheduleImpact > 0 ? '+' : ''}{changeOrder.scheduleImpact} days</span></div>
            </div>
            <p className="text-gray-700"><strong>Description:</strong> {changeOrder.description}</p>
            <p className="text-gray-700 mt-2"><strong>Justification:</strong> {changeOrder.justification}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status *</label>
              <select
                required
                value={approvalData.status}
                onChange={(e) => setApprovalData({ ...approvalData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="conditional">Conditional Approval</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments *</label>
              <textarea
                required
                value={approvalData.comments}
                onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed approval comments"
              />
            </div>

            {approvalData.status === 'conditional' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conditions</label>
                <textarea
                  value={approvalData.conditions}
                  onChange={(e) => setApprovalData({ ...approvalData, conditions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="List approval conditions (one per line)"
                />
              </div>
            )}

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
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  approvalData.status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                  approvalData.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {loading ? 'Submitting...' : `${approvalData.status === 'approved' ? 'Approve' : approvalData.status === 'rejected' ? 'Reject' : 'Conditionally Approve'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagementDashboard;
