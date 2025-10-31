// 🏗️ Equipment Dashboard
// Comprehensive equipment management with tracking, maintenance, and utilization

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Wrench, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Download, 
  Upload, 
  Settings,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Fuel,
  Gauge,
  Settings as Tool,
  HardHat,
  Shield,
  FileText,
  Camera,
  QrCode,
  Star,
  Flag,
  Users,
  Target
} from 'lucide-react';

interface EquipmentDashboardProps {
  projectId: string;
  userId: string;
}

interface Equipment {
  id: string;
  name: string;
  type: 'excavator' | 'crane' | 'bulldozer' | 'loader' | 'truck' | 'generator' | 'compressor' | 'tool' | 'other';
  model: string;
  manufacturer: string;
  serialNumber: string;
  year: number;
  status: 'available' | 'in_use' | 'maintenance' | 'repair' | 'out_of_service';
  location: string;
  assignedTo?: string;
  assignedProject?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  hoursUsed: number;
  fuelConsumption?: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  maintenanceInterval: number; // hours
  photos: string[];
  documents: string[];
  qrCode?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  specifications: { [key: string]: string };
  utilization: UtilizationData[];
  maintenanceHistory: MaintenanceRecord[];
  inspectionHistory: InspectionRecord[];
}

interface UtilizationData {
  date: Date;
  hoursUsed: number;
  fuelUsed?: number;
  operatorId?: string;
  projectId?: string;
  notes?: string;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  description: string;
  performedBy: string;
  performedAt: Date;
  cost: number;
  partsUsed: string[];
  hoursAtMaintenance: number;
  nextMaintenanceDue?: Date;
  photos: string[];
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface InspectionRecord {
  id: string;
  equipmentId: string;
  inspector: string;
  inspectionDate: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'annual' | 'pre_use';
  checklist: InspectionItem[];
  overallStatus: 'pass' | 'fail' | 'conditional';
  notes?: string;
  photos: string[];
  defectsFound: string[];
  correctiveActions: string[];
}

interface InspectionItem {
  item: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

interface EquipmentMetrics {
  totalEquipment: number;
  availableEquipment: number;
  inUseEquipment: number;
  maintenanceEquipment: number;
  averageUtilization: number;
  totalValue: number;
  maintenanceCosts: number;
  fuelCosts: number;
  utilizationTrends: {
    date: Date;
    utilization: number;
    costs: number;
    maintenance: number;
  }[];
}

export const EquipmentDashboard: React.FC<EquipmentDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [metrics, setMetrics] = useState<EquipmentMetrics | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadEquipmentData();
  }, [projectId]);

  const loadEquipmentData = async () => {
    setLoading(true);
    try {
      // Load mock data
      const mockEquipment = getMockEquipment();
      const mockMetrics = calculateMetrics(mockEquipment);

      setEquipment(mockEquipment);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading equipment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockEquipment = (): Equipment[] => {
    return [
      {
        id: 'eq-1',
        name: 'CAT 320 Excavator',
        type: 'excavator',
        model: '320',
        manufacturer: 'Caterpillar',
        serialNumber: 'CAT320-001',
        year: 2020,
        status: 'in_use',
        location: 'Building A - Site',
        assignedTo: 'John Smith',
        assignedProject: projectId,
        purchaseDate: new Date('2020-01-15'),
        purchasePrice: 350000,
        currentValue: 280000,
        hoursUsed: 2450,
        fuelConsumption: 15.5,
        lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        maintenanceInterval: 250,
        photos: ['/mock-photos/excavator-1.jpg'],
        documents: ['manual.pdf', 'warranty.pdf'],
        qrCode: 'EQ001',
        gpsLocation: {
          latitude: 40.7128,
          longitude: -74.0060,
          lastUpdated: new Date()
        },
        specifications: {
          'Operating Weight': '20,500 kg',
          'Engine Power': '122 kW',
          'Bucket Capacity': '1.0 m³',
          'Max Digging Depth': '6.5 m'
        },
        utilization: [
          { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), hoursUsed: 8, fuelUsed: 124, operatorId: 'john-smith', projectId },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), hoursUsed: 7.5, fuelUsed: 116, operatorId: 'john-smith', projectId }
        ],
        maintenanceHistory: [
          {
            id: 'maint-1',
            equipmentId: 'eq-1',
            type: 'preventive',
            description: '250-hour service - oil change, filter replacement',
            performedBy: 'Maintenance Team',
            performedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            cost: 850,
            partsUsed: ['Engine Oil', 'Oil Filter', 'Air Filter'],
            hoursAtMaintenance: 2200,
            nextMaintenanceDue: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            photos: ['/mock-photos/maintenance-1.jpg'],
            status: 'completed'
          }
        ],
        inspectionHistory: [
          {
            id: 'insp-1',
            equipmentId: 'eq-1',
            inspector: 'Safety Officer',
            inspectionDate: new Date(),
            type: 'daily',
            overallStatus: 'pass',
            photos: [],
            defectsFound: [],
            correctiveActions: [],
            checklist: [
              { item: 'Engine Oil Level', status: 'pass' },
              { item: 'Hydraulic Fluid Level', status: 'pass' },
              { item: 'Track Condition', status: 'pass' },
              { item: 'Bucket Condition', status: 'pass' }
            ]
          }
        ]
      },
      {
        id: 'eq-2',
        name: 'Liebherr LTM 1050',
        type: 'crane',
        model: 'LTM 1050-3.1',
        manufacturer: 'Liebherr',
        serialNumber: 'LTM1050-002',
        year: 2019,
        status: 'maintenance',
        location: 'Equipment Yard',
        purchaseDate: new Date('2019-06-10'),
        purchasePrice: 850000,
        currentValue: 720000,
        hoursUsed: 1850,
        lastMaintenance: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maintenanceInterval: 200,
        photos: ['/mock-photos/crane-1.jpg'],
        documents: ['manual.pdf', 'certification.pdf'],
        qrCode: 'EQ002',
        specifications: {
          'Max Lifting Capacity': '50 tons',
          'Boom Length': '35 m',
          'Engine Power': '270 kW',
          'Travel Speed': '85 km/h'
        },
        utilization: [],
        maintenanceHistory: [
          {
            id: 'maint-2',
            equipmentId: 'eq-2',
            type: 'corrective',
            description: 'Hydraulic pump repair',
            performedBy: 'Liebherr Service',
            performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            cost: 3500,
            partsUsed: ['Hydraulic Pump', 'Seals Kit'],
            hoursAtMaintenance: 1850,
            photos: ['/mock-photos/maintenance-2.jpg'],
            status: 'in_progress'
          }
        ],
        inspectionHistory: []
      },
      {
        id: 'eq-3',
        name: 'Generac Generator 100kW',
        type: 'generator',
        model: 'SG100',
        manufacturer: 'Generac',
        serialNumber: 'GEN100-003',
        year: 2021,
        status: 'available',
        location: 'Storage Area',
        purchaseDate: new Date('2021-03-20'),
        purchasePrice: 25000,
        currentValue: 22000,
        hoursUsed: 450,
        fuelConsumption: 8.2,
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        maintenanceInterval: 100,
        photos: ['/mock-photos/generator-1.jpg'],
        documents: ['manual.pdf'],
        qrCode: 'EQ003',
        specifications: {
          'Power Output': '100 kW',
          'Fuel Type': 'Diesel',
          'Fuel Tank': '200 L',
          'Runtime': '24 hours'
        },
        utilization: [],
        maintenanceHistory: [],
        inspectionHistory: []
      }
    ];
  };

  const calculateMetrics = (equipment: Equipment[]): EquipmentMetrics => {
    const totalEquipment = equipment.length;
    const availableEquipment = equipment.filter(e => e.status === 'available').length;
    const inUseEquipment = equipment.filter(e => e.status === 'in_use').length;
    const maintenanceEquipment = equipment.filter(e => ['maintenance', 'repair'].includes(e.status)).length;
    
    const totalValue = equipment.reduce((sum, e) => sum + e.currentValue, 0);
    const totalMaintenanceCosts = equipment.reduce((sum, e) => 
      sum + e.maintenanceHistory.reduce((mSum, m) => mSum + m.cost, 0), 0
    );
    
    // Calculate average utilization (mock calculation)
    const averageUtilization = 75; // Mock value
    const fuelCosts = 15000; // Mock value

    return {
      totalEquipment,
      availableEquipment,
      inUseEquipment,
      maintenanceEquipment,
      averageUtilization,
      totalValue,
      maintenanceCosts: totalMaintenanceCosts,
      fuelCosts,
      utilizationTrends: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), utilization: 72, costs: 12000, maintenance: 2 },
        { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), utilization: 78, costs: 14000, maintenance: 1 },
        { date: new Date(), utilization: averageUtilization, costs: fuelCosts, maintenance: maintenanceEquipment }
      ]
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'in_use': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'repair': return 'text-orange-600 bg-orange-100';
      case 'out_of_service': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'excavator': return Truck;
      case 'crane': return Activity;
      case 'bulldozer': return Truck;
      case 'loader': return Truck;
      case 'truck': return Truck;
      case 'generator': return Zap;
      case 'compressor': return Gauge;
      case 'tool': return Tool;
      default: return HardHat;
    }
  };

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         eq.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
    const matchesType = typeFilter === 'all' || eq.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'equipment', label: 'Equipment', icon: Truck },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'utilization', label: 'Utilization', icon: Activity },
    { id: 'tracking', label: 'Tracking', icon: MapPin }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading equipment data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
            <p className="text-gray-600">Track, maintain, and optimize equipment utilization</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search equipment..."
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
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="out_of_service">Out of Service</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="excavator">Excavator</option>
                <option value="crane">Crane</option>
                <option value="bulldozer">Bulldozer</option>
                <option value="loader">Loader</option>
                <option value="truck">Truck</option>
                <option value="generator">Generator</option>
                <option value="compressor">Compressor</option>
                <option value="tool">Tool</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
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
          <EquipmentOverviewTab 
            metrics={metrics}
            equipment={equipment}
          />
        )}
        {activeTab === 'equipment' && (
          <EquipmentListTab 
            equipment={filteredEquipment}
            onSelectEquipment={setSelectedEquipment}
            onCreateEquipment={() => setShowCreateModal(true)}
            getStatusColor={getStatusColor}
            getTypeIcon={getTypeIcon}
          />
        )}
        {activeTab === 'maintenance' && (
          <MaintenanceTab 
            equipment={equipment}
            getStatusColor={getStatusColor}
          />
        )}
        {activeTab === 'utilization' && (
          <UtilizationTab 
            equipment={equipment}
          />
        )}
        {activeTab === 'tracking' && (
          <TrackingTab 
            equipment={equipment}
          />
        )}
      </div>

      {/* Create Equipment Modal */}
      {showCreateModal && (
        <CreateEquipmentModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newEquipment) => {
            setEquipment([...equipment, newEquipment]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onUpdate={(updatedEquipment) => {
            setEquipment(equipment.map(e => 
              e.id === updatedEquipment.id ? updatedEquipment : e
            ));
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
};

// Equipment Overview Tab Component
const EquipmentOverviewTab: React.FC<{
  metrics: EquipmentMetrics;
  equipment: Equipment[];
}> = ({ metrics, equipment }) => {
  const kpis = [
    {
      title: 'Total Equipment',
      value: metrics.totalEquipment.toString(),
      change: 0,
      icon: Truck,
      color: 'blue'
    },
    {
      title: 'Utilization Rate',
      value: `${metrics.averageUtilization}%`,
      change: 3.2,
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Total Value',
      value: `$${(metrics.totalValue / 1000000).toFixed(1)}M`,
      change: -2.1,
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Maintenance Costs',
      value: `$${metrics.maintenanceCosts.toLocaleString()}`,
      change: -5.8,
      icon: Wrench,
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
                {kpi.change !== 0 && (
                  <div className={`flex items-center text-sm ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${kpi.change < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(kpi.change)}%
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available</span>
              <span className="text-sm font-medium text-green-600">{metrics.availableEquipment}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Use</span>
              <span className="text-sm font-medium text-blue-600">{metrics.inUseEquipment}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance</span>
              <span className="text-sm font-medium text-yellow-600">{metrics.maintenanceEquipment}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Equipment Activity</h3>
          <div className="space-y-3">
            {equipment.slice(0, 5).map((eq) => (
              <div key={eq.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{eq.name}</p>
                  <p className="text-xs text-gray-500">{eq.location}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(eq.status)}`}>
                  {eq.status.replace('_', ' ')}
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
    case 'available': return 'text-green-600 bg-green-100';
    case 'in_use': return 'text-blue-600 bg-blue-100';
    case 'maintenance': return 'text-yellow-600 bg-yellow-100';
    case 'repair': return 'text-orange-600 bg-orange-100';
    case 'out_of_service': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Equipment List Tab Component
const EquipmentListTab: React.FC<{
  equipment: Equipment[];
  onSelectEquipment: (equipment: Equipment) => void;
  onCreateEquipment: () => void;
  getStatusColor: (status: string) => string;
  getTypeIcon: (type: string) => any;
}> = ({ equipment, onSelectEquipment, onCreateEquipment, getStatusColor, getTypeIcon }) => {
  if (equipment.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
        <p className="text-gray-600 mb-4">Add your first piece of equipment to get started</p>
        <button
          onClick={onCreateEquipment}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {equipment.map((eq) => {
          const TypeIcon = getTypeIcon(eq.type);
          return (
            <div key={eq.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TypeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{eq.name}</h4>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(eq.status)}`}>
                        {eq.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{eq.manufacturer} {eq.model} ({eq.year})</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Serial:</span>
                        <p className="font-medium">{eq.serialNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <p className="font-medium">{eq.location}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Hours:</span>
                        <p className="font-medium">{eq.hoursUsed.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <p className="font-medium">${eq.currentValue.toLocaleString()}</p>
                      </div>
                    </div>
                    {eq.assignedTo && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Assigned to: </span>
                        <span className="font-medium">{eq.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectEquipment(eq)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:text-green-800" title="QR Code">
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-purple-600 hover:text-purple-800" title="Location">
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Maintenance Tab Component
const MaintenanceTab: React.FC<{
  equipment: Equipment[];
  getStatusColor: (status: string) => string;
}> = ({ equipment, getStatusColor }) => {
  const allMaintenance = equipment.flatMap(eq => 
    eq.maintenanceHistory.map(m => ({ ...m, equipmentName: eq.name }))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Maintenance Records</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </button>
      </div>

      {allMaintenance.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records</h3>
          <p className="text-gray-600">Schedule maintenance to keep equipment running smoothly</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {allMaintenance.map((maintenance) => (
            <div key={maintenance.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{maintenance.description}</h4>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(maintenance.status)}`}>
                      {maintenance.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Equipment:</span>
                      <p className="font-medium">{maintenance.equipmentName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{maintenance.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Performed by:</span>
                      <p className="font-medium">{maintenance.performedBy}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost:</span>
                      <p className="font-medium">${maintenance.cost.toLocaleString()}</p>
                    </div>
                  </div>
                  {maintenance.partsUsed.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Parts used: </span>
                      <span className="font-medium">{maintenance.partsUsed.join(', ')}</span>
                    </div>
                  )}
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
      )}
    </div>
  );
};

// Utilization Tab Component
const UtilizationTab: React.FC<{
  equipment: Equipment[];
}> = ({ equipment }) => {
  return (
    <div className="text-center py-12">
      <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment Utilization</h3>
      <p className="text-gray-600">Track equipment usage and efficiency metrics</p>
    </div>
  );
};

// Tracking Tab Component
const TrackingTab: React.FC<{
  equipment: Equipment[];
}> = ({ equipment }) => {
  return (
    <div className="text-center py-12">
      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment Tracking</h3>
      <p className="text-gray-600">Real-time GPS tracking and location history</p>
    </div>
  );
};

// Create Equipment Modal Component
const CreateEquipmentModal: React.FC<{
  projectId: string;
  onClose: () => void;
  onSuccess: (equipment: Equipment) => void;
}> = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'excavator' as Equipment['type'],
    model: '',
    manufacturer: '',
    serialNumber: '',
    year: new Date().getFullYear(),
    location: '',
    purchasePrice: 0,
    maintenanceInterval: 250
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEquipment: Equipment = {
      id: `eq-${Date.now()}`,
      ...formData,
      status: 'available',
      purchaseDate: new Date(),
      currentValue: formData.purchasePrice * 0.8, // Mock depreciation
      hoursUsed: 0,
      photos: [],
      documents: [],
      specifications: {},
      utilization: [],
      maintenanceHistory: [],
      inspectionHistory: []
    };

    onSuccess(newEquipment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New Equipment</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CAT 320 Excavator"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Equipment['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="excavator">Excavator</option>
                <option value="crane">Crane</option>
                <option value="bulldozer">Bulldozer</option>
                <option value="loader">Loader</option>
                <option value="truck">Truck</option>
                <option value="generator">Generator</option>
                <option value="compressor">Compressor</option>
                <option value="tool">Tool</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Caterpillar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 320"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Equipment serial number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Current location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Interval (hours)</label>
              <input
                type="number"
                value={formData.maintenanceInterval}
                onChange={(e) => setFormData({ ...formData, maintenanceInterval: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
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
              Add Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Equipment Detail Modal Component
const EquipmentDetailModal: React.FC<{
  equipment: Equipment;
  onClose: () => void;
  onUpdate: (equipment: Equipment) => void;
}> = ({ equipment, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{equipment.name}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Equipment Details</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(equipment.status)}`}>
                    {equipment.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">{equipment.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Manufacturer:</span>
                  <span className="ml-2 font-medium">{equipment.manufacturer}</span>
                </div>
                <div>
                  <span className="text-gray-500">Model:</span>
                  <span className="ml-2 font-medium">{equipment.model}</span>
                </div>
                <div>
                  <span className="text-gray-500">Year:</span>
                  <span className="ml-2 font-medium">{equipment.year}</span>
                </div>
                <div>
                  <span className="text-gray-500">Serial Number:</span>
                  <span className="ml-2 font-medium">{equipment.serialNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 font-medium">{equipment.location}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Usage & Maintenance</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Hours Used:</span>
                  <span className="ml-2 font-medium">{equipment.hoursUsed.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Current Value:</span>
                  <span className="ml-2 font-medium">${equipment.currentValue.toLocaleString()}</span>
                </div>
                {equipment.lastMaintenance && (
                  <div>
                    <span className="text-gray-500">Last Maintenance:</span>
                    <span className="ml-2 font-medium">{equipment.lastMaintenance.toLocaleDateString()}</span>
                  </div>
                )}
                {equipment.nextMaintenance && (
                  <div>
                    <span className="text-gray-500">Next Maintenance:</span>
                    <span className="ml-2 font-medium">{equipment.nextMaintenance.toLocaleDateString()}</span>
                  </div>
                )}
                {equipment.assignedTo && (
                  <div>
                    <span className="text-gray-500">Assigned to:</span>
                    <span className="ml-2 font-medium">{equipment.assignedTo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {Object.keys(equipment.specifications).length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-500">{key}:</span>
                    <span className="ml-2 font-medium">{value}</span>
                  </div>
                ))}
              </div>
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
              Edit Equipment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDashboard;
