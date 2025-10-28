import React, { useState, useEffect } from 'react';
// Fix: Added User type import.
// Fix: Corrected import paths to include file extensions.
import { Task, Project, Screen, User } from '../../types';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
// Fix: Added .tsx extension to icon import
import { ListBulletIcon, ChevronRightIcon, AlertTriangleIcon, CheckBadgeIcon, PencilIcon, PaperClipIcon } from '../Icons';

interface ProjectTasksWidgetProps {
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
    // Fix: Added currentUser to props to be used in the API call.
    currentUser: User;
}

const isOverdue = (task: Task): boolean => {
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
        return `To: All ${role.charAt(0).toUpperCase() + role.slice(1)}s`;
    }
    return 'Unassigned';
};

const TaskStatusIcon: React.FC<{ task: Task }> = ({ task }) => {
    if (isOverdue(task)) {
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

const ProjectTasksWidget: React.FC<ProjectTasksWidgetProps> = ({ project, navigateTo, currentUser }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            if (!project?.id) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            // Fix: Pass currentUser to fetchTasksForProject.
            const projectTasks = await api.fetchTasksForProject(project.id, currentUser);
            const openTasks = projectTasks
                .filter(task => task.status !== 'Done')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            setTasks(openTasks);
            setIsLoading(false);
        };
        loadTasks();
    }, [project?.id, currentUser]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <ListBulletIcon className="w-6 h-6 mr-2 text-gray-500" />
                    Open Tasks
                </h2>
                <button onClick={() => navigateTo('tasks')} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    View All ({tasks.length}) <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
            {isLoading ? (
                <p className="text-gray-500 text-center py-4">Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No open tasks for this project.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {tasks.slice(0, 5).map(task => {
                         const overdue = isOverdue(task);
                        return (
                            <li 
                                key={task.id} 
                                onClick={() => navigateTo('task-detail', { taskId: task.id })}
                                className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${overdue ? 'bg-red-50' : ''}`}
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
                                        <p className="text-sm text-gray-500">{formatAssignee(task)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-semibold ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-500">Due Date</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    );
};

export default ProjectTasksWidget;