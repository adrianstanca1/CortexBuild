import React, { useState, useEffect, useMemo } from 'react';
import { Project, Task, Screen, User } from '../../types';
import * as api from '../../api';
import { usePermissions } from '../../hooks/usePermissions';
import { ChevronLeftIcon, PlusIcon, PaperClipIcon, AlertTriangleIcon, CheckBadgeIcon, PencilIcon, ListBulletIcon, ChevronDownIcon } from '../Icons';

interface TasksScreenProps {
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
    currentUser: User;
}

const isTaskOverdue = (task: Task): boolean => {
    if (task.status === 'Done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
};

const formatAssignee = (task: Task): string => {
    if (task.assignee) {
        return `To: ${task.assignee}`;
    }
    if (task.targetRoles && task.targetRoles.length > 0) {
        const role = task.targetRoles[0];
        return `To: All ${role}`;
    }
    return 'Unassigned';
};

const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
        case 'High': return 'bg-red-100 text-red-800';
        case 'Medium': return 'bg-yellow-100 text-yellow-800';
        case 'Low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const TaskStatusIcon: React.FC<{ task: Task }> = ({ task }) => {
    if (isTaskOverdue(task)) {
        return <AlertTriangleIcon className="w-6 h-6 text-red-500" title="Overdue" />;
    }
    switch (task.status) {
        case 'Done':
            return <CheckBadgeIcon className="w-6 h-6 text-green-500" title="Done" />;
        case 'In Progress':
            return <PencilIcon className="w-6 h-6 text-blue-500" title="In Progress" />;
        case 'To Do':
            return <ListBulletIcon className="w-6 h-6 text-gray-400" title="To Do" />;
        default:
            return <div className="w-6 h-6"></div>;
    }
};

const TasksScreen: React.FC<TasksScreenProps> = ({ project, navigateTo, goBack, currentUser }) => {
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        status: 'open',
        assignee: 'all',
        dueDateStart: '',
        dueDateEnd: '',
    });
    const [sortBy, setSortBy] = useState('dueDate-asc');

    const { can } = usePermissions(currentUser);
    const canCreate = can('create', 'task');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [projectTasks, companyUsers] = await Promise.all([
                api.fetchTasksForProject(project.id, currentUser),
                api.fetchUsersByCompany(project.companyId)
            ]);
            setAllTasks(projectTasks);
            setUsers(companyUsers);
            setIsLoading(false);
        };
        loadData();
    }, [project.id, currentUser]);
    
    const displayedTasks = useMemo(() => {
        let filteredTasks = [...allTasks];

        // Apply status filter
        if (filters.status !== 'all') {
            if (filters.status === 'open') {
                filteredTasks = filteredTasks.filter(t => t.status !== 'Done');
            } else {
                filteredTasks = filteredTasks.filter(t => t.status === filters.status);
            }
        }

        // Apply assignee filter
        if (filters.assignee !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.assignee === filters.assignee);
        }
        
        // Apply date range filter
        if (filters.dueDateStart) {
            const startDate = new Date(filters.dueDateStart);
            startDate.setHours(0,0,0,0);
            filteredTasks = filteredTasks.filter(t => new Date(t.dueDate) >= startDate);
        }
        
        if (filters.dueDateEnd) {
            const endDate = new Date(filters.dueDateEnd);
            endDate.setHours(23,59,59,999);
            filteredTasks = filteredTasks.filter(t => new Date(t.dueDate) <= endDate);
        }

        const selectedSort = sortBy;
        filteredTasks.sort((a, b) => {
            if (selectedSort === 'dueDate-desc') {
                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
            }

            if (selectedSort === 'status') {
                const statusOrder: Record<Task['status'], number> = {
                    'To Do': 1,
                    'In Progress': 2,
                    Done: 3,
                };
                const aRank = statusOrder[a.status] ?? 99;
                const bRank = statusOrder[b.status] ?? 99;
                return aRank - bRank;
            }

            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        return filteredTasks;
    }, [allTasks, filters, sortBy]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            status: 'open',
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
                        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
                        <p className="text-sm text-gray-500">{project.name}</p>
                    </div>
                </div>
                { canCreate &&
                    <button onClick={() => navigateTo('new-task')} className="bg-blue-600 text-white p-2.5 rounded-full shadow hover:bg-blue-700">
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
                                    <option value="open">Open</option>
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee</label>
                                <select id="assignee" name="assignee" value={filters.assignee} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                    <option value="all">All Assignees</option>
                                    {users.map(user => <option key={user.id} value={user.name}>{user.name}</option>)}
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
                    <p className="text-center text-gray-500 p-8">Loading tasks...</p>
                ) : (
                    <>
                        <div className="p-2 bg-gray-50 border-b text-sm text-gray-600 font-semibold">
                            Showing {displayedTasks.length} of {allTasks.length} tasks.
                        </div>
                        <ul className="divide-y divide-gray-200">
                             {displayedTasks.length === 0 ? (
                                <p className="p-4 text-sm text-center text-gray-500">No tasks match the current filters.</p>
                            ) : (
                                displayedTasks.map(task => {
                                    const overdue = isTaskOverdue(task);
                                    return (
                                        <li 
                                            key={task.id} 
                                            onClick={() => navigateTo('task-detail', { taskId: task.id })}
                                            className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-l-4 ${overdue ? 'bg-red-100 border-red-500' : 'border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <TaskStatusIcon task={task} />
                                                <div>
                                                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                        {task.title}
                                                        {task.attachments && task.attachments.length > 0 && (
                                                            <PaperClipIcon className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-sm mt-1">
                                                        <p className="text-gray-500">{formatAssignee(task)}</p>
                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-semibold ${overdue ? 'text-red-600' : 'text-gray-600'}`}>{new Date(task.dueDate).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-500">Due Date</p>
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

// Fix: Added missing default export.
export default TasksScreen;