import React from 'react';
import { TodoPriority } from '../../types';

export const PriorityDisplay: React.FC<{ priority: TodoPriority }> = ({ priority }) => {
    const priorityMap = {
        [TodoPriority.HIGH]: { color: 'bg-red-500', text: 'High' },
        [TodoPriority.MEDIUM]: { color: 'bg-yellow-500', text: 'Medium' },
        [TodoPriority.LOW]: { color: 'bg-sky-500', text: 'Low' },
    };
    const { color, text } = priorityMap[priority] || priorityMap[TodoPriority.MEDIUM];
    return <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`}></span><span className="text-sm">{text}</span></div>;
};
