import React, { useState, useEffect } from 'react';
import { Project, DayworkSheet, Screen, User } from '../../types';
import * as api from '../../api';
import { ChevronLeftIcon, PlusIcon, TicketIcon } from '../Icons';

interface DayworkSheetsListScreenProps {
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
    currentUser: User;
}

const getStatusColor = (status: DayworkSheet['status']) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Approved': return 'bg-green-100 text-green-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const DayworkSheetsListScreen: React.FC<DayworkSheetsListScreenProps> = ({ project, navigateTo, goBack, currentUser }) => {
    const [sheets, setSheets] = useState<DayworkSheet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSheets = async () => {
            setIsLoading(true);
            const projectSheets = await api.fetchDayworkSheetsForProject(project.id);
            setSheets(projectSheets);
            setIsLoading(false);
        };
        loadSheets();
    }, [project.id]);
    
    const canCreate = ['company_admin', 'supervisor', 'super_admin'].includes(currentUser.role);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex justify-between items-center border-b mb-8">
                <div className="flex items-center">
                    <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daywork Sheets</h1>
                        <p className="text-sm text-gray-500">{project.name}</p>
                    </div>
                </div>
                {canCreate && (
                    <button onClick={() => navigateTo('new-daywork-sheet')} className="bg-blue-600 text-white p-2.5 rounded-full shadow hover:bg-blue-700">
                        <PlusIcon className="w-6 h-6"/>
                    </button>
                )}
            </header>

            <main className="flex-grow bg-white rounded-lg shadow-md border border-gray-100">
                {isLoading ? (
                    <p className="text-center text-gray-500 p-8">Loading Daywork Sheets...</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {sheets.length === 0 ? (
                            <p className="p-4 text-sm text-center text-gray-500">No Daywork Sheets found for this project.</p>
                        ) : (
                            sheets.map(sheet => (
                                <li 
                                    key={sheet.id} 
                                    onClick={() => navigateTo('daywork-sheet-detail', { sheetId: sheet.id })}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <TicketIcon className="w-8 h-8 text-orange-500" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{sheet.ticketNumber}: {sheet.contractor}</p>
                                            <p className="text-sm text-gray-500">{new Date(sheet.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sheet.status)}`}>
                                            {sheet.status}
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

export default DayworkSheetsListScreen;