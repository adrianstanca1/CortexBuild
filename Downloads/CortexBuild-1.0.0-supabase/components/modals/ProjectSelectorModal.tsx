

import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to include file extensions.
import { Project, User } from '../../types';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
import { XMarkIcon, MapPinIcon } from '../Icons';

interface ProjectSelectorModalProps {
    onSelectProject: (projectId: string) => void;
    onClose: () => void;
    title: string;
    currentUser: User;
}

const ProjectSelectorModal: React.FC<ProjectSelectorModalProps> = ({ onSelectProject, onClose, title, currentUser }) => {
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

    const handleSelect = (projectId: string) => {
        onSelectProject(projectId);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </header>
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <p className="text-center text-gray-500 py-8">Loading projects...</p>
                    ) : (
                        <ul className="space-y-2">
                            {projects.map(project => (
                                <li key={project.id}>
                                    <button
                                        onClick={() => handleSelect(project.id)}
                                        className="w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors hover:bg-gray-100"
                                    >
                                        <img src={project.image} alt={project.name} className="w-16 h-12 object-cover rounded-md flex-shrink-0" />
                                        <div className="flex-grow">
                                            <p className="font-bold">{project.name}</p>
                                            <p className="text-sm flex items-center text-gray-500">
                                                <MapPinIcon className="w-4 h-4 mr-1.5" />
                                                {project.location}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectSelectorModal;