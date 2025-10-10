// Fix: Created the DayworkSheetDetailScreen component to resolve "not a module" error.
import React, { useState, useEffect } from 'react';
import { Project, DayworkSheet, User, PermissionAction, PermissionSubject } from '../../types';
import * as api from '../../api';
import { ChevronLeftIcon, CalendarDaysIcon, UsersIcon, CheckCircleIcon, XMarkIcon } from '../Icons';

interface DayworkSheetDetailScreenProps {
    sheetId: string;
    project: Project;
    goBack: () => void;
    currentUser: User;
    can: (action: PermissionAction, subject: PermissionSubject) => boolean;
}

const getStatusColor = (status: DayworkSheet['status']) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Approved': return 'bg-green-100 text-green-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const DayworkSheetDetailScreen: React.FC<DayworkSheetDetailScreenProps> = ({ sheetId, project, goBack, currentUser, can }) => {
    const [sheet, setSheet] = useState<DayworkSheet | null>(null);
    const [approvedByUser, setApprovedByUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSheet = async () => {
            setIsLoading(true);
            const [fetchedSheet, allUsers] = await Promise.all([
                api.fetchDayworkSheetById(sheetId),
                api.fetchUsers() // Fetch all users to resolve the approver's name
            ]);
            
            setSheet(fetchedSheet || null);

            if (fetchedSheet?.approvedBy) {
                // Find the user object by ID or name
                const approver = allUsers.find(u => u.id === fetchedSheet.approvedBy || u.name === fetchedSheet.approvedBy);
                setApprovedByUser(approver || null);
            }

            setIsLoading(false);
        };
        loadSheet();
    }, [sheetId]);

    const handleUpdateStatus = async (status: 'Approved' | 'Rejected') => {
        if (!sheet) return;
        const updatedSheet = await api.updateDayworkSheetStatus(sheet.id, status, currentUser);
        if (updatedSheet) {
            setSheet(updatedSheet);
            if (updatedSheet.status === 'Approved') {
                setApprovedByUser(currentUser);
            }
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading T&M ticket details...</div>;
    }

    if (!sheet) {
        return <div className="text-center p-8 text-red-500">T&M ticket not found.</div>;
    }
    
    const canApprove = can('approve', 'dayworkSheet') && sheet.status === 'Pending';

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 truncate">T&M Ticket: {sheet.ticketNumber}</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>

            <main className="flex-grow space-y-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                             <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Contractor</p>
                                <p className="text-gray-800 font-semibold">{sheet.contractor}</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Description of Work</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{sheet.description}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                                <p className={`font-bold py-1 px-2 rounded inline-block text-sm mt-1 ${getStatusColor(sheet.status)}`}>
                                    {sheet.status}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><CalendarDaysIcon className="w-4 h-4"/>Date</p>
                                <p className="text-gray-800 font-semibold">{new Date(sheet.date).toLocaleDateString()}</p>
                            </div>
                             {approvedByUser && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><UsersIcon className="w-4 h-4"/>Approved By</p>
                                    <p className="text-gray-800 font-semibold">{approvedByUser.name}</p>
                                    <p className="text-xs text-gray-500">{sheet.approvedDate ? new Date(sheet.approvedDate).toLocaleDateString() : ''}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                     <h3 className="font-bold text-lg text-gray-800 mb-4">Cost Breakdown</h3>
                     <p className="text-sm text-center text-gray-500 p-4 bg-gray-50 rounded-md">
                        Cost breakdown attachments (labor, equipment, materials) would be displayed here.
                    </p>
                </div>
            </main>

            {canApprove && (
                <footer className="bg-white p-4 mt-8 border-t flex justify-end items-center gap-4">
                    <button onClick={() => handleUpdateStatus('Rejected')} className="px-6 py-3 rounded-md text-red-700 bg-red-100 hover:bg-red-200 font-bold flex items-center gap-2">
                        <XMarkIcon className="w-5 h-5" /> Reject
                    </button>
                    <button onClick={() => handleUpdateStatus('Approved')} className="px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 font-bold flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" /> Approve
                    </button>
                </footer>
            )}
        </div>
    );
};

export default DayworkSheetDetailScreen;