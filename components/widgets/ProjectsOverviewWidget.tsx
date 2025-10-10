import React from 'react';
// Fix: Corrected import paths to include file extensions.
import { Project, Screen } from '../../types';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
import { ChevronRightIcon, QuestionMarkCircleIcon, AlertTriangleIcon } from '../Icons';

interface ProjectsOverviewWidgetProps {
    projects: Project[];
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
}

const ProjectsOverviewWidget: React.FC<ProjectsOverviewWidgetProps> = ({ projects, navigateTo, onDeepLink }) => {
    const totalOpenRFIs = projects.reduce((sum, p) => sum + p.snapshot.openRFIs, 0);
    const totalOverdueTasks = projects.reduce((sum, p) => sum + p.snapshot.overdueTasks, 0);

    const Stat: React.FC<{ value: number; label: string; icon: React.FC<any>; color: string }> = ({ value, label, icon: Icon, color }) => (
        <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="font-bold text-gray-800">{value}</span>
            <span className="text-sm text-gray-500">{label}</span>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">My Projects</h2>
                <button onClick={() => navigateTo('projects')} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    View All <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>

            <>
                <div className="p-4 bg-gray-50 rounded-lg border flex flex-col sm:flex-row justify-around gap-4 mb-4">
                   <Stat value={totalOpenRFIs} label="Open RFIs" icon={QuestionMarkCircleIcon} color="text-red-600" />
                   <Stat value={totalOverdueTasks} label="Overdue Tasks" icon={AlertTriangleIcon} color="text-amber-600" />
                </div>
                <ul className="space-y-1 flex-grow">
                     {projects.slice(0, 4).map(project => (
                        <li key={project.id}>
                            <button
                                onClick={() => onDeepLink(project.id, 'project-home', {})}
                                className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors hover:bg-gray-100"
                            >
                                <img src={project.image} alt={project.name} className="w-12 h-10 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-bold text-sm">{project.name}</p>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            </button>
                        </li>
                    ))}
                </ul>
            </>
        </div>
    );
};

export default ProjectsOverviewWidget;