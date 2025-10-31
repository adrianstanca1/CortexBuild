// 🏗️ Safety Dashboard
// Comprehensive safety management with incident tracking, training, and compliance

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  Camera, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
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
  HardHat,
  Clipboard,
  Bell,
  Target,
  Activity,
  Zap,
  Heart,
  Phone,
  AlertCircle,
  Info,
  BookOpen,
  GraduationCap,
  UserCheck
} from 'lucide-react';

interface SafetyDashboardProps {
  projectId: string;
  userId: string;
}

interface SafetyIncident {
  id: string;
  title: string;
  description: string;
  type: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security';
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: Date;
  location: string;
  involvedPersons: string[];
  witnesses: string[];
  photos: string[];
  rootCause?: string;
  correctiveActions: string[];
  investigator?: string;
  investigatedAt?: Date;
  closedAt?: Date;
  lostTimeHours?: number;
  medicalTreatment?: boolean;
  oshaRecordable?: boolean;
}

interface SafetyTraining {
  id: string;
  title: string;
  description: string;
  type: 'orientation' | 'toolbox_talk' | 'certification' | 'refresher' | 'emergency';
  duration: number; // minutes
  instructor: string;
  scheduledDate: Date;
  completedDate?: Date;
  attendees: string[];
  requiredAttendees: string[];
  materials: string[];
  quiz?: {
    questions: number;
    passingScore: number;
    results: { [userId: string]: number };
  };
  certificateValid?: Date;
  isRequired: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface SafetyInspection {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'equipment' | 'area' | 'ppe';
  inspector: string;
  scheduledDate: Date;
  completedDate?: Date;
  location: string;
  checklist: SafetyChecklistItem[];
  score?: number;
  hazardsIdentified: number;
  hazardsResolved: number;
  photos: string[];
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
}

interface SafetyChecklistItem {
  id: string;
  item: string;
  category: string;
  isCompliant: boolean | null;
  notes?: string;
  photo?: string;
  actionRequired?: string;
}

interface SafetyMetrics {
  totalIncidents: number;
  injuryRate: number;
  nearMissRate: number;
  daysWithoutIncident: number;
  lostTimeIncidents: number;
  oshaRecordableIncidents: number;
  safetyScore: number;
  trainingComplianceRate: number;
  ppeComplianceRate: number;
  hazardsIdentified: number;
  hazardsResolved: number;
  safetyMeetingsHeld: number;
  trendsData: {
    date: Date;
    incidents: number;
    nearMisses: number;
    trainingHours: number;
    safetyScore: number;
  }[];
}

export const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [trainings, setTrainings] = useState<SafetyTraining[]>([]);
  const [inspections, setInspections] = useState<SafetyInspection[]>([]);
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadSafetyData();
  }, [projectId]);

  const loadSafetyData = async () => {
    setLoading(true);
    try {
      // Load mock data
      const mockIncidents = getMockIncidents();
      const mockTrainings = getMockTrainings();
      const mockInspections = getMockInspections();
      const mockMetrics = calculateMetrics(mockIncidents, mockTrainings, mockInspections);

      setIncidents(mockIncidents);
      setTrainings(mockTrainings);
      setInspections(mockInspections);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockIncidents = (): SafetyIncident[] => {
    return [
      {
        id: 'incident-1',
        title: 'Minor Cut on Hand',
        description: 'Worker sustained minor cut while handling metal sheeting',
        type: 'injury',
        severity: 'minor',
        status: 'resolved',
        reportedBy: 'John Smith',
        reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        location: 'Building A - 2nd Floor',
        involvedPersons: ['Mike Johnson'],
        witnesses: ['Sarah Wilson'],
        photos: ['/mock-photos/incident-1.jpg'],
        rootCause: 'Improper handling technique',
        correctiveActions: ['Additional training on material handling', 'Provide cut-resistant gloves'],
        investigator: 'Safety Officer',
        investigatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        lostTimeHours: 0,
        medicalTreatment: true,
        oshaRecordable: false
      },
      {
        id: 'incident-2',
        title: 'Near Miss - Falling Object',
        description: 'Tool fell from scaffolding, narrowly missing worker below',
        type: 'near_miss',
        severity: 'serious',
        status: 'investigating',
        reportedBy: 'Lisa Chen',
        reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        location: 'Building A - Exterior',
        involvedPersons: ['David Brown'],
        witnesses: ['Tom Wilson', 'Anna Davis'],
        photos: ['/mock-photos/incident-2.jpg'],
        correctiveActions: ['Install tool lanyards', 'Review scaffolding safety procedures'],
        investigator: 'Safety Officer'
      }
    ];
  };

  const getMockTrainings = (): SafetyTraining[] => {
    return [
      {
        id: 'training-1',
        title: 'Fall Protection Training',
        description: 'Comprehensive training on fall protection systems and procedures',
        type: 'certification',
        duration: 240, // 4 hours
        instructor: 'Safety Officer',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        attendees: [],
        requiredAttendees: ['user-1', 'user-2', 'user-3', 'user-4'],
        materials: ['Fall Protection Manual', 'Safety Harness Demo'],
        quiz: {
          questions: 20,
          passingScore: 80,
          results: {}
        },
        certificateValid: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isRequired: true,
        status: 'scheduled'
      },
      {
        id: 'training-2',
        title: 'Weekly Toolbox Talk - Electrical Safety',
        description: 'Weekly safety meeting focusing on electrical hazards',
        type: 'toolbox_talk',
        duration: 30,
        instructor: 'Electrical Foreman',
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        attendees: ['user-1', 'user-2', 'user-3'],
        requiredAttendees: ['user-1', 'user-2', 'user-3', 'user-4'],
        materials: ['Electrical Safety Checklist'],
        isRequired: true,
        status: 'completed'
      }
    ];
  };

  const getMockInspections = (): SafetyInspection[] => {
    return [
      {
        id: 'inspection-1',
        title: 'Daily Safety Inspection',
        type: 'daily',
        inspector: 'Safety Officer',
        scheduledDate: new Date(),
        completedDate: new Date(),
        location: 'Entire Site',
        score: 92,
        hazardsIdentified: 3,
        hazardsResolved: 2,
        photos: ['/mock-photos/safety-inspection-1.jpg'],
        notes: 'Overall good compliance, minor housekeeping issues noted',
        status: 'completed',
        checklist: [
          {
            id: 'check-1',
            item: 'PPE Compliance',
            category: 'Personal Protective Equipment',
            isCompliant: true,
            notes: 'All workers wearing required PPE'
          },
          {
            id: 'check-2',
            item: 'Housekeeping',
            category: 'Site Conditions',
            isCompliant: false,
            notes: 'Debris accumulation in work area',
            actionRequired: 'Clean up debris by end of day'
          },
          {
            id: 'check-3',
            item: 'Fall Protection',
            category: 'Fall Protection',
            isCompliant: true,
            notes: 'Proper fall protection systems in place'
          }
        ]
      }
    ];
  };

  const calculateMetrics = (
    incidents: SafetyIncident[], 
    trainings: SafetyTraining[], 
    inspections: SafetyInspection[]
  ): SafetyMetrics => {
    const totalIncidents = incidents.length;
    const injuryIncidents = incidents.filter(i => i.type === 'injury').length;
    const nearMissIncidents = incidents.filter(i => i.type === 'near_miss').length;
    const lostTimeIncidents = incidents.filter(i => i.lostTimeHours && i.lostTimeHours > 0).length;
    const oshaRecordableIncidents = incidents.filter(i => i.oshaRecordable).length;
    
    const completedTrainings = trainings.filter(t => t.status === 'completed');
    const totalRequiredTraining = trainings.reduce((sum, t) => sum + t.requiredAttendees.length, 0);
    const completedRequiredTraining = completedTrainings.reduce((sum, t) => sum + t.attendees.length, 0);
    const trainingComplianceRate = totalRequiredTraining > 0 ? (completedRequiredTraining / totalRequiredTraining) * 100 : 100;
    
    const completedInspections = inspections.filter(i => i.status === 'completed');
    const averageScore = completedInspections.length > 0 
      ? completedInspections.reduce((sum, i) => sum + (i.score || 0), 0) / completedInspections.length 
      : 0;
    
    const totalHazards = inspections.reduce((sum, i) => sum + i.hazardsIdentified, 0);
    const resolvedHazards = inspections.reduce((sum, i) => sum + i.hazardsResolved, 0);

    return {
      totalIncidents,
      injuryRate: injuryIncidents,
      nearMissRate: nearMissIncidents,
      daysWithoutIncident: 45, // Mock value
      lostTimeIncidents,
      oshaRecordableIncidents,
      safetyScore: averageScore,
      trainingComplianceRate,
      ppeComplianceRate: 98, // Mock value
      hazardsIdentified: totalHazards,
      hazardsResolved: resolvedHazards,
      safetyMeetingsHeld: completedTrainings.filter(t => t.type === 'toolbox_talk').length,
      trendsData: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), incidents: 1, nearMisses: 2, trainingHours: 120, safetyScore: 88 },
        { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), incidents: 0, nearMisses: 1, trainingHours: 80, safetyScore: 92 },
        { date: new Date(), incidents: totalIncidents, nearMisses: nearMissIncidents, trainingHours: 160, safetyScore: averageScore }
      ]
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'resolved': case 'closed': return 'text-green-600 bg-green-100';
      case 'in_progress': case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'scheduled': case 'reported': return 'text-yellow-600 bg-yellow-100';
      case 'failed': case 'critical': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'serious': return 'text-orange-600';
      case 'moderate': return 'text-yellow-600';
      case 'minor': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesType = typeFilter === 'all' || incident.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'inspections', label: 'Inspections', icon: Clipboard },
    { id: 'compliance', label: 'Compliance', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading safety data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Safety Management</h1>
            <p className="text-gray-600">Incident tracking, training, and safety compliance</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search incidents..."
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
                <option value="reported">Reported</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="injury">Injury</option>
                <option value="near_miss">Near Miss</option>
                <option value="property_damage">Property Damage</option>
                <option value="environmental">Environmental</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Incident
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
                    ? 'border-red-500 text-red-600'
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
          <SafetyOverviewTab 
            metrics={metrics}
            incidents={incidents}
            trainings={trainings}
            inspections={inspections}
          />
        )}
        {activeTab === 'incidents' && (
          <IncidentsTab 
            incidents={filteredIncidents}
            onSelectIncident={setSelectedIncident}
            onCreateIncident={() => setShowCreateModal(true)}
            getStatusColor={getStatusColor}
            getSeverityColor={getSeverityColor}
          />
        )}
        {activeTab === 'training' && (
          <TrainingTab 
            trainings={trainings}
            getStatusColor={getStatusColor}
          />
        )}
        {activeTab === 'inspections' && (
          <InspectionsTab 
            inspections={inspections}
            getStatusColor={getStatusColor}
          />
        )}
        {activeTab === 'compliance' && (
          <ComplianceTab 
            metrics={metrics}
          />
        )}
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <CreateIncidentModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newIncident) => {
            setIncidents([...incidents, newIncident]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={(updatedIncident) => {
            setIncidents(incidents.map(i => 
              i.id === updatedIncident.id ? updatedIncident : i
            ));
            setSelectedIncident(null);
          }}
        />
      )}
    </div>
  );
};

// Safety Overview Tab Component
const SafetyOverviewTab: React.FC<{
  metrics: SafetyMetrics;
  incidents: SafetyIncident[];
  trainings: SafetyTraining[];
  inspections: SafetyInspection[];
}> = ({ metrics, incidents, trainings, inspections }) => {
  const kpis = [
    {
      title: 'Days Without Incident',
      value: metrics.daysWithoutIncident.toString(),
      change: 5,
      icon: Shield,
      color: 'green'
    },
    {
      title: 'Safety Score',
      value: `${metrics.safetyScore.toFixed(1)}/100`,
      change: 2.3,
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Training Compliance',
      value: `${metrics.trainingComplianceRate.toFixed(1)}%`,
      change: 1.5,
      icon: GraduationCap,
      color: 'purple'
    },
    {
      title: 'PPE Compliance',
      value: `${metrics.ppeComplianceRate.toFixed(1)}%`,
      change: 0.8,
      icon: HardHat,
      color: 'orange'
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Incidents</span>
              <span className="text-sm font-medium text-gray-900">{metrics.totalIncidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Injuries</span>
              <span className="text-sm font-medium text-red-600">{metrics.injuryRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Near Misses</span>
              <span className="text-sm font-medium text-yellow-600">{metrics.nearMissRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">OSHA Recordable</span>
              <span className="text-sm font-medium text-orange-600">{metrics.oshaRecordableIncidents}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
          <div className="space-y-3">
            {incidents.slice(0, 5).map((incident) => (
              <div key={incident.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{incident.title}</p>
                  <p className="text-xs text-gray-500">{incident.location}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity.toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                    {incident.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for status and severity colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': case 'resolved': case 'closed': return 'text-green-600 bg-green-100';
    case 'in_progress': case 'investigating': return 'text-blue-600 bg-blue-100';
    case 'scheduled': case 'reported': return 'text-yellow-600 bg-yellow-100';
    case 'failed': case 'critical': return 'text-red-600 bg-red-100';
    case 'cancelled': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-red-600';
    case 'serious': return 'text-orange-600';
    case 'moderate': return 'text-yellow-600';
    case 'minor': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

// Incidents Tab Component
const IncidentsTab: React.FC<{
  incidents: SafetyIncident[];
  onSelectIncident: (incident: SafetyIncident) => void;
  onCreateIncident: () => void;
  getStatusColor: (status: string) => string;
  getSeverityColor: (severity: string) => string;
}> = ({ incidents, onSelectIncident, onCreateIncident, getStatusColor, getSeverityColor }) => {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents reported</h3>
        <p className="text-gray-600 mb-4">Great job maintaining a safe workplace!</p>
        <button
          onClick={onCreateIncident}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{incident.title}</h4>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                    {incident.status.replace('_', ' ')}
                  </span>
                  <span className={`ml-2 text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{incident.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">{incident.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">{incident.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Reported by:</span>
                    <p className="font-medium">{incident.reportedBy}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium">{incident.reportedAt.toLocaleDateString()}</p>
                  </div>
                </div>
                {incident.lostTimeHours !== undefined && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Lost Time: </span>
                    <span className={`font-medium ${incident.lostTimeHours > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {incident.lostTimeHours} hours
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onSelectIncident(incident)}
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

// Training Tab Component
const TrainingTab: React.FC<{
  trainings: SafetyTraining[];
  getStatusColor: (status: string) => string;
}> = ({ trainings, getStatusColor }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Safety Training</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Training
        </button>
      </div>

      <div className="grid gap-4">
        {trainings.map((training) => (
          <div key={training.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{training.title}</h4>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(training.status)}`}>
                    {training.status.replace('_', ' ')}
                  </span>
                  {training.isRequired && (
                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{training.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">{training.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{training.duration} minutes</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Instructor:</span>
                    <p className="font-medium">{training.instructor}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Scheduled:</span>
                    <p className="font-medium">{training.scheduledDate.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm text-gray-500">Attendance: </span>
                  <span className="font-medium">
                    {training.attendees.length}/{training.requiredAttendees.length} attendees
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-blue-600 hover:text-blue-800" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inspections Tab Component
const InspectionsTab: React.FC<{
  inspections: SafetyInspection[];
  getStatusColor: (status: string) => string;
}> = ({ inspections, getStatusColor }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Safety Inspections</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Inspection
        </button>
      </div>

      <div className="grid gap-4">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{inspection.title}</h4>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inspection.status)}`}>
                    {inspection.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">{inspection.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Inspector:</span>
                    <p className="font-medium">{inspection.inspector}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">{inspection.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium">{inspection.scheduledDate.toLocaleDateString()}</p>
                  </div>
                </div>
                {inspection.score && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Safety Score: </span>
                    <span className={`font-medium ${inspection.score >= 90 ? 'text-green-600' : inspection.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {inspection.score}/100
                    </span>
                  </div>
                )}
                <div className="mt-3">
                  <span className="text-sm text-gray-500">Hazards: </span>
                  <span className="font-medium">
                    {inspection.hazardsResolved}/{inspection.hazardsIdentified} resolved
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-blue-600 hover:text-blue-800" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Compliance Tab Component
const ComplianceTab: React.FC<{
  metrics: SafetyMetrics | null;
}> = ({ metrics }) => {
  return (
    <div className="text-center py-12">
      <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Safety Compliance</h3>
      <p className="text-gray-600 mb-4">Monitor compliance with safety regulations and standards</p>
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Training Compliance</p>
            <p className="text-2xl font-bold text-green-900">{metrics.trainingComplianceRate.toFixed(1)}%</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">PPE Compliance</p>
            <p className="text-2xl font-bold text-blue-900">{metrics.ppeComplianceRate.toFixed(1)}%</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Safety Score</p>
            <p className="text-2xl font-bold text-purple-900">{metrics.safetyScore.toFixed(1)}/100</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Incident Modal Component
const CreateIncidentModal: React.FC<{
  projectId: string;
  onClose: () => void;
  onSuccess: (incident: SafetyIncident) => void;
}> = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'near_miss' as SafetyIncident['type'],
    severity: 'minor' as SafetyIncident['severity'],
    location: '',
    involvedPersons: '',
    witnesses: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newIncident: SafetyIncident = {
      id: `incident-${Date.now()}`,
      ...formData,
      status: 'reported',
      reportedBy: 'Current User',
      reportedAt: new Date(),
      involvedPersons: formData.involvedPersons.split(',').map(p => p.trim()).filter(Boolean),
      witnesses: formData.witnesses.split(',').map(w => w.trim()).filter(Boolean),
      photos: [],
      correctiveActions: []
    };

    onSuccess(newIncident);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Report Safety Incident</h3>
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
                placeholder="Brief description of the incident"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of what happened"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SafetyIncident['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="injury">Injury</option>
                <option value="near_miss">Near Miss</option>
                <option value="property_damage">Property Damage</option>
                <option value="environmental">Environmental</option>
                <option value="security">Security</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as SafetyIncident['severity'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="serious">Serious</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Building A - 2nd Floor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Involved Persons</label>
              <input
                type="text"
                value={formData.involvedPersons}
                onChange={(e) => setFormData({ ...formData, involvedPersons: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Names separated by commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Witnesses</label>
              <input
                type="text"
                value={formData.witnesses}
                onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Names separated by commas"
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
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Report Incident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Incident Detail Modal Component
const IncidentDetailModal: React.FC<{
  incident: SafetyIncident;
  onClose: () => void;
  onUpdate: (incident: SafetyIncident) => void;
}> = ({ incident, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Incident Details</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                    {incident.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">{incident.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Severity:</span>
                  <span className={`ml-2 font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 font-medium">{incident.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Reported by:</span>
                  <span className="ml-2 font-medium">{incident.reportedBy}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-2 font-medium">{incident.reportedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Investigation Status</h4>
              <div className="space-y-3 text-sm">
                {incident.investigator && (
                  <div>
                    <span className="text-gray-500">Investigator:</span>
                    <span className="ml-2 font-medium">{incident.investigator}</span>
                  </div>
                )}
                {incident.rootCause && (
                  <div>
                    <span className="text-gray-500">Root Cause:</span>
                    <p className="mt-1 text-gray-700">{incident.rootCause}</p>
                  </div>
                )}
                {incident.correctiveActions.length > 0 && (
                  <div>
                    <span className="text-gray-500">Corrective Actions:</span>
                    <ul className="mt-1 list-disc list-inside text-gray-700">
                      {incident.correctiveActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{incident.description}</p>
          </div>
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
              Edit Incident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyDashboard;
