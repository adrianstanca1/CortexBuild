/**
 * Equipment & Fleet Management Module
 * Comprehensive equipment tracking, maintenance, and fleet management
 */

import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import {
  Truck,
  Wrench,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Map,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  Tool,
  Gauge,
  MapPin
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
  location: string;
  assignedTo?: string;
  lastMaintenance: string;
  nextMaintenance: string;
  hoursUsed: number;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  fuelLevel?: number;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'corrective' | 'inspection';
  date: string;
  description: string;
  cost: number;
  technician: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  nextServiceDate?: string;
}

interface Props {
  currentUser: User;
  navigateTo: (screen: string, params?: any) => void;
}

const EquipmentManagementScreen: React.FC<Props> = ({ currentUser, navigateTo }) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'maintenance' | 'analytics' | 'tracking'>('fleet');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: 'EQ001',
      name: 'Excavator CAT 320',
      type: 'Heavy Machinery',
      model: 'CAT 320 GC',
      serialNumber: 'CAT320-2024-001',
      status: 'in-use',
      location: 'Site A - North Zone',
      assignedTo: 'John Smith',
      lastMaintenance: '2025-09-15',
      nextMaintenance: '2025-12-15',
      hoursUsed: 2450,
      purchaseDate: '2023-05-10',
      purchasePrice: 150000,
      currentValue: 120000,
      fuelLevel: 75
    },
    {
      id: 'EQ002',
      name: 'Concrete Mixer M500',
      type: 'Concrete Equipment',
      model: 'M500 Pro',
      serialNumber: 'MIX500-2024-045',
      status: 'available',
      location: 'Warehouse B',
      lastMaintenance: '2025-10-01',
      nextMaintenance: '2026-01-01',
      hoursUsed: 850,
      purchaseDate: '2024-02-20',
      purchasePrice: 45000,
      currentValue: 42000
    },
    {
      id: 'EQ003',
      name: 'Crane Tower TC7032',
      type: 'Lifting Equipment',
      model: 'TC7032',
      serialNumber: 'CRN7032-2023-012',
      status: 'maintenance',
      location: 'Maintenance Depot',
      lastMaintenance: '2025-10-10',
      nextMaintenance: '2025-11-10',
      hoursUsed: 5200,
      purchaseDate: '2023-01-15',
      purchasePrice: 350000,
      currentValue: 280000
    },
    {
      id: 'EQ004',
      name: 'Dump Truck Volvo FMX',
      type: 'Transport',
      model: 'Volvo FMX 500',
      serialNumber: 'VLV-FMX-2024-089',
      status: 'in-use',
      location: 'Site C - Material Yard',
      assignedTo: 'Mike Johnson',
      lastMaintenance: '2025-09-28',
      nextMaintenance: '2025-11-28',
      hoursUsed: 1820,
      purchaseDate: '2024-03-10',
      purchasePrice: 180000,
      currentValue: 165000,
      fuelLevel: 45
    }
  ]);

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: 'MNT001',
      equipmentId: 'EQ001',
      equipmentName: 'Excavator CAT 320',
      type: 'preventive',
      date: '2025-09-15',
      description: '500-hour service: oil change, filter replacement, hydraulic system check',
      cost: 1200,
      technician: 'Tom Wilson',
      status: 'completed',
      nextServiceDate: '2025-12-15'
    },
    {
      id: 'MNT002',
      equipmentId: 'EQ003',
      equipmentName: 'Crane Tower TC7032',
      type: 'corrective',
      date: '2025-10-10',
      description: 'Hydraulic pump replacement, brake system repair',
      cost: 5500,
      technician: 'Sarah Brown',
      status: 'in-progress',
      nextServiceDate: '2025-11-10'
    },
    {
      id: 'MNT003',
      equipmentId: 'EQ002',
      equipmentName: 'Concrete Mixer M500',
      type: 'inspection',
      date: '2025-10-20',
      description: 'Quarterly safety inspection and calibration',
      cost: 350,
      technician: 'Tom Wilson',
      status: 'scheduled'
    },
    {
      id: 'MNT004',
      equipmentId: 'EQ004',
      equipmentName: 'Dump Truck Volvo FMX',
      type: 'preventive',
      date: '2025-10-25',
      description: 'Brake inspection, tire rotation, engine diagnostics',
      cost: 800,
      technician: 'Mike Chen',
      status: 'scheduled'
    }
  ]);

  // Calculate statistics
  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const inUseEquipment = equipment.filter(e => e.status === 'in-use').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;
  const totalValue = equipment.reduce((sum, e) => sum + e.currentValue, 0);
  const upcomingMaintenance = maintenanceRecords.filter(m => m.status === 'scheduled').length;
  const maintenanceCosts = maintenanceRecords.reduce((sum, m) => sum + m.cost, 0);

  // Filter equipment
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatusColor = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-8 h-8 text-blue-600" />
              Equipment & Fleet Management
            </h1>
            <p className="text-gray-600 mt-1">
              Track equipment, manage maintenance, and optimize fleet utilization
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Equipment</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalEquipment}</p>
              <p className="text-sm text-green-600 mt-1">+2 this month</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Use</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{inUseEquipment}</p>
              <p className="text-sm text-gray-600 mt-1">{availableEquipment} available</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fleet Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ${(totalValue / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-600 mt-1">Current market value</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Maintenance Due</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingMaintenance}</p>
              <p className="text-sm text-yellow-600 mt-1">{maintenanceEquipment} in service</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'fleet', label: 'Fleet Overview', icon: Truck },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'tracking', label: 'GPS Tracking', icon: Map }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'fleet' && (
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search equipment by name, model, or serial number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out-of-service">Out of Service</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>

              {/* Equipment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEquipment.map(eq => (
                  <div key={eq.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Tool className="w-5 h-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">{eq.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{eq.model} • {eq.serialNumber}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{eq.location}</span>
                        </div>
                        {eq.assignedTo && (
                          <p className="text-sm text-gray-600 mt-1">Assigned to: {eq.assignedTo}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(eq.status)}`}>
                        {eq.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Hours Used</p>
                        <p className="font-semibold text-gray-900">{eq.hoursUsed.toLocaleString()}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Next Service</p>
                        <p className="font-semibold text-gray-900">{new Date(eq.nextMaintenance).toLocaleDateString()}</p>
                      </div>
                      {eq.fuelLevel !== undefined && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Fuel Level</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${eq.fuelLevel < 30 ? 'bg-red-500' : eq.fuelLevel < 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${eq.fuelLevel}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Maintenance Schedule</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-5 h-5" />
                  Schedule Maintenance
                </button>
              </div>

              <div className="space-y-3">
                {maintenanceRecords.map(record => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Wrench className="w-5 h-5 text-gray-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{record.equipmentName}</h4>
                            <p className="text-sm text-gray-600">{record.description}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${record.cost.toLocaleString()}
                          </div>
                          <div>
                            Technician: {record.technician}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMaintenanceStatusColor(record.status)}`}>
                        {record.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Fleet Analytics & Reports</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-900 font-medium">Utilization Rate</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">78%</p>
                      <p className="text-xs text-blue-700 mt-1">↑ 5% from last month</p>
                    </div>
                    <Gauge className="w-10 h-10 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-900 font-medium">Maintenance Cost/Month</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">${(maintenanceCosts / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-green-700 mt-1">↓ 12% from last month</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-900 font-medium">Downtime</p>
                      <p className="text-3xl font-bold text-purple-900 mt-2">2.3%</p>
                      <p className="text-xs text-purple-700 mt-1">Below target 5%</p>
                    </div>
                    <Clock className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics</h4>
                <p className="text-gray-600 mb-4">
                  View comprehensive charts, trends, and insights about your fleet performance
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Full Analytics
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <Map className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">GPS Fleet Tracking</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Real-time GPS tracking shows exact location of all equipment and vehicles.
                  View routes, geofences, and movement history.
                </p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Open Map View
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentManagementScreen;
