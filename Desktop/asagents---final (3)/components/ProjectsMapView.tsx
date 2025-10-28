import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Project, Permission, Todo, TodoStatus, ProjectAssignment, UserStatus } from '../types';
import { api } from '../services/apiService';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { MapView, MapMarker } from './MapView';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { socketService } from '../services/socketService';

interface ProjectsMapViewProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
}

export const ProjectsMapView: React.FC<ProjectsMapViewProps> = ({ user, addToast }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    const [statusFilters, setStatusFilters] = useState<Set<Project['status']>>(new Set(['Active', 'On Hold']));
    const [showOnSiteTeam, setShowOnSiteTeam] = useState<boolean>(true);


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
                
                const [fetchedProjects, companyUsers, companyAssignments] = await Promise.all([
                    projectsPromise,
                    api.getUsersByCompany(user.companyId),
                    api.getProjectAssignmentsByCompany(user.companyId)
                ]);
                
                setProjects(fetchedProjects);
                setTeamMembers(companyUsers);
                setAssignments(companyAssignments);
                
                if (fetchedProjects.length > 0) {
                    const projectIds = fetchedProjects.map(p => p.id);
                    const fetchedTodos = await api.getTodosByProjectIds(projectIds);
                    setTodos(fetchedTodos);
                }

            } catch (error) {
                 addToast("Failed to load project locations.", 'error');
                console.error("Map data fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Listen for real-time updates
        socketService.on<User[]>('team:locations_updated', (updatedTeam) => {
            console.log("Received real-time team update");
            setTeamMembers(updatedTeam);
        });

        return () => {
            socketService.off('team:locations_updated');
        };
    }, [user, addToast]);
    
    const projectsWithOverdueTasks = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const overdueProjectIds = new Set<number>();
        todos.forEach(todo => {
            if (todo.dueDate && new Date(todo.dueDate) < now && todo.status !== TodoStatus.DONE) {
                overdueProjectIds.add(todo.projectId);
            }
        });
        return overdueProjectIds;
    }, [todos]);
    
    const handleStatusFilterChange = (status: Project['status']) => {
        setStatusFilters(prev => {
            const newFilters = new Set(prev);
            if (newFilters.has(status)) {
                newFilters.delete(status);
            } else {
                newFilters.add(status);
            }
            return newFilters;
        });
    };

    const markers: MapMarker[] = useMemo(() => {
        const projectMarkers = projects
            .filter(p => p.location && p.location.lat && p.location.lng)
            .filter(p => statusFilters.has(p.status))
            .map(p => ({
                type: 'project' as 'project',
                lat: p.location.lat,
                lng: p.location.lng,
                radius: p.geofenceRadius,
                status: p.status,
                hasOverdueTasks: projectsWithOverdueTasks.has(p.id),
                popupContent: (
                    <div>
                        <h4 className="font-bold">{p.name}</h4>
                        <p>Status: {p.status}</p>
                    </div>
                ),
            }));

        let onSiteTeamMarkers: MapMarker[] = [];
        if (showOnSiteTeam) {
            const projectMap = new Map(projects.map(p => [p.id, p]));
            onSiteTeamMarkers = teamMembers
                .filter(member => member.status === UserStatus.ON_SITE)
                .map(member => {
                    const assignment = assignments.find(a => a.userId === member.id);
                    if (!assignment) return null;
                    
                    const project = projectMap.get(assignment.projectId) as Project | undefined;
                    if (!project || !project.location) return null;

                    return {
                        type: 'person' as 'person',
                        lat: project.location.lat,
                        lng: project.location.lng,
                        popupContent: (
                            <div>
                                <h4 className="font-bold">{member.name}</h4>
                                <p>{member.role}</p>
                            </div>
                        )
                    };
                })
                .filter((marker): marker is MapMarker => marker !== null);
        }

        return [...projectMarkers, ...onSiteTeamMarkers];
    }, [projects, projectsWithOverdueTasks, teamMembers, assignments, statusFilters, showOnSiteTeam]);
    
    if (loading) {
        return <Card><p>Loading map and project locations...</p></Card>;
    }

    return (
        <Card className="h-screen p-0 overflow-hidden -m-6 lg:-m-8 relative">
            <MapView markers={markers} height="100%" />
            <div className="absolute top-24 right-4 z-[1000] w-64">
                <Card className="p-4 space-y-3 bg-card/95 backdrop-blur-sm shadow-lg border border-border">
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-card-foreground">Project Status</h4>
                        <div className="space-y-2">
                            {(['Active', 'On Hold', 'Completed'] as const).map(status => (
                                <label key={status} className="flex items-center gap-2 text-sm cursor-pointer text-card-foreground">
                                    <input
                                        type="checkbox"
                                        checked={statusFilters.has(status)}
                                        onChange={() => handleStatusFilterChange(status)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span>{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-card-foreground">Show On-Site Team</span>
                            <ToggleSwitch
                                checked={showOnSiteTeam}
                                onChange={setShowOnSiteTeam}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </Card>
    );
};