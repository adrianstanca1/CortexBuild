import React from 'react';
import { Task, Screen } from '../../types';
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
import { CalendarDaysIcon } from '../Icons';

interface UpcomingDeadlinesWidgetProps {
    tasks: Task[];
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
}

const UpcomingDeadlinesWidget: React.FC<UpcomingDeadlinesWidgetProps> = ({ tasks, onDeepLink }) => {
    const upcomingTasks = tasks
        .filter(t => t.status !== 'Done' && new Date(t.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-gray-500" /> Upcoming Deadlines
            </h2>
            {upcomingTasks.length === 0 ? (
                <p className="text-gray-500 flex-grow flex items-center justify-center">No upcoming deadlines.</p>
            ) : (
                <ul className="space-y-3">
                    {upcomingTasks.slice(0, 4).map(task => (
                        <li 
                            key={task.id}
                            onClick={() => onDeepLink(task.projectId, 'task-detail', { taskId: task.id })}
                            className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100"
                        >
                            <p className="font-semibold text-sm text-gray-800">{task.title}</p>
                            <p className="text-xs text-red-600 font-bold mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UpcomingDeadlinesWidget;