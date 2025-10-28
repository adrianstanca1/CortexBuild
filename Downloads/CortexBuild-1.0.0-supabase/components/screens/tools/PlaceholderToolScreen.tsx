import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeftIcon, ClockIcon } from '../../Icons';
import { Screen, User, Task, TimeEntry, Project } from '../../../types';
import * as api from '../../../api';

// --- Live Time Entry UI ---

const TimeDuration: React.FC<{ startTime: string }> = ({ startTime }) => {
    const [duration, setDuration] = useState('');

    useEffect(() => {
        const calculateDuration = () => {
            const start = new Date(startTime).getTime();
            const now = Date.now();
            const diff = Math.max(0, now - start);

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setDuration(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        };

        calculateDuration();
        const intervalId = setInterval(calculateDuration, 1000);

        return () => clearInterval(intervalId);
    }, [startTime]);

    return <span className="font-mono font-semibold">{duration}</span>;
};

const LiveTimeEntryUI: React.FC<Omit<PlaceholderToolScreenProps, 'title'>> = ({ currentUser, navigateTo, goBack }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [userTasks, userProjects, userTimeEntries] = await Promise.all([
                api.fetchTasksForUser(currentUser),
                api.fetchAllProjects(currentUser),
                api.fetchTimeEntriesForUser(currentUser.id)
            ]);
            setTasks(userTasks.filter(t => t.status !== 'Done'));
            setProjects(userProjects);
            setTimeEntries(userTimeEntries);
            setIsLoading(false);
        };
        loadData();
    }, [currentUser]);

    const activeEntry = useMemo(() => timeEntries.find(entry => entry.endTime === null), [timeEntries]);

    const tasksByProject = useMemo(() => {
        const grouped: { [key: string]: Task[] } = {};
        tasks.forEach(task => {
            if (!grouped[task.projectId]) {
                grouped[task.projectId] = [];
            }
            grouped[task.projectId].push(task);
        });
        return grouped;
    }, [tasks]);

    const handleClockIn = async (task: Task) => {
        if (activeEntry) {
            alert('You are already clocked in on another task. Please clock out first.');
            return;
        }
        try {
            const newEntry = await api.startTimeEntry(task.id, task.projectId, currentUser.id);
            setTimeEntries(prev => [...prev, newEntry]);
        } catch (error) {
            console.error(error);
            alert('Failed to clock in.');
        }
    };
    
    const handleClockOut = async () => {
        if (!activeEntry) return;
        try {
            const updatedEntry = await api.stopTimeEntry(activeEntry.id);
            setTimeEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
        } catch (error) {
            console.error(error);
            alert('Failed to clock out.');
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Time Entry</h1>
                    <p className="text-sm text-gray-500">Clock in and out of your tasks.</p>
                </div>
            </header>
            <main className="space-y-8">
                {isLoading ? (
                    <p className="text-center text-gray-500">Loading your tasks...</p>
                ) : (
                    Object.keys(tasksByProject).map(projectId => {
                        const project = projects.find(p => p.id === projectId);
                        return (
                            <div key={projectId} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                                <h2 className="p-4 border-b font-bold text-lg text-gray-800 bg-gray-50">{project?.name || 'Unknown Project'}</h2>
                                <ul className="divide-y divide-gray-200">
                                    {tasksByProject[projectId].map(task => {
                                        const isActiveOnThisTask = activeEntry?.taskId === task.id;
                                        return (
                                            <li key={task.id} className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${isActiveOnThisTask ? 'bg-green-50 border-l-4 border-green-500' : 'border-l-4 border-transparent'}`}>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-900">{task.title}</p>
                                                    <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                                </div>
                                                {isActiveOnThisTask ? (
                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                        <div className="text-green-800 flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 p-2 bg-green-100 border border-green-300 rounded-md">
                                                            <ClockIcon className="w-5 h-5" />
                                                            <TimeDuration startTime={activeEntry!.startTime} />
                                                        </div>
                                                        <button 
                                                            onClick={handleClockOut}
                                                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors"
                                                        >
                                                            Clock Out
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleClockIn(task)}
                                                        disabled={!!activeEntry}
                                                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                                                    >
                                                        Clock In
                                                    </button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })
                )}
                 {Object.keys(tasksByProject).length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 p-8 bg-white rounded-lg shadow-md border">You have no open tasks assigned to you.</div>
                 )}
            </main>
        </div>
    );
};

// --- Generic Placeholder UI ---
const GenericPlaceholderUI: React.FC<Pick<PlaceholderToolScreenProps, 'goBack' | 'title'>> = ({ goBack, title = "Tool" }) => {
    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500">Feature Coming Soon</p>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center bg-white rounded-lg shadow-md border border-gray-100">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Under Construction</h2>
                    <p className="mt-2 text-gray-500">This feature is currently in development and will be available soon.</p>
                </div>
            </main>
        </div>
    );
};

// --- Main Component (Router) ---
interface PlaceholderToolScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
    title?: string;
}

const PlaceholderToolScreen: React.FC<PlaceholderToolScreenProps> = (props) => {
    const { title } = props;

    // Conditionally render the correct tool based on the title passed in navigation
    if (title === 'Live Time Entry') {
        return <LiveTimeEntryUI {...props} />;
    }

    // Default to the generic placeholder for all other tools
    return <GenericPlaceholderUI goBack={props.goBack} title={props.title} />;
};

export default PlaceholderToolScreen;
