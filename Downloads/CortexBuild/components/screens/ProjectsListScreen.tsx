

import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to include file extensions.
import { Project, User } from '../../types.ts';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api.ts';
import { MapPinIcon } from '../Icons.tsx';

interface ProjectsListScreenProps {
    selectProject: (projectId: string) => void;
    currentUser: User;
}

const ProjectsListScreen: React.FC<ProjectsListScreenProps> = ({ selectProject, currentUser }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            setIsLoading(true);
            const fetchedProjects = await api.fetchAllProjects(currentUser);
            setProjects(fetchedProjects);
            setIsLoading(false);
        };
        loadProjects();
    }, [currentUser]);

    return (
        <div className="w-full">
            <header className="bg-white p-4 border-b mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="text-sm text-gray-500">Select a project to view its workspace.</p>
            </header>

            {isLoading ? (
                <p className="text-center text-gray-500">Loading projects...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(project => (
                        <div 
                            key={project.id} 
                            onClick={() => selectProject(project.id)}
                            className="bg-white rounded-lg shadow-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                        >
                            <div className="h-48 overflow-hidden flex-shrink-0">
                                <img 
                                    src={project.image} 
                                    alt={project.name} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{project.name}</h2>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <MapPinIcon className="w-4 h-4 mr-1.5" />
                                        <span>{project.location}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-4 line-clamp-3">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t flex justify-between text-center">
                                    <div>
                                        <span className="font-bold text-red-600 block text-2xl">{project.snapshot.openRFIs}</span>
                                        <span className="text-xs text-gray-500 uppercase font-semibold">Open RFIs</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-amber-600 block text-2xl">{project.snapshot.overdueTasks}</span>
                                        <span className="text-xs text-gray-500 uppercase font-semibold">Overdue</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-orange-600 block text-2xl">{project.snapshot.pendingTMTickets}</span>
                                        <span className="text-xs text-gray-500 uppercase font-semibold">Pending T&M</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectsListScreen;