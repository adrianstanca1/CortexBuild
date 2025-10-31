// 🏗️ Field Management Dashboard
// Mobile-first field management interface inspired by Fieldwire

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Camera, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  AlertTriangle,
  Plus,
  Filter,
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  QrCode,
  Scan,
  Navigation,
  Compass
} from 'lucide-react';
import { fieldManagementService } from '../services/fieldManagementService';
import { PunchList, Task, DailyReport, Photo, PunchStatus, TaskStatus, Priority } from '../types/field-management';

interface FieldManagementDashboardProps {
  projectId: string;
  userId: string;
  isOnline: boolean;
}

export const FieldManagementDashboard: React.FC<FieldManagementDashboardProps> = ({ 
  projectId, 
  userId, 
  isOnline 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [fieldData, setFieldData] = useState<{
    punchLists: PunchList[];
    tasks: Task[];
    dailyReports: DailyReport[];
    photos: Photo[];
  }>({
    punchLists: [],
    tasks: [],
    dailyReports: [],
    photos: []
  });

  useEffect(() => {
    loadFieldData();
    getCurrentLocation();
  }, [projectId]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  const loadFieldData = async () => {
    setLoading(true);
    try {
      const [punchLists, tasks, dailyReports, photos] = await Promise.all([
        fieldManagementService.getPunchLists(projectId),
        fieldManagementService.getTasks(projectId),
        fieldManagementService.getDailyReports(projectId),
        fieldManagementService.getPhotos(projectId)
      ]);

      setFieldData({ punchLists, tasks, dailyReports, photos });
    } catch (error) {
      console.error('Error loading field data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fieldManagementService.syncOfflineData();
      await loadFieldData();
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleQRScan = (result: string) => {
    console.log('QR Code scanned:', result);
    setShowQRScanner(false);

    // Parse QR code result and take appropriate action
    try {
      const qrData = JSON.parse(result);
      if (qrData.type === 'equipment') {
        // Handle equipment QR code
        alert(`Equipment scanned: ${qrData.name} (ID: ${qrData.id})`);
      } else if (qrData.type === 'location') {
        // Handle location QR code
        alert(`Location scanned: ${qrData.name} (${qrData.building}, ${qrData.floor})`);
      } else if (qrData.type === 'task') {
        // Handle task QR code
        alert(`Task scanned: ${qrData.title} (ID: ${qrData.id})`);
      }
    } catch (error) {
      // Handle plain text QR codes
      alert(`QR Code content: ${result}`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'punch', label: 'Punch Lists', icon: CheckSquare },
    { id: 'tasks', label: 'Tasks', icon: Clock },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'reports', label: 'Daily Reports', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <span className="text-gray-600">Loading field data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg min-h-screen">
      {/* Mobile Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Field Management</h1>
            <div className="flex items-center mt-1">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  <span className="text-sm">Online</span>
                </div>
              ) : (
                <div className="flex items-center text-orange-600">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span className="text-sm">Offline</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowQRScanner(true)}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <QrCode className="w-4 h-4 mr-1" />
              Scan
            </button>
            <button
              onClick={getCurrentLocation}
              className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Navigation className="w-4 h-4 mr-1" />
              GPS
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-3 px-4 min-w-0 flex-1 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && <OverviewTab fieldData={fieldData} />}
        {activeTab === 'punch' && <PunchListTab punchLists={fieldData.punchLists} projectId={projectId} />}
        {activeTab === 'tasks' && <TasksTab tasks={fieldData.tasks} projectId={projectId} />}
        {activeTab === 'photos' && <PhotosTab photos={fieldData.photos} projectId={projectId} />}
        {activeTab === 'reports' && <DailyReportsTab reports={fieldData.dailyReports} projectId={projectId} />}
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Location Display */}
      {currentLocation && (
        <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-40">
          <div className="flex items-center text-sm">
            <Compass className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-gray-600">
              {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Accuracy: ±{Math.round(currentLocation.coords.accuracy)}m
          </div>
        </div>
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ fieldData: any }> = ({ fieldData }) => {
  const { punchLists, tasks, dailyReports, photos } = fieldData;

  const stats = {
    openPunches: punchLists.filter((p: PunchList) => p.status === PunchStatus.OPEN).length,
    activeTasks: tasks.filter((t: Task) => t.status === TaskStatus.IN_PROGRESS).length,
    todayPhotos: photos.filter((p: Photo) => {
      const today = new Date();
      const photoDate = new Date(p.timestamp);
      return photoDate.toDateString() === today.toDateString();
    }).length,
    recentReports: dailyReports.length
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Open Punches</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openPunches}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Camera className="w-6 h-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Today's Photos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayPhotos}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentReports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">New punch item created</p>
              <p className="text-xs text-gray-600">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Camera className="w-5 h-5 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">5 photos uploaded</p>
              <p className="text-xs text-gray-600">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Task completed</p>
              <p className="text-xs text-gray-600">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Punch List Tab Component
const PunchListTab: React.FC<{ punchLists: PunchList[]; projectId: string }> = ({ punchLists, projectId }) => {
  const [filter, setFilter] = useState<PunchStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPunches = punchLists.filter(punch => {
    const matchesFilter = filter === 'all' || punch.status === filter;
    const matchesSearch = punch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         punch.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: PunchStatus) => {
    switch (status) {
      case PunchStatus.OPEN: return 'bg-red-100 text-red-800';
      case PunchStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case PunchStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case PunchStatus.VERIFIED: return 'bg-purple-100 text-purple-800';
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
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search punch items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          {Object.values(PunchStatus).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Punch Button */}
      <button className="w-full flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Plus className="w-5 h-5 mr-2" />
        Add Punch Item
      </button>

      {/* Punch List */}
      <div className="space-y-3">
        {filteredPunches.map((punch) => (
          <div key={punch.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{punch.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{punch.description}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(punch.priority)}`}></div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(punch.status)}`}>
                  {punch.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">{punch.trade}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {punch.location.room || punch.location.area || 'Location TBD'}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Assigned to: {punch.assignedCompany}</span>
              <span>Due: {punch.dueDate.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredPunches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No punch items found</p>
        </div>
      )}
    </div>
  );
};

// Tasks Tab Component
const TasksTab: React.FC<{ tasks: Task[]; projectId: string }> = ({ tasks, projectId }) => {
  return (
    <div className="space-y-4">
      <button className="w-full flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Plus className="w-5 h-5 mr-2" />
        Add Task
      </button>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">{task.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">Due: {task.dueDate.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No tasks found</p>
        </div>
      )}
    </div>
  );
};

// Photos Tab Component
const PhotosTab: React.FC<{ photos: Photo[]; projectId: string }> = ({ photos, projectId }) => {
  const [showCamera, setShowCamera] = useState(false);

  const handleTakePhoto = () => {
    setShowCamera(true);
  };

  const handlePhotoCapture = async (file: File) => {
    try {
      // Get current location for photo metadata
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const metadata = {
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              },
              timestamp: new Date(),
              camera: 'Mobile Camera'
            };

            // Upload photo with metadata
            await fieldManagementService.uploadPhoto(projectId, file, metadata);
            setShowCamera(false);
            // Refresh photos list
            window.location.reload();
          },
          (error) => {
            console.error('Error getting location:', error);
            // Upload without location
            const metadata = {
              timestamp: new Date(),
              camera: 'Mobile Camera'
            };
            fieldManagementService.uploadPhoto(projectId, file, metadata);
            setShowCamera(false);
          }
        );
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleTakePhoto}
          className="flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Camera className="w-5 h-5 mr-2" />
          Take Photo
        </button>
        <label className="flex items-center justify-center py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
          <Upload className="w-5 h-5 mr-2" />
          Upload
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                Array.from(e.target.files).forEach(file => {
                  handlePhotoCapture(file);
                });
              }
            }}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <img src={photo.thumbnailUrl} alt={photo.filename} className="w-full h-32 object-cover" />
            <div className="p-2">
              <p className="text-xs text-gray-600 truncate">{photo.filename}</p>
              <p className="text-xs text-gray-500">{photo.timestamp.toLocaleDateString()}</p>
              {photo.location && (
                <div className="flex items-center mt-1">
                  <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                  <p className="text-xs text-gray-400">
                    {photo.location.latitude.toFixed(4)}, {photo.location.longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No photos found</p>
          <p className="text-xs mt-1">Take photos to document progress</p>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraModal
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

// Daily Reports Tab Component
const DailyReportsTab: React.FC<{ reports: DailyReport[]; projectId: string }> = ({ reports, projectId }) => {
  return (
    <div className="space-y-4">
      <button className="w-full flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Plus className="w-5 h-5 mr-2" />
        Create Daily Report
      </button>

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Daily Report</h4>
              <span className="text-sm text-gray-500">{report.date.toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-600">{report.notes}</p>
            <div className="flex items-center mt-3 space-x-4">
              <span className="text-xs text-gray-500">Weather: {report.weather}</span>
              <span className="text-xs text-gray-500">Crew: {report.crew.length}</span>
              <span className="text-xs text-gray-500">Photos: {report.photos.length}</span>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No daily reports found</p>
        </div>
      )}
    </div>
  );
};

// QR Scanner Modal Component
const QRScannerModal: React.FC<{
  onScan: (result: string) => void;
  onClose: () => void;
}> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not available on this device');
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });

      // For demo purposes, simulate QR code scanning
      setTimeout(() => {
        // Simulate scanning different types of QR codes
        const mockQRCodes = [
          JSON.stringify({ type: 'equipment', id: 'EQ001', name: 'Excavator CAT 320' }),
          JSON.stringify({ type: 'location', id: 'LOC001', name: 'Building A', building: 'A', floor: '1' }),
          JSON.stringify({ type: 'task', id: 'TASK001', title: 'Install electrical outlets' }),
          'https://example.com/project/demo-project-1',
          'Simple text QR code content'
        ];

        const randomQR = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
        onScan(randomQR);

        // Stop the camera stream
        stream.getTracks().forEach(track => track.stop());
        setIsScanning(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">QR Code Scanner</h3>
        </div>

        <div className="p-6">
          {!isScanning && !error && (
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Scan QR codes for equipment, locations, or tasks
              </p>
              <button
                onClick={startScanning}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Scan className="w-4 h-4 mr-2" />
                Start Scanning
              </button>
            </div>
          )}

          {isScanning && (
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="animate-pulse">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Point your camera at a QR code...
              </p>
              <div className="flex space-x-2">
                <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Camera Modal Component
const CameraModal: React.FC<{
  onCapture: (file: File) => void;
  onClose: () => void;
}> = ({ onCapture, onClose }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFileCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  const simulateCapture = () => {
    setIsCapturing(true);

    // Simulate camera capture delay
    setTimeout(() => {
      // Create a mock file for demonstration
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw a simple mock image
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#333';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Mock Photo Capture', 320, 240);
        ctx.fillText(new Date().toLocaleString(), 320, 280);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.8);
      }

      setIsCapturing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
        </div>

        <div className="p-6">
          {!isCapturing ? (
            <div className="text-center space-y-4">
              <div className="w-48 h-36 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>

              <div className="space-y-2">
                <button
                  onClick={simulateCapture}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </button>

                <label className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose from Gallery
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileCapture}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-48 h-36 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="animate-pulse">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-600">Capturing photo...</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isCapturing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldManagementDashboard;
