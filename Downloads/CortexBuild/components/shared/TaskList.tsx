import React from 'react';
import { Task, Screen } from '../../types';
import { CheckBadgeIcon, AlertTriangleIcon, ListBulletIcon, PaperClipIcon, PencilIcon } from '../Icons';

interface TaskListProps {
    tasks: Task[];
    navigateTo: (screen: Screen, params?: any) => void;
}

const isTaskOverdue = (task: Task): boolean => {
    if (task.status === 'Done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
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

const TaskList: React.FC<TaskListProps> = ({ tasks, navigateTo }) => {
    if (tasks.length === 0) {
        return <p className="p-4 text-sm text-center text-gray-500">No tasks to display.</p>;
    }

    return (
        <ul className="divide-y divide-gray-200">
            {tasks.map(task => {
                const overdue = isTaskOverdue(task);
                return (
                    <li 
                        key={task.id} 
                        onClick={() => navigateTo('task-detail', { taskId: task.id, projectId: task.projectId })}
                        className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${overdue ? 'bg-red-50' : ''}`}
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
                                <p className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </li>
                );
            })}
        </ul>
    );
};

export default TaskList;
