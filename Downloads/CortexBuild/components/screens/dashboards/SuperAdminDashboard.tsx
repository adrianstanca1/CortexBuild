import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to include file extensions.
import { User, Screen, Company, Project } from '../../../types.ts';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../../api.ts';
import GlobalStatsWidget from '../../widgets/GlobalStatsWidget.tsx';
import { BuildingOfficeIcon, UsersIcon } from '../../Icons.tsx';

interface SuperAdminDashboardProps {
    currentUser: User;
    selectProject: (projectId: string) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ currentUser, selectProject }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [fetchedCompanies, fetchedUsers, fetchedProjects] = await Promise.all([
                api.fetchCompanies(currentUser),
                api.fetchUsers(),
                api.fetchAllProjects(currentUser)
            ]);
            setCompanies(fetchedCompanies);
            setUsers(fetchedUsers);
            setProjects(fetchedProjects);
            setIsLoading(false);
        };
        loadData();
    }, [currentUser]);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
                    <p className="text-md text-gray-500">Platform-wide overview</p>
                </div>
                <img src={currentUser.avatar} alt="User Avatar" className="w-12 h-12 rounded-full" />
            </header>
            
            <GlobalStatsWidget currentUser={currentUser} />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BuildingOfficeIcon className="w-6 h-6 text-gray-500" />
                        All Companies ({companies.length})
                    </h2>
                    {isLoading ? <p>Loading...</p> : (
                        <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                            {companies.map(company => (
                                <li key={company.id} className="py-2 font-semibold">{company.name}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                     <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-gray-500" />
                        All Users ({users.length})
                    </h2>
                    {isLoading ? <p>Loading...</p> : (
                        <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                            {users.map(user => (
                                <li key={user.id} className="py-2 flex justify-between">
                                    <span>{user.name}</span>
                                    <span className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                     <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        All Projects ({projects.length})
                    </h2>
                    {isLoading ? <p>Loading...</p> : (
                        <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                            {projects.map(project => (
                                <li key={project.id} className="py-2">
                                    <button onClick={() => selectProject(project.id)} className="font-semibold w-full text-left hover:text-blue-600">{project.name}</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;