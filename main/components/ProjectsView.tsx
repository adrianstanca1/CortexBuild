// full contents of components/ProjectsView.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Project, Todo, ProjectAssignment, Permission, TodoStatus, ProjectHealth } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { hasPermission } from '../services/auth';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectStatusBadge } from './ui/StatusBadge';

interface ProjectsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onSelectProject: (project: Project) => void;
}

const ProjectHealthIndicator: React.FC<{ health: ProjectHealth }> = ({ health }) => {
    const healthStyles = {
        'Good': { dot: 'bg-green-500', text: 'text-green-800', bg: 'bg-green-100' },
        'Needs Attention': { dot: 'bg-yellow-500', text: 'text-yellow-800', bg: 'bg-yellow-100' },
        'At Risk': { dot: 'bg-red-500', text: 'text-red-800', bg: 'bg-red-100' },
    };
    const style = healthStyles[health.status];

    return (
        <div className="group relative">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
                <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                {health.status}
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {health.summary}
            </div>
        </div>
    );
};

interface ProjectSummaryCardProps {
    project: Project;
    taskCount: number;
    memberCount: number;
    overdueTaskCount: number;
    upcomingMilestone: { name: string; date: Date } | null;
    health: ProjectHealth | null;
    onSelect: () => void;
}

const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ project, taskCount, memberCount, overdueTaskCount, upcomingMilestone, health, onSelect }) => {
    const progress = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;

    return (
        <Card onClick={onSelect} className="cursor-pointer hover:shadow-lg hover:border-sky-500/50 transition-all duration-300 flex flex-col p-0 overflow-hidden animate-card-enter">
            <img src={project.imageUrl} alt={project.name} className="w-full h-40 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-lg text-slate-800 flex-grow pr-2">{project.name}</h3>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <ProjectStatusBadge status={project.status} />
                        {health && <ProjectHealthIndicator health={health} />}
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">{project.location.address}</p>

                {/* Key Metrics List */}
                <div className="space-y-3 my-2">
                    <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <span className="text-slate-600">Team Members</span>
                        <span className="ml-auto font-semibold text-slate-800 bg-slate-100 rounded-full px-2.5 py-0.5">{memberCount}</span>
                    </div>
                     <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        <span className="text-slate-600">Open Tasks</span>
                        <span className="ml-auto font-semibold text-slate-800 bg-slate-100 rounded-full px-2.5 py-0.5">{taskCount}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-slate-600">Overdue Tasks</span>
                        <span className={`ml-auto font-bold text-lg ${overdueTaskCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            {overdueTaskCount}
                        </span>
                    </div>
                </div>

                {/* Upcoming Milestone */}
                <div className="mt-4 flex-grow">
                    {upcomingMilestone ? (
                        <div className="text-sm bg-slate-50 p-3 rounded-md border">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Next Milestone</p>
                            <div className="flex justify-between items-center mt-1">
                                <p className="font-semibold text-slate-700 truncate pr-2">{upcomingMilestone.name}</p>
                                <p className="text-xs text-slate-600 font-medium flex-shrink-0">{new Date(upcomingMilestone.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm bg-slate-50 p-3 rounded-md border text-center text-slate-500">
                            <p>No upcoming tasks with due dates.</p>
                        </div>
                    )}
                </div>

                {/* Budget */}
                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-1 text-xs font-medium text-slate-600">
                        <span>Budget Used</span>
                        <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${progress > 100 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                </div>
            </div>
        </Card>
    );
};


export const ProjectsView: React.FC<ProjectsViewProps> = ({ user, addToast, onSelectProject }) => {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [allTodos, setAllTodos] = useState<Todo[]>([]);
    const [allAssignments, setAllAssignments] = useState<ProjectAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState<Map<number, ProjectHealth>>(new Map());
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>('all');
    const [sortOrder, setSortOrder] = useState<'name' | 'startDate' | 'budget'>('name');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const canCreate = hasPermission(user, Permission.MANAGE_PROJECTS);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setHealthData(new Map());
        try {
            if (!user.companyId) return;

            let projectsPromise: Promise<Project[]>;
            if (hasPermission(user, Permission.VIEW_ALL_PROJECTS)) {
                projectsPromise = api.getProjectsByCompany(user.companyId);
            } else {
                projectsPromise = api.getProjectsByUser(user.id);
            }
            
            const [projects, assignments] = await Promise.all([
                projectsPromise,
                api.getProjectAssignmentsByCompany(user.companyId),
            ]);
            
            const projectIds = projects.map(p => p.id);
            const todos = projectIds.length > 0 ? await api.getTodosByProjectIds(projectIds) : [];

            setAllProjects(projects);
            setAllTodos(todos);
            setAllAssignments(assignments);

            const statsMap = new Map<number, { overdueTaskCount: number }>();
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            projects.forEach(project => {
                const projectTodos = todos.filter(t => t.projectId === project.id);
                const overdueTaskCount = projectTodos.filter(
                    t => t.dueDate && new Date(t.dueDate) < now && t.status !== TodoStatus.DONE
                ).length;
                statsMap.set(project.id, { overdueTaskCount });
            });
            
            const healthPromises = projects.map(p => 
                api.getProjectHealth(p, statsMap.get(p.id)?.overdueTaskCount || 0)
                    .then(health => ({ projectId: p.id, health }))
            );

            const healthResults = await Promise.all(healthPromises);
            const newHealthData = new Map<number, ProjectHealth>();
            healthResults.forEach(result => {
                newHealthData.set(result.projectId, result.health);
            });
            setHealthData(newHealthData);

        } catch (error) {
            addToast("Failed to load project data.", 'error');
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const projectStats = useMemo(() => {
        const statsMap = new Map<number, { taskCount: number; memberCount: number; overdueTaskCount: number; upcomingMilestone: { name: string; date: Date } | null }>();
        const now = new Date();
        now.setHours(0, 0, 0, 0); // For date-only comparison

        allProjects.forEach(project => {
            const projectTodos = allTodos.filter(t => t.projectId === project.id);
            const taskCount = projectTodos.filter(t => t.status !== TodoStatus.DONE).length;
            const memberCount = allAssignments.filter(a => a.projectId === project.id).length;
            
            const overdueTaskCount = projectTodos.filter(
                t => t.dueDate && new Date(t.dueDate) < now && t.status !== TodoStatus.DONE
            ).length;

            const upcomingTasksWithDueDates = projectTodos
                .filter(t => t.dueDate && new Date(t.dueDate) >= now && t.status !== TodoStatus.DONE)
                .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
                
            const nextMilestoneTask = upcomingTasksWithDueDates[0];
            const upcomingMilestone = nextMilestoneTask 
                ? { name: nextMilestoneTask.text, date: new Date(nextMilestoneTask.dueDate!) } 
                : null;

            statsMap.set(project.id, { taskCount, memberCount, overdueTaskCount, upcomingMilestone });
        });
        return statsMap;
    }, [allProjects, allTodos, allAssignments]);

    const filteredAndSortedProjects = useMemo(() => {
        const filtered = allProjects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        return filtered.sort((a, b) => {
            if (sortOrder === 'name') {
                return a.name.localeCompare(b.name);
            }
            if (sortOrder === 'startDate') {
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            }
            if (sortOrder === 'budget') {
                return b.budget - a.budget;
            }
            return 0;
        });
    }, [allProjects, searchTerm, statusFilter, sortOrder]);

    if (loading) {
        return <Card><p>Loading projects...</p></Card>;
    }

    return (
        <div className="space-y-6">
            {isCreateModalOpen && (
                <CreateProjectModal
                    user={user}
                    onClose={() => setIsCreateModalOpen(false)}
                    onProjectCreated={(newProject) => {
                        fetchData();
                        onSelectProject(newProject);
                    }}
                    addToast={addToast}
                />
            )}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800">Projects</h2>
                {canCreate && (
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Project
                    </Button>
                )}
            </div>
            
            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b">
                    <input
                        type="text"
                        placeholder="Search projects by name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 p-2 border rounded-md"
                    />
                     <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        {(['all', 'Active', 'On Hold', 'Completed'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${statusFilter === status ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:bg-white/50'}`}
                            >
                                {status === 'all' ? 'All' : status}
                            </button>
                        ))}
                    </div>
                    <div className="flex-grow"></div>
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value as 'name' | 'startDate' | 'budget')}
                        className="w-full md:w-auto p-2 border bg-white rounded-md"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="startDate">Sort by Start Date</option>
                        <option value="budget">Sort by Budget</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProjects.map(project => {
                        const stats = projectStats.get(project.id) || { taskCount: 0, memberCount: 0, overdueTaskCount: 0, upcomingMilestone: null };
                        const health = healthData.get(project.id) || null;
                        return (
                            <ProjectSummaryCard
                                key={project.id}
                                project={project}
                                taskCount={stats.taskCount}
                                memberCount={stats.memberCount}
                                overdueTaskCount={stats.overdueTaskCount}
                                upcomingMilestone={stats.upcomingMilestone}
                                health={health}
                                onSelect={() => onSelectProject(project)}
                            />
                        );
                    })}
                </div>
                 {filteredAndSortedProjects.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        <h3 className="text-xl font-semibold">No Projects Found</h3>
                        <p>No projects match your current filters.</p>
                    </div>
                 )}
            </Card>
        </div>
    );
};