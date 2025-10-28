import React, { useState, useEffect } from 'react';
import { Task, User, Screen } from '../../types';
import * as api from '../../api';
import { ChevronLeftIcon } from '../Icons';
import TaskList from '../shared/TaskList';

interface MyTasksScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
}

const MyTasksScreen: React.FC<MyTasksScreenProps> = ({ currentUser, navigateTo, goBack }) => {
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const tasks = await api.fetchTasksForUser(currentUser);
            setAllTasks(tasks);
            setIsLoading(false);
        };
        loadData();
    }, [currentUser]);

    const groupedTasks = allTasks.reduce((acc, task) => {
        const project = task.projectName || 'Unassigned';
        if (!acc[project]) {
            acc[project] = [];
        }
        acc[project].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <div className="flex flex-col h-full">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All My Tasks</h1>
                    <p className="text-sm text-gray-500">A complete list of your tasks across all projects.</p>
                </div>
            </header>

            <main className="flex-grow space-y-8">
                {isLoading ? (
                    <p className="p-4 text-sm text-center text-gray-500">Loading all your tasks...</p>
                ) : Object.keys(groupedTasks).length === 0 ? (
                    <p className="p-4 text-sm text-center text-gray-500">You have no tasks assigned to you. Great job!</p>
                ) : (
                    Object.entries(groupedTasks).map(([projectName, tasks]) => (
                        <div key={projectName} className="bg-white rounded-lg shadow-md border border-gray-100">
                            <div className="p-4 border-b">
                                <h2 className="font-bold text-lg text-gray-800">{projectName}</h2>
                            </div>
                            <TaskList tasks={tasks} navigateTo={navigateTo} />
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default MyTasksScreen;
