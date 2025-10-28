
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, View, Project, Timesheet, TimesheetStatus } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useGeolocation } from '../hooks/useGeolocation';
import { MapView, MapMarker } from './MapView';

interface TimeTrackingViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  setActiveView: (view: View) => void;
}

export const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({ user, addToast, setActiveView }) => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const { data: geoData, getLocation } = useGeolocation();

    const activeTimesheet = useMemo(() => timesheets.find(ts => ts.clockOut === null), [timesheets]);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [projData, tsData] = await Promise.all([
                api.getProjectsByUser(user.id),
                api.getTimesheetsByUser(user.id),
            ]);
            setProjects(projData);
            setTimesheets(tsData.sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()));
            if(projData.length > 0 && !selectedProjectId) {
                setSelectedProjectId(projData[0].id.toString());
            }
        } catch (error) {
            addToast("Failed to load time tracking data", "error");
        } finally {
            setLoading(false);
        }
    }, [user.id, addToast, selectedProjectId]);

    useEffect(() => {
        fetchData();
        getLocation();
    }, [fetchData, getLocation]);

    const handleClockIn = async () => {
        // Mock clock-in
        addToast(`Clocked into project ${selectedProjectId}`, 'success');
        fetchData();
    };

    const handleClockOut = async () => {
         // Mock clock-out
        addToast(`Clocked out successfully`, 'success');
        fetchData();
    };

    const mapMarkers = useMemo(() => {
        const selectedProject = projects.find(p => p.id.toString() === selectedProjectId);
        const markers: MapMarker[] = [];
        if (selectedProject) {
            markers.push({ lat: selectedProject.location.lat, lng: selectedProject.location.lng, radius: selectedProject.geofenceRadius });
        }
        if (geoData) {
            markers.push({ lat: geoData.coords.latitude, lng: geoData.coords.longitude, isUserLocation: true, popupContent: "Your Location" });
        }
        return markers;
    }, [projects, selectedProjectId, geoData]);
    
    if (loading) return <Card>Loading...</Card>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 text-center">Time Clock</h2>
            <Card>
                {activeTimesheet ? (
                    <div>
                        <p className="text-center text-lg">Currently clocked in at <strong>{projects.find(p => p.id === activeTimesheet.projectId)?.name}</strong></p>
                        <Button variant="danger" className="w-full mt-4" onClick={handleClockOut}>Clock Out</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full p-3 border rounded-md">
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <MapView markers={mapMarkers} height="h-64" />
                        <Button className="w-full" onClick={handleClockIn} disabled={!selectedProjectId}>Clock In</Button>
                    </div>
                )}
            </Card>
            <Card>
                <h3 className="text-lg font-semibold mb-4">Recent Shifts</h3>
                <ul className="space-y-2">
                    {timesheets.slice(0, 5).map(ts => (
                         <li key={ts.id} className="p-2 border rounded-md flex justify-between">
                            <span>{new Date(ts.clockIn).toLocaleDateString()}</span>
                            <span>{ts.clockOut ? 'Completed' : 'Active'}</span>
                         </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};
