import React, { useState, useEffect } from 'react';
import { Task, Screen, User, Project } from '../../types';
import * as api from '../../api';
import { CalendarDaysIcon } from '../Icons';

interface MyProjectDeadlinesWidgetProps {
    currentUser: User;
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
}

const MyProjectDeadlinesWidget: React.FC<MyProjectDeadlinesWidgetProps> = ({ currentUser, project, navigateTo }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            if (!project?.id) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const projectTasks = await api.fetchTasksForProject(project.id, currentUser);
            
            const userTasks = projectTasks.filter(task => 
                task.assignee === currentUser.name || 
                (task.targetRoles && task.targetRoles.includes(currentUser.role))
            );

            const upcoming = userTasks
                .filter(t => t.status !== 'Done' && new Date(t.dueDate) >= new Date())
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                
            setTasks(upcoming);
            setIsLoading(false);
        };
        loadTasks();
    }, [currentUser, project?.id]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-gray-500" /> My Upcoming Deadlines
            </h2>
            {isLoading ? (
                <p className="text-gray-500 text-center py-4">Loading deadlines...</p>
            ) : tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming deadlines for you on this project.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {tasks.slice(0, 5).map(task => (
                        <li 
                            key={task.id}
                            onClick={() => navigateTo('task-detail', { taskId: task.id })}
                            className="py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer -mx-3 px-3 rounded-lg"
                        >
                            <div>
                                <p className="font-semibold text-sm text-gray-800">{task.title}</p>
                                <p className="text-xs text-gray-500 mt-1">Status: <span className="font-medium">{task.status}</span></p>
                            </div>
                             <div className="text-right">
                                <p className="text-sm font-semibold text-red-600">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">Due Date</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyProjectDeadlinesWidget;