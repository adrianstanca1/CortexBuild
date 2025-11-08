import React from 'react';
import { Project } from '../../types';

interface ProjectsOverviewWidgetProps {
    projects: Project[];
    onNavigate: (screen: string, params?: any) => void;
    hasPermission?: (action: string, subject: string) => boolean;
}

const ProjectsOverviewWidget: React.FC<ProjectsOverviewWidgetProps> = ({
    projects,
    onNavigate,
    hasPermission = () => true
}) => {
    const totalOpenRFIs = projects.reduce((sum, p) => sum + p.snapshot.openRFIs, 0);
    const totalOverdueTasks = projects.reduce((sum, p) => sum + p.snapshot.overdueTasks, 0);
    const totalPendingTMTickets = projects.reduce((sum, p) => sum + p.snapshot.pendingTMTickets, 0);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Completed': return 'text-green-600 bg-green-100';
            case 'In Progress': return 'text-blue-600 bg-blue-100';
            case 'Planning': return 'text-yellow-600 bg-yellow-100';
            case 'On Hold': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'Low': return 'text-green-600';
            case 'Medium': return 'text-yellow-600';
            case 'High': return 'text-red-600';
            case 'Critical': return 'text-red-700';
            default: return 'text-gray-600';
        }
    };

    const formatBudget = (amount?: number) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Recent Projects</h2>
                {hasPermission('read', 'project') && (
                    <button
                        onClick={() => onNavigate('projects')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        View All Projects →
                    </button>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{totalOpenRFIs}</div>
                    <div className="text-xs text-gray-500">Open RFIs</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-amber-600">{totalOverdueTasks}</div>
                    <div className="text-xs text-gray-500">Overdue Tasks</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{totalPendingTMTickets}</div>
                    <div className="text-xs text-gray-500">TM Tickets</div>
                </div>
            </div>

            {/* Projects List */}
            <div className="space-y-3">
                {projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-lg mb-2">No projects found</div>
                        <div className="text-sm">Create your first project to get started</div>
                        {hasPermission('create', 'project') && (
                            <button
                                onClick={() => onNavigate('projects', { action: 'create' })}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Create Project
                            </button>
                        )}
                    </div>
                ) : (
                    projects.slice(0, 5).map(project => (
                        <div
                            key={project.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => onNavigate('project-home', { projectId: project.id })}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <img
                                            src={project.image || '/placeholder-project.jpg'}
                                            alt={project.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder-project.jpg';
                                            }}
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                            <p className="text-sm text-gray-500">{project.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                            {project.status || 'Unknown'}
                                        </span>
                                        <span className={`font-medium ${getRiskColor(project.snapshot.aiRiskLevel)}`}>
                                            {project.snapshot.aiRiskLevel} Risk
                                        </span>
                                        {project.budget && (
                                            <span className="text-gray-600">
                                                {formatBudget(project.spent)} / {formatBudget(project.budget)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm text-gray-500">
                                        {project.endDate && (
                                            <div>Due: {new Date(project.endDate).toLocaleDateString()}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectsOverviewWidget;