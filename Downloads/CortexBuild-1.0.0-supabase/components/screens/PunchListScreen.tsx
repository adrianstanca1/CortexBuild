

import React, { useState, useEffect } from 'react';
import { Project, PunchListItem, Screen, User } from '../../types';
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
import { ChevronLeftIcon, PlusIcon, CheckBadgeIcon } from '../Icons';

interface PunchListScreenProps {
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
    currentUser: User;
}

const getStatusColor = (status: PunchListItem['status']) => {
    switch (status) {
        case 'Open': return 'bg-red-100 text-red-800';
        case 'Ready for Review': return 'bg-yellow-100 text-yellow-800';
        case 'Closed': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const PunchListScreen: React.FC<PunchListScreenProps> = ({ project, navigateTo, goBack, currentUser }) => {
    const [items, setItems] = useState<PunchListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const canCreate = ['company_admin', 'supervisor', 'super_admin'].includes(currentUser.role);

    useEffect(() => {
        const loadItems = async () => {
            setIsLoading(true);
            const projectItems = await api.fetchPunchListItemsForProject(project.id);
            setItems(projectItems);
            setIsLoading(false);
        };
        loadItems();
    }, [project.id]);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex justify-between items-center border-b mb-8">
                <div className="flex items-center">
                    <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Punch List</h1>
                        <p className="text-sm text-gray-500">{project.name}</p>
                    </div>
                </div>
                 {canCreate &&
                    <button onClick={() => navigateTo('new-punch-list-item')} className="bg-blue-600 text-white p-2.5 rounded-full shadow hover:bg-blue-700">
                        <PlusIcon className="w-6 h-6"/>
                    </button>
                }
            </header>

            <main className="flex-grow bg-white rounded-lg shadow-md border border-gray-100">
                {isLoading ? (
                    <p className="text-center text-gray-500 p-8">Loading punch list items...</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <p className="p-4 text-sm text-center text-gray-500">No punch list items found.</p>
                        ) : (
                            items.map(item => (
                                <li 
                                    key={item.id} 
                                    onClick={() => navigateTo('punch-list-item-detail', { itemId: item.id })}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <CheckBadgeIcon className="w-8 h-8 text-blue-500" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{item.title}</p>
                                            <p className="text-sm text-gray-500">{item.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </main>
        </div>
    );
};

export default PunchListScreen;