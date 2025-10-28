import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Project, Permission } from '../types';
import { api } from '../services/mockApi';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { MapView, MapMarker } from './MapView';

interface ProjectsMapViewProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
}

export const ProjectsMapView: React.FC<ProjectsMapViewProps> = ({ user, addToast }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!user.companyId) return;

                let projectsPromise: Promise<Project[]>;
                if (hasPermission(user, Permission.VIEW_ALL_PROJECTS)) {
                    projectsPromise = api.getProjectsByCompany(user.companyId);
                } else {
                    projectsPromise = api.getProjectsByUser(user.id);
                }
                
                const fetchedProjects = await projectsPromise;
                setProjects(fetchedProjects);
            } catch (error) {
                addToast("Failed to load project locations.", 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, addToast]);

    const markers: MapMarker[] = useMemo(() => {
        return projects
            .filter(p => p.location && p.location.lat && p.location.lng)
            .map(p => ({
                lat: p.location.lat,
                lng: p.location.lng,
                radius: p.geofenceRadius,
                status: p.status,
                popupContent: (
                    <div>
                        <h4 className="font-bold">{p.name}</h4>
                        <p>Status: {p.status}</p>
                    </div>
                ),
            }));
    }, [projects]);
    
    if (loading) {
        return <Card><p>Loading map and project locations...</p></Card>;
    }

    return (
        // Use negative margins to counteract parent padding and h-screen for full height
        <Card className="h-screen p-0 overflow-hidden -m-6 lg:-m-8">
            <MapView markers={markers} height="100%" />
        </Card>
    );
};
