import React, { useState, useEffect } from 'react';
import { User, Project } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useGeolocation } from '../hooks/useGeolocation';

interface MyDayFieldViewProps {
  user: User;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface QuickCaptureAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

export const MyDayFieldView: React.FC<MyDayFieldViewProps> = ({
  user,
  projects,
  activeProject,
  onSelectProject,
  addToast
}) => {
  const { getLocation, isSupported } = useGeolocation();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [lastClockTime, setLastClockTime] = useState<Date | null>(null);
  const [selectedCostCode, setSelectedCostCode] = useState('');
  const [geofenceStatus, setGeofenceStatus] = useState<'in' | 'out' | 'unknown'>('unknown');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check geofence status
    if (isSupported && activeProject) {
      checkGeofenceStatus();
    }
  }, [activeProject, isSupported]);

  const checkGeofenceStatus = async () => {
    if (!activeProject) return;

    try {
      const position = await getLocation();
      const distance = calculateDistance(
        position.lat,
        position.lng,
        activeProject.location.lat,
        activeProject.location.lng
      );

      const radius = activeProject.geofenceRadius || 100; // 100m default
      setGeofenceStatus(distance <= radius ? 'in' : 'out');
    } catch (error) {
      console.warn('Geofence check failed:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleClockInOut = async () => {
    if (!activeProject) {
      addToast('Please select a project first', 'error');
      return;
    }

    if (!selectedCostCode && !isClockedIn) {
      addToast('Please select a cost code', 'error');
      return;
    }

    try {
      const position = await getLocation();
      
      if (isClockedIn) {
        // Clock out
        setIsClockedIn(false);
        setLastClockTime(new Date());
        addToast('Clocked out successfully', 'success');
      } else {
        // Clock in
        setIsClockedIn(true);
        setLastClockTime(new Date());
        addToast('Clocked in successfully', 'success');
      }
    } catch (error) {
      addToast('Failed to get location. Using manual mode.', 'error');
    }
  };

  const quickCaptureActions: QuickCaptureAction[] = [
    { id: 'photo', label: 'Photo', icon: '📸', action: () => console.log('Photo') },
    { id: 'task', label: 'Task', icon: '✓', action: () => console.log('Task') },
    { id: 'tm', label: 'T&M', icon: '📝', action: () => console.log('T&M') },
    { id: 'delivery', label: 'Delivery', icon: '📦', action: () => console.log('Delivery') },
    { id: 'rfi', label: 'RFI', icon: '❓', action: () => console.log('RFI') },
  ];

  const dueToday = [
    { id: 1, type: 'Daily Log', project: activeProject?.name || 'No project', action: 'log' },
    { id: 2, type: 'Toolbox Talk', time: '07:30', action: 'safety' },
    { id: 3, type: 'Tasks assigned', count: 3, action: 'tasks' },
  ];

  const recentActivity = [
    { id: 1, time: '08:05', description: '12 photos uploaded' },
    { id: 2, time: '08:22', description: 'Delivery: drywall partial' },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Offline</strong> — Capturing data locally. Will sync when online.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">My Day</h2>
          <select
            value={activeProject?.id || ''}
            onChange={(e) => {
              const project = projects.find(p => p.id === Number(e.target.value));
              if (project) onSelectProject(project);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Clock In/Out */}
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isClockedIn ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {isClockedIn ? 'Clocked In' : 'Clock In'}
                </p>
                <p className="text-sm text-slate-500">
                  {lastClockTime && `Last: ${lastClockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              geofenceStatus === 'in' ? 'bg-green-100 text-green-700' :
              geofenceStatus === 'out' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {geofenceStatus === 'in' ? '✓ On Site' :
               geofenceStatus === 'out' ? '⚠ Off Site' :
               '? Checking...'}
            </div>
          </div>

          <div className="flex gap-3">
            {!isClockedIn && (
              <select
                value={selectedCostCode}
                onChange={(e) => setSelectedCostCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Cost Code ▽</option>
                <option value="CC-201">CC-201 - Framing</option>
                <option value="CC-202">CC-202 - Electrical</option>
                <option value="CC-203">CC-203 - Plumbing</option>
              </select>
            )}
            <Button
              onClick={handleClockInOut}
              className={`${isClockedIn ? 'flex-1' : ''} ${
                isClockedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Due Today */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-700 mb-3">Due Today</h3>
        <div className="space-y-2">
          {dueToday.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-slate-700">
                    {item.type}
                    {item.count && ` (${item.count})`}
                  </p>
                  {item.project && (
                    <p className="text-xs text-slate-500">{item.project}</p>
                  )}
                  {item.time && (
                    <p className="text-xs text-slate-500">{item.time}</p>
                  )}
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </Card>

      {/* Quick Capture */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-700 mb-3">Quick Capture</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickCaptureActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition-all"
            >
              <span className="text-3xl">{action.icon}</span>
              <span className="text-xs font-medium text-slate-700">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-700 mb-3">Activity (Today)</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-slate-600">{activity.description}</p>
                <p className="text-xs text-slate-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
