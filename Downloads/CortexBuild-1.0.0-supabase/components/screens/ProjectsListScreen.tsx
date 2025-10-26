

import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to include file extensions.
import { Project, User } from '../../types';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
import { MapPinIcon } from '../Icons';
import { FileUpload } from '../FileUpload';

interface ProjectsListScreenProps {
    selectProject: (projectId: string) => void;
    currentUser: User;
}

const ProjectsListScreen: React.FC<ProjectsListScreenProps> = ({ selectProject, currentUser }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFileUpload, setShowFileUpload] = useState(false);

    useEffect(() => {
        const loadProjects = async () => {
            setIsLoading(true);
            const fetchedProjects = await api.fetchAllProjects(currentUser);
            setProjects(fetchedProjects);
            setIsLoading(false);
        };
        loadProjects();
    }, [currentUser]);

    const handleFileUpload = async (files: any[]) => {
        console.log('Files uploaded:', files);
        // Here you would typically save file references to the database
        // For now, we'll just log them
    };

    return (
        <div className="w-full">
            <header className="bg-white p-4 border-b mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                        <p className="text-sm text-gray-500">Select a project to view its workspace.</p>
                    </div>
                    <button
                        onClick={() => setShowFileUpload(!showFileUpload)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showFileUpload ? 'Hide Upload' : 'Upload Files'}
                    </button>
                </div>

                {showFileUpload && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Upload Project Files</h3>
                        <FileUpload
                            onUploadComplete={handleFileUpload}
                            folder={`company-${currentUser.company_id || 'default'}/project-files`}
                            multiple={true}
                            accept="*/*"
                        />
                    </div>
                )}
            </header>

            {isLoading ? (
                <p className="text-center text-gray-500">Loading projects...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => selectProject(project.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    selectProject(project.id);
                                }
                            }}
                            role="button"
                            tabIndex={0}
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