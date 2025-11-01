

import React, { useState, useEffect } from 'react';
import { Project, User } from '../../types';
import { XMarkIcon, MapPinIcon } from '../Icons';
import { mockApi } from '../../api/mockApi';

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
            try {
                // Mock projects for demonstration
                const mockProjects: Project[] = [
                    {
                        id: '1',
                        name: 'Office Building Construction',
                        description: 'Modern office complex with 15 floors',
                        status: 'active',
                        startDate: '2024-01-15',
                        endDate: '2024-12-15',
                        budget: 2500000,
                        location: 'London, UK'
                    } as Project,
                    {
                        id: '2',
                        name: 'Residential Complex',
                        description: 'Luxury residential development with 50 units',
                        status: 'active',
                        startDate: '2024-03-01',
                        endDate: '2025-06-30',
                        budget: 1800000,
                        location: 'Manchester, UK'
                    } as Project,
                    {
                        id: '3',
                        name: 'Shopping Center Renovation',
                        description: 'Complete renovation of existing shopping center',
                        status: 'planning',
                        startDate: '2024-06-01',
                        endDate: '2024-11-30',
                        budget: 950000,
                        location: 'Birmingham, UK'
                    } as Project
                ];
                setProjects(mockProjects);
            } catch (error) {
                console.error('Failed to load projects:', error);
                setProjects([]);
            }
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