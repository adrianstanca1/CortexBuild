import React from 'react';
import { Task } from '../../types';

interface MyTasksWidgetProps {
    tasks: Task[];
    onNavigate: (screen: string, params?: any) => void;
}

const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ tasks, onNavigate }) => {
    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-100';
            case 'Medium': return 'text-yellow-600 bg-yellow-100';
            case 'Low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'To Do': return 'text-yellow-600 bg-yellow-100';
            case 'In Progress': return 'text-blue-600 bg-blue-100';
            case 'Done': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const isOverdue = (dueDate?: string) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        if (diffDays === -1) return 'Due yesterday';
        if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
        if (diffDays <= 7) return `Due in ${diffDays} days`;

        return date.toLocaleDateString();
    };

    const activeTasks = tasks.filter(task => task.status !== 'Done');
    const overdueTasks = activeTasks.filter(task => isOverdue(task.dueDate));
    const todayTasks = activeTasks.filter(task => {
        if (!task.dueDate) return false;
        const today = new Date().toDateString();
        return new Date(task.dueDate).toDateString() === today;
    });

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">My Tasks</h2>
                <button
                    onClick={() => onNavigate('my-tasks')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    View All Tasks →
                </button>
            </div>

            {/* Task Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{activeTasks.length}</div>
                    <div className="text-xs text-gray-500">Active Tasks</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{overdueTasks.length}</div>
                    <div className="text-xs text-gray-500">Overdue</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{todayTasks.length}</div>
                    <div className="text-xs text-gray-500">Due Today</div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {activeTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-lg mb-2">No active tasks</div>
                        <div className="text-sm">All caught up! 🎉</div>
                    </div>
                ) : (
                    activeTasks.slice(0, 5).map(task => (
                        <div
                            key={task.id}
                            className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                                isOverdue(task.dueDate) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                            }`}
                            onClick={() => onNavigate('task-detail', { taskId: task.id })}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                        {task.priority && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        )}
                                        {(task as any).progress !== undefined && (
                                            <span className="text-gray-600">
                                                {(task as any).progress}% complete
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right ml-4">
                                    <div className={`text-sm font-medium ${
                                        isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        {formatDate(task.dueDate)}
                                    </div>
                                    {(task as any).assignedTo && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Assigned to: {(task as any).assignedTo}
                                        </div>
                                    )}
                                    {task.assignee && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Assigned to: {task.assignee}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {(task as any).progress !== undefined && (
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(task as any).progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyTasksWidget;