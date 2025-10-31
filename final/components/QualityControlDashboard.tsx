// 🏗️ Quality Control & Inspection Dashboard
// Comprehensive quality management with inspection workflows, checklists, and compliance tracking

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Camera, 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Star, 
  Flag, 
  MapPin, 
  Settings,
  RefreshCw,
  BarChart3,
  PieChart,
  Award,
  Shield,
  Clipboard,
  CheckSquare,
  Square,
  AlertCircle,
  Info
} from 'lucide-react';

interface QualityControlDashboardProps {
  projectId: string;
  userId: string;
}

interface Inspection {
  id: string;
  title: string;
  description: string;
  type: 'quality' | 'safety' | 'compliance' | 'final';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  inspector: string;
  inspectorName: string;
  scheduledDate: Date;
  completedDate?: Date;
  location: string;
  trade: string;
  checklist: ChecklistItem[];
  photos: InspectionPhoto[];
  defects: Defect[];
  score?: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  isRequired: boolean;
  status: 'pending' | 'passed' | 'failed' | 'na';
  notes?: string;
  photos?: string[];
  inspector?: string;
  inspectedAt?: Date;
}

interface Defect {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  category: string;
  location: string;
  discoveredBy: string;
  discoveredAt: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  dueDate?: Date;
  photos: string[];
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

interface InspectionPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface QualityMetrics {
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  pendingInspections: number;
  averageScore: number;
  defectRate: number;
  reworkCost: number;
  complianceRate: number;
  trendsData: {
    date: Date;
    score: number;
    defects: number;
    inspections: number;
  }[];
}

export const QualityControlDashboard: React.FC<QualityControlDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadQualityData();
  }, [projectId]);

  const loadQualityData = async () => {
    setLoading(true);
    try {
      // Load mock data
      const mockInspections = getMockInspections();
      const mockDefects = getMockDefects();
      const mockMetrics = calculateMetrics(mockInspections, mockDefects);

      setInspections(mockInspections);
      setDefects(mockDefects);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockInspections = (): Inspection[] => {
    return [
      {
        id: 'insp-1',
        title: 'Foundation Concrete Pour',
        description: 'Quality inspection of foundation concrete pour',
        type: 'quality',
        status: 'completed',
        priority: 'high',
        inspector: 'user-1',
        inspectorName: 'John Smith',
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: 'Building A - Foundation',
        trade: 'Concrete',
        score: 92,
        checklist: [
          {
            id: 'check-1',
            title: 'Concrete Mix Verification',
            description: 'Verify concrete mix meets specifications',
            category: 'Materials',
            isRequired: true,
            status: 'passed',
            inspector: 'John Smith',
            inspectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'check-2',
            title: 'Reinforcement Placement',
            description: 'Check rebar placement and spacing',
            category: 'Structure',
            isRequired: true,
            status: 'passed',
            inspector: 'John Smith',
            inspectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'check-3',
            title: 'Surface Finish',
            description: 'Inspect concrete surface finish quality',
            category: 'Finish',
            isRequired: false,
            status: 'failed',
            notes: 'Minor surface imperfections noted',
            inspector: 'John Smith',
            inspectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        photos: [
          {
            id: 'photo-1',
            url: '/mock-photos/foundation-1.jpg',
            thumbnailUrl: '/mock-photos/foundation-1-thumb.jpg',
            caption: 'Foundation concrete pour in progress',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        defects: [],
        notes: 'Overall good quality with minor surface finish issues',
        approvedBy: 'Sarah Johnson',
        approvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        id: 'insp-2',
        title: 'Electrical Rough-In',
        description: 'Electrical rough-in inspection before drywall',
        type: 'safety',
        status: 'in_progress',
        priority: 'medium',
        inspector: 'user-2',
        inspectorName: 'Mike Wilson',
        scheduledDate: new Date(),
        location: 'Building A - 2nd Floor',
        trade: 'Electrical',
        checklist: [
          {
            id: 'check-4',
            title: 'Wire Gauge Compliance',
            description: 'Verify wire gauge meets code requirements',
            category: 'Code Compliance',
            isRequired: true,
            status: 'pending'
          },
          {
            id: 'check-5',
            title: 'Junction Box Installation',
            description: 'Check junction box placement and securing',
            category: 'Installation',
            isRequired: true,
            status: 'pending'
          }
        ],
        photos: [],
        defects: []
      },
      {
        id: 'insp-3',
        title: 'HVAC Ductwork',
        description: 'HVAC ductwork installation inspection',
        type: 'quality',
        status: 'scheduled',
        priority: 'medium',
        inspector: 'user-3',
        inspectorName: 'Lisa Chen',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        location: 'Building A - Mechanical Room',
        trade: 'HVAC',
        checklist: [],
        photos: [],
        defects: []
      }
    ];
  };

  const getMockDefects = (): Defect[] => {
    return [
      {
        id: 'defect-1',
        title: 'Concrete Surface Imperfection',
        description: 'Minor surface imperfections in foundation concrete',
        severity: 'minor',
        category: 'Concrete',
        location: 'Building A - Foundation',
        discoveredBy: 'John Smith',
        discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'open',
        assignedTo: 'Concrete Crew',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        photos: ['/mock-photos/defect-1.jpg']
      },
      {
        id: 'defect-2',
        title: 'Misaligned Window Frame',
        description: 'Window frame not properly aligned with opening',
        severity: 'major',
        category: 'Windows',
        location: 'Building A - 1st Floor',
        discoveredBy: 'Sarah Johnson',
        discoveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'resolved',
        assignedTo: 'Window Installer',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        photos: ['/mock-photos/defect-2.jpg'],
        resolutionNotes: 'Window frame realigned and secured properly',
        resolvedBy: 'Window Installer',
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
  };

  const calculateMetrics = (inspections: Inspection[], defects: Defect[]): QualityMetrics => {
    const totalInspections = inspections.length;
    const passedInspections = inspections.filter(i => i.status === 'completed' && (i.score || 0) >= 80).length;
    const failedInspections = inspections.filter(i => i.status === 'failed').length;
    const pendingInspections = inspections.filter(i => ['scheduled', 'in_progress'].includes(i.status)).length;
    
    const completedInspections = inspections.filter(i => i.status === 'completed' && i.score);
    const averageScore = completedInspections.length > 0 
      ? completedInspections.reduce((sum, i) => sum + (i.score || 0), 0) / completedInspections.length 
      : 0;
    
    const defectRate = totalInspections > 0 ? (defects.length / totalInspections) * 100 : 0;
    const complianceRate = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0;

    return {
      totalInspections,
      passedInspections,
      failedInspections,
      pendingInspections,
      averageScore,
      defectRate,
      reworkCost: 15000, // Mock value
      complianceRate,
      trendsData: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 85, defects: 5, inspections: 8 },
        { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), score: 88, defects: 3, inspections: 12 },
        { date: new Date(), score: averageScore, defects: defects.length, inspections: totalInspections }
      ]
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'passed': case 'resolved': case 'closed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'scheduled': case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': case 'open': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inspection.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inspection.trade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesType = typeFilter === 'all' || inspection.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'inspections', label: 'Inspections', icon: Clipboard },
    { id: 'defects', label: 'Defects', icon: AlertTriangle },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare },
    { id: 'compliance', label: 'Compliance', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading quality data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quality Control</h1>
            <p className="text-gray-600">Inspection workflows, compliance tracking, and quality metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search inspections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="quality">Quality</option>
                <option value="safety">Safety</option>
                <option value="compliance">Compliance</option>
                <option value="final">Final</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Inspection
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
        {activeTab === 'overview' && metrics && (
          <OverviewTab 
            metrics={metrics}
            inspections={inspections}
            defects={defects}
          />
        )}
        {activeTab === 'inspections' && (
          <InspectionsTab 
            inspections={filteredInspections}
            onSelectInspection={setSelectedInspection}
            onCreateInspection={() => setShowCreateModal(true)}
          />
        )}
        {activeTab === 'defects' && (
          <DefectsTab 
            defects={defects}
            getStatusColor={getStatusColor}
          />
        )}
        {activeTab === 'checklists' && (
          <ChecklistsTab />
        )}
        {activeTab === 'compliance' && (
          <ComplianceTab 
            metrics={metrics}
          />
        )}
      </div>

      {/* Create Inspection Modal */}
      {showCreateModal && (
        <CreateInspectionModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newInspection) => {
            setInspections([...inspections, newInspection]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <InspectionDetailModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
          onUpdate={(updatedInspection) => {
            setInspections(inspections.map(i => 
              i.id === updatedInspection.id ? updatedInspection : i
            ));
            setSelectedInspection(null);
          }}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  metrics: QualityMetrics;
  inspections: Inspection[];
  defects: Defect[];
}> = ({ metrics, inspections, defects }) => {
  const kpis = [
    {
      title: 'Quality Score',
      value: `${metrics.averageScore.toFixed(1)}/100`,
      change: 2.5,
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Compliance Rate',
      value: `${metrics.complianceRate.toFixed(1)}%`,
      change: 1.8,
      icon: Shield,
      color: 'green'
    },
    {
      title: 'Defect Rate',
      value: `${metrics.defectRate.toFixed(1)}%`,
      change: -0.5,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Rework Cost',
      value: `$${metrics.reworkCost.toLocaleString()}`,
      change: -12.3,
      icon: TrendingUp,
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
                <div className={`flex items-center text-sm ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${kpi.change < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(kpi.change)}%
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

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-medium text-green-600">{metrics.passedInspections}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-medium text-blue-600">{metrics.pendingInspections}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Failed</span>
              <span className="text-sm font-medium text-red-600">{metrics.failedInspections}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Inspections</h3>
          <div className="space-y-3">
            {inspections.slice(0, 5).map((inspection) => (
              <div key={inspection.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inspection.title}</p>
                  <p className="text-xs text-gray-500">{inspection.location}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inspection.status)}`}>
                  {inspection.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': case 'passed': case 'resolved': case 'closed': return 'text-green-600 bg-green-100';
    case 'in_progress': return 'text-blue-600 bg-blue-100';
    case 'scheduled': case 'pending': return 'text-yellow-600 bg-yellow-100';
    case 'failed': case 'open': return 'text-red-600 bg-red-100';
    case 'cancelled': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Inspections Tab Component
const InspectionsTab: React.FC<{
  inspections: Inspection[];
  onSelectInspection: (inspection: Inspection) => void;
  onCreateInspection: () => void;
}> = ({ inspections, onSelectInspection, onCreateInspection }) => {
  if (inspections.length === 0) {
    return (
      <div className="text-center py-12">
        <Clipboard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections found</h3>
        <p className="text-gray-600 mb-4">Create your first inspection to get started</p>
        <button
          onClick={onCreateInspection}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Inspection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{inspection.title}</h4>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inspection.status)}`}>
                    {inspection.status.replace('_', ' ')}
                  </span>
                  <Flag className={`ml-2 w-4 h-4 ${getPriorityColor(inspection.priority)}`} />
                </div>
                <p className="text-gray-600 mb-3">{inspection.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Inspector:</span>
                    <p className="font-medium">{inspection.inspectorName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">{inspection.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Trade:</span>
                    <p className="font-medium">{inspection.trade}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Scheduled:</span>
                    <p className="font-medium">{inspection.scheduledDate.toLocaleDateString()}</p>
                  </div>
                </div>
                {inspection.score && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Quality Score: </span>
                    <span className={`font-medium ${inspection.score >= 90 ? 'text-green-600' : inspection.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {inspection.score}/100
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onSelectInspection(inspection)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-600 hover:text-green-800" title="Download Report">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function for priority colors
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-orange-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

// Defects Tab Component
const DefectsTab: React.FC<{
  defects: Defect[];
  getStatusColor: (status: string) => string;
}> = ({ defects, getStatusColor }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quality Defects</h3>
        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      {defects.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No defects found</h3>
          <p className="text-gray-600">Great job! No quality defects have been reported.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {defects.map((defect) => (
            <div key={defect.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{defect.title}</h4>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(defect.status)}`}>
                      {defect.status.replace('_', ' ')}
                    </span>
                    <span className={`ml-2 text-xs font-medium ${
                      defect.severity === 'critical' ? 'text-red-600' :
                      defect.severity === 'major' ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {defect.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{defect.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <p className="font-medium">{defect.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Discovered by:</span>
                      <p className="font-medium">{defect.discoveredBy}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Assigned to:</span>
                      <p className="font-medium">{defect.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Due date:</span>
                      <p className="font-medium">{defect.dueDate?.toLocaleDateString() || 'Not set'}</p>
                    </div>
                  </div>
                  {defect.resolutionNotes && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700">Resolution:</p>
                      <p className="text-sm text-green-900">{defect.resolutionNotes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-600 hover:text-blue-800" title="View Photos">
                    <Camera className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Checklists Tab Component
const ChecklistsTab: React.FC = () => {
  return (
    <div className="text-center py-12">
      <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Inspection Checklists</h3>
      <p className="text-gray-600 mb-6">Manage standardized inspection checklists and templates</p>
      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Create Checklist Template
      </button>
    </div>
  );
};

// Compliance Tab Component
const ComplianceTab: React.FC<{
  metrics: QualityMetrics | null;
}> = ({ metrics }) => {
  return (
    <div className="text-center py-12">
      <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Tracking</h3>
      <p className="text-gray-600 mb-4">Monitor compliance with building codes and standards</p>
      {metrics && (
        <div className="bg-blue-50 p-4 rounded-lg inline-block">
          <p className="text-sm text-blue-600">Current Compliance Rate</p>
          <p className="text-2xl font-bold text-blue-900">{metrics.complianceRate.toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};

// Create Inspection Modal Component
const CreateInspectionModal: React.FC<{
  projectId: string;
  onClose: () => void;
  onSuccess: (inspection: Inspection) => void;
}> = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'quality' as Inspection['type'],
    priority: 'medium' as Inspection['priority'],
    inspector: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    location: '',
    trade: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInspection: Inspection = {
      id: `insp-${Date.now()}`,
      ...formData,
      status: 'scheduled',
      inspectorName: 'Current User',
      scheduledDate: new Date(formData.scheduledDate),
      checklist: [],
      photos: [],
      defects: []
    };

    onSuccess(newInspection);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Inspection</h3>
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
                placeholder="Inspection title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of the inspection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Inspection['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="quality">Quality</option>
                <option value="safety">Safety</option>
                <option value="compliance">Compliance</option>
                <option value="final">Final</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Inspection['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Building A - 2nd Floor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade</label>
              <input
                type="text"
                value={formData.trade}
                onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Electrical, Plumbing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspector</label>
              <input
                type="text"
                value={formData.inspector}
                onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Inspector name"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Inspection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inspection Detail Modal Component
const InspectionDetailModal: React.FC<{
  inspection: Inspection;
  onClose: () => void;
  onUpdate: (inspection: Inspection) => void;
}> = ({ inspection, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{inspection.title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Inspection Details</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inspection.status)}`}>
                    {inspection.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Inspector:</span>
                  <span className="ml-2 font-medium">{inspection.inspectorName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 font-medium">{inspection.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Trade:</span>
                  <span className="ml-2 font-medium">{inspection.trade}</span>
                </div>
                {inspection.score && (
                  <div>
                    <span className="text-gray-500">Quality Score:</span>
                    <span className="ml-2 font-medium">{inspection.score}/100</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Checklist Progress</h4>
              <div className="space-y-2">
                {inspection.checklist.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    {item.status === 'passed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : item.status === 'failed' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {inspection.notes && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{inspection.notes}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Edit Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityControlDashboard;
