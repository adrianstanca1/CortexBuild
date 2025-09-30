import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { User, Project, Permission, ProjectStatus } from '../../types';
import { api } from '../../services/mockApi';
import { hasPermission } from '../../services/auth';
import { Card } from '../ui/card';
import { MapView, MapMarkerData } from './MapView';

interface ProjectsMapViewProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
}

export const ProjectsMapView: React.FC<ProjectsMapViewProps> = ({ user, addToast }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;

            let projectsPromise: Promise<Project[]>;
            if (hasPermission(user, Permission.VIEW_ALL_PROJECTS)) {
                projectsPromise = api.getProjectsByCompany(user.companyId, { signal: controller.signal });
            } else {
                projectsPromise = api.getProjectsByUser(user.id, { signal: controller.signal });
            }

            const fetchedProjects = await projectsPromise;
            if (controller.signal.aborted) return;
            setProjects(fetchedProjects);
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load project locations.", 'error');
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    const markers: MapMarkerData[] = useMemo(() => {
        const toPascalCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        return projects
            .filter(p => p.location && p.location.lat && p.location.lng)
            .map(p => ({
                id: p.id,
                lat: p.location.lat,
                lng: p.location.lng,
                radius: p.geofenceRadius,
                // FIX: Convert project status to PascalCase for the map marker type.
                status: toPascalCase(p.status) as MapMarkerData['status'],
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