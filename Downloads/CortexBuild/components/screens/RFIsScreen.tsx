import React, { useState, useEffect, useMemo } from 'react';
import { Project, RFI, Screen, User } from '../../types';
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
import { usePermissions } from '../../hooks/usePermissions';
import { ChevronLeftIcon, PlusIcon, QuestionMarkCircleIcon, ChevronDownIcon } from '../Icons';

interface RFIsScreenProps {
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
    currentUser: User;
}

const getStatusColor = (status: RFI['status']) => {
    switch (status) {
        case 'Open': return 'bg-blue-600 text-white';
        case 'Closed': return 'bg-green-600 text-white';
        case 'Draft': return 'bg-slate-500 text-white';
        default: return 'bg-gray-500 text-white';
    }
};

const isRfiOverdue = (rfi: RFI): boolean => {
    if (rfi.status !== 'Open') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(rfi.dueDate) < today;
};


const RFIsScreen: React.FC<RFIsScreenProps> = ({ project, navigateTo, goBack, currentUser }) => {
    const [rfis, setRfis] = useState<RFI[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        status: 'all',
        assignee: 'all',
        dueDateStart: '',
        dueDateEnd: '',
    });
    const [sortBy, setSortBy] = useState('dueDate-asc');

    const { can } = usePermissions(currentUser);
    const canCreate = can('create', 'rfi');
    const possibleAssignees = ['Architect Team', 'Structural Engineer', 'MEP Consultant', 'General Contractor'];


    useEffect(() => {
        const loadRFIs = async () => {
            setIsLoading(true);
            const projectRFIs = await api.fetchRFIsForProject(project.id);
            setRfis(projectRFIs);
            setIsLoading(false);
        };
        loadRFIs();
    }, [project.id]);

    const displayedRfis = useMemo(() => {
        let filteredRfis = [...rfis];

        // Apply status filter
        if (filters.status !== 'all') {
            filteredRfis = filteredRfis.filter(r => r.status === filters.status);
        }

        // Apply assignee filter
        if (filters.assignee !== 'all') {
            filteredRfis = filteredRfis.filter(r => r.assignee === filters.assignee);
        }
        
        // Apply date range filter
        if (filters.dueDateStart) {
            const startDate = new Date(filters.dueDateStart);
            startDate.setHours(0,0,0,0);
            filteredRfis = filteredRfis.filter(r => new Date(r.dueDate) >= startDate);
        }
        
        if (filters.dueDateEnd) {
            const endDate = new Date(filters.dueDateEnd);
            endDate.setHours(23,59,59,999);
            filteredRfis = filteredRfis.filter(r => new Date(r.dueDate) <= endDate);
        }

        const selectedSort = sortBy;
        filteredRfis.sort((a, b) => {
            if (selectedSort === 'dueDate-desc') {
                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
            }

            if (selectedSort === 'status') {
                const statusOrder: Record<RFI['status'], number> = {
                    Open: 1,
                    Draft: 2,
                    Closed: 3,
                };
                const aRank = statusOrder[a.status] ?? 99;
                const bRank = statusOrder[b.status] ?? 99;
                return aRank - bRank;
            }

            const aIsClosed = a.status === 'Closed';
            const bIsClosed = b.status === 'Closed';
            if (filters.status !== 'Closed') {
                if (aIsClosed && !bIsClosed) return 1;
                if (!aIsClosed && bIsClosed) return -1;
            }
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        return filteredRfis;
    }, [rfis, filters, sortBy]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            status: 'all',
            assignee: 'all',
            dueDateStart: '',
            dueDateEnd: '',
        });
        setSortBy('dueDate-asc');
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex justify-between items-center border-b mb-8">
                <div className="flex items-center">
                    <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">RFIs</h1>
                        <p className="text-sm text-gray-500">{project.name}</p>
                    </div>
                </div>
                 {canCreate &&
                    <button onClick={() => navigateTo('new-rfi')} className="bg-blue-600 text-white p-2.5 rounded-full shadow hover:bg-blue-700">
                        <PlusIcon className="w-6 h-6"/>
                    </button>
                }
            </header>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center">
                    <button onClick={() => setShowFilters(s => !s)} className="flex items-center gap-2 font-bold text-gray-700">
                        Filters
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="flex items-center gap-2">
                        <label htmlFor="sortBy" className="text-sm font-medium text-gray-600">Sort by:</label>
                        <select
                            id="sortBy"
                            name="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md text-sm bg-white"
                        >
                            <option value="dueDate-asc">Due Date (Soonest)</option>
                            <option value="dueDate-desc">Due Date (Latest)</option>
                            <option value="status">Status</option>
                        </select>
                    </div>
                </div>
                 {showFilters && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                    <option value="all">All Statuses</option>
                                    <option value="Open">Open</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee</label>
                                <select id="assignee" name="assignee" value={filters.assignee} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                    <option value="all">All Assignees</option>
                                    {possibleAssignees.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                            <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="dueDateStart" className="block text-sm font-medium text-gray-700">Due From</label>
                                    <input type="date" id="dueDateStart" name="dueDateStart" value={filters.dueDateStart} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                                </div>
                                <div>
                                    <label htmlFor="dueDateEnd" className="block text-sm font-medium text-gray-700">Due To</label>
                                    <input type="date" id="dueDateEnd" name="dueDateEnd" value={filters.dueDateEnd} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"/>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-right">
                            <button onClick={resetFilters} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 text-sm">Reset Filters</button>
                        </div>
                    </div>
                )}
            </div>

            <main className="flex-grow bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <p className="text-center text-gray-500 p-8">Loading RFIs...</p>
                ) : (
                    <>
                         <div className="p-2 bg-gray-50 border-b text-sm text-gray-600 font-semibold">
                            Showing {displayedRfis.length} of {rfis.length} RFIs.
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {displayedRfis.length === 0 ? (
                                <p className="p-4 text-sm text-center text-gray-500">No RFIs match the current filters.</p>
                            ) : (
                                displayedRfis.map(rfi => {
                                    const overdue = isRfiOverdue(rfi);
                                    const statusColorClass = overdue ? 'bg-red-600 text-white' : getStatusColor(rfi.status);
                                    return (
                                        <li 
                                            key={rfi.id} 
                                            onClick={() => navigateTo('rfi-detail', { rfiId: rfi.id })}
                                            className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-l-4 ${overdue ? 'bg-red-100 border-red-500' : 'border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <QuestionMarkCircleIcon className={`w-8 h-8 ${overdue ? 'text-red-500' : 'text-blue-500'}`} />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{rfi.subject}</p>
                                                    <p className="text-sm text-gray-500">To: {rfi.assignee}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColorClass}`}>
                                                    {rfi.status}
                                                </span>
                                                <p className={`text-xs mt-1 ${overdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>Due: {new Date(rfi.dueDate).toLocaleDateString()}</p>
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </>
                )}
            </main>
        </div>
    );
};

export default RFIsScreen;