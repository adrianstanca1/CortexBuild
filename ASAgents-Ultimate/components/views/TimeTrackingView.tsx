import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// FIX: Corrected import paths to be relative.
import { User, View, Project, Timesheet, TimesheetStatus } from '../../types';
import { api } from '../../services/mockApi';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGeolocation } from '../../hooks/useGeolocation';
import { MapView, MapMarkerData } from './MapView';

interface TimeTrackingViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  setActiveView: (view: View) => void;
}

const Timer: React.FC<{ startTime: Date }> = ({ startTime }) => {
    const [duration, setDuration] = useState('');

    useEffect(() => {
        const updateDuration = () => {
            const diff = Date.now() - new Date(startTime).getTime();
            const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setDuration(`${hours}:${minutes}:${seconds}`);
        };
        
        updateDuration();
        const intervalId = setInterval(updateDuration, 1000);
        return () => clearInterval(intervalId);
    }, [startTime]);

    return <p className="text-4xl font-mono font-bold text-center">{duration}</p>;
};

export const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({ user, addToast, setActiveView }) => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const selectedProject = useMemo(() => {
        if (!selectedProjectId) return null;
        return projects.find(p => p.id.toString() === selectedProjectId);
    }, [projects, selectedProjectId]);

    const geofences = useMemo(() => {
        if (!selectedProject || !selectedProject.geofenceRadius) {
            return [];
        }
        return [{
            id: selectedProject.id,
            lat: selectedProject.location.lat,
            lng: selectedProject.location.lng,
            radius: selectedProject.geofenceRadius,
        }];
    }, [selectedProject]);

    const { data: geoData, watchLocation, stopWatching, insideGeofenceIds } = useGeolocation({ geofences });
    
    const activeTimesheet = useMemo(() => timesheets.find(ts => ts.clockOut === null), [timesheets]);
    
    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            const [projData, tsData] = await Promise.all([
                api.getProjectsByUser(user.id, { signal: controller.signal }),
                api.getTimesheetsByUser(user.id, { signal: controller.signal }),
            ]);
            if (controller.signal.aborted) return;
            setProjects(projData);
            if (controller.signal.aborted) return;
            setTimesheets(tsData.sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()));
            if (controller.signal.aborted) return;
            if (activeTimesheet) {
                setSelectedProjectId(activeTimesheet.projectId.toString());
            } else if(projData.length > 0 && !selectedProjectId) {
                if (controller.signal.aborted) return;
                setSelectedProjectId(projData[0].id.toString());
            }
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load time tracking data", "error");
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [user.id, addToast, selectedProjectId, activeTimesheet]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    useEffect(() => {
        watchLocation();
        return () => stopWatching();
    }, [watchLocation, stopWatching]);

    const handleClockIn = async () => {
        if (!selectedProject) {
            addToast("Please select a project.", "error");
            return;
        }

        if (selectedProject.geofenceRadius) {
            const isInside = insideGeofenceIds.has(selectedProject.id);
            if (!isInside) {
                const proceed = window.confirm( "Warning: You appear to be outside the project's geofence. This action will be logged. Are you sure you want to clock in?");
                if (!proceed) return;
            }
        }
        
        setIsSubmitting(true);
        try {
            await api.clockIn(selectedProject.id, user.id);
            addToast(`Clocked into project ${selectedProject.name}`, 'success');
            fetchData();
        } catch(e) {
            addToast(e instanceof Error ? e.message : "Clock-in failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClockOut = async () => {
        setIsSubmitting(true);
        try {
            await api.clockOut(user.id);
            addToast(`Clocked out successfully`, 'success');
            fetchData();
        } catch(e) {
            addToast(e instanceof Error ? e.message : "Clock-out failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const mapMarkers = useMemo((): MapMarkerData[] => {
        const markers: MapMarkerData[] = [];
        if (selectedProject) {
            markers.push({ id: selectedProject.id, lat: selectedProject.location.lat, lng: selectedProject.location.lng, radius: selectedProject.geofenceRadius });
        }
        if (geoData) {
            markers.push({ id: 'user', lat: geoData.coords.latitude, lng: geoData.coords.longitude, isUserLocation: true, popupContent: "Your Location" });
        }
        return markers;
    }, [selectedProject, geoData]);
    
    if (loading) return <Card>Loading...</Card>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center">Time Clock</h2>
            <Card>
                {activeTimesheet ? (
                    <div className="space-y-4">
                        <p className="text-center text-lg">Currently clocked in at <strong>{projects.find(p => p.id === activeTimesheet.projectId)?.name}</strong></p>
                        <Timer startTime={activeTimesheet.clockIn} />
                        <Button variant="danger" className="w-full" onClick={handleClockOut} isLoading={isSubmitting}>Clock Out</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label htmlFor="project-select" className="sr-only">Select project</label>
                        <select
                            id="project-select"
                            value={selectedProjectId}
                            onChange={e => setSelectedProjectId(e.target.value)}
                            className="w-full p-3 border rounded-md bg-white dark:bg-slate-800"
                        >
                            <option value="">-- Select a project --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="h-64 w-full rounded-lg overflow-hidden">
                             <MapView markers={mapMarkers} />
                        </div>
                        <Button className="w-full" onClick={handleClockIn} disabled={!selectedProjectId || isSubmitting} isLoading={isSubmitting}>Clock In</Button>
                    </div>
                )}
            </Card>
            <Card>
                <h3 className="text-lg font-semibold mb-4">Recent Shifts</h3>
                <ul className="space-y-2">
                    {timesheets.slice(0, 5).map(ts => {
                         const hours = ts.clockOut ? ((new Date(ts.clockOut).getTime() - new Date(ts.clockIn).getTime()) / 3600000).toFixed(2) + ' hrs' : 'Active';
                         return (
                             <li key={ts.id} className="p-2 border rounded-md flex justify-between items-center dark:border-slate-700">
                                <div>
                                    <p className="font-medium">{projects.find(p => p.id == ts.projectId)?.name}</p>
                                    <p className="text-xs text-slate-500">{new Date(ts.clockIn).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{hours}</p>
                                    <p className="text-xs text-slate-500">{ts.status}</p>
                                </div>
                             </li>
                         );
                    })}
                </ul>
            </Card>
        </div>
    );
};