import React from 'react';
// FIX: Replaced Todo with Task
import { Task, User, TodoStatus, TodoPriority } from '../types'; // Use Todo enums for values
import { Avatar } from './ui/Avatar';
import { PriorityDisplay } from './ui/PriorityDisplay';

interface TaskCardProps {
    task: Task; // Rename prop from todo to task
    allTasks: Task[]; // Rename prop from allTodos to allTasks
    user: User;
    personnel: User[];
    isSelected: boolean;
    onSelectionChange: (id: string | number) => void;
    onDragStart?: () => void;
}

// Update usages of props and enums
export const TaskCard: React.FC<TaskCardProps> = ({ task, allTasks, user, personnel, isSelected, onSelectionChange, onDragStart }) => {
    // FIX: Corrected assignee lookup property
    const assignee = React.useMemo(() => personnel.find(p => p.id === task.assigneeId), [personnel, task]);

    const isBlocked = React.useMemo(() => {
        const dependsOn = task.dependsOn;
        if (!dependsOn || dependsOn.length === 0) return false;
        return dependsOn.some((depId: any) => {
            const dependency = allTasks.find(t => t.id == depId); // Use loose equality for mixed types
            return dependency && dependency.status !== TodoStatus.DONE;
        });
    }, [task, allTasks]);

    const blockerTasks = React.useMemo(() => {
        const dependsOn = task.dependsOn;
        if (!isBlocked || !dependsOn) return '';
        return dependsOn
            .map((depId: any) => allTasks.find(t => t.id == depId)) // Use loose equality
            .filter((t): t is Task => !!t && t.status !== TodoStatus.DONE)
            .map((t: any) => `#${t.id.toString().substring(0, 5)} - ${t.text || t.title}`)
            .join('\n');
    }, [isBlocked, task, allTasks]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!isBlocked) {
                onSelectionChange(task.id);
            }
        }
    };

    const text = task.text || task.title;

    return (
        <div
            draggable={!isBlocked}
            onDragStart={!isBlocked ? onDragStart : undefined}
            onClick={!isBlocked ? () => onSelectionChange(task.id) : undefined}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-pressed={isSelected}
            aria-disabled={isBlocked}
            className={`p-3 rounded-md border-l-4 shadow-sm transition-all ${isBlocked
                ? 'bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed opacity-70'
                // FIX: Use enum for priority comparison
                : `bg-white dark:bg-slate-900 cursor-pointer ${isSelected ? 'ring-2 ring-sky-500' : 'hover:shadow-md'}`
                }`}
            style={{ borderColor: task.priority === TodoPriority.HIGH ? '#ef4444' : task.priority === TodoPriority.MEDIUM ? '#f59e0b' : '#3b82f6' }}
        >
            <div className="flex justify-between items-start">
                <p className="font-medium text-sm text-slate-800 dark:text-slate-100 pr-2">{text}</p>
                <div className="flex items-center flex-shrink-0">
                    {isBlocked && (
                        <div className="mr-2 text-slate-400 dark:text-slate-500" title={`Blocked by:\n${blockerTasks}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={!isBlocked ? () => onSelectionChange(task.id) : undefined}
                        disabled={isBlocked}
                        className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                </div>
            </div>
            <div className="flex justify-between items-center mt-3">
                <PriorityDisplay priority={task.priority} />
                {assignee && <Avatar name={`${assignee.firstName} ${assignee.lastName}`} imageUrl={assignee.avatar} className="w-6 h-6 text-xs" />}
            </div>
            <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-500">Progress</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{task.progress ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700">
                    <div
                        className="bg-sky-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress ?? 0}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};