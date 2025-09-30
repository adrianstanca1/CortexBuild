
import React from 'react';
// FIX: Corrected import path to be relative.
import { Todo, User, TodoStatus, Permission } from '../types';
import { PriorityDisplay } from './ui/PriorityDisplay';
import { hasPermission } from '../services/auth';
import { Avatar } from './ui/Avatar';

interface TaskCardProps {
    todo: Todo;
    onClick: () => void;
    assignee?: User;
    user: User;
}

export const TaskCard: React.FC<TaskCardProps> = ({ todo, onClick, assignee, user }) => {
    const subtaskCount = todo.subTasks?.length || 0;
    const completedSubtasks = todo.subTasks?.filter(st => st.isCompleted).length || 0;
    
    const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== TodoStatus.DONE;
    const canManage = hasPermission(user, Permission.MANAGE_TASKS);

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all ${
                isOverdue ? 'border-red-400' : 'border-gray-200/80'
            }`}
        >
             {canManage && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onClick(); }} 
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-800 transition-opacity"
                    aria-label="Edit task"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                    </svg>
                </button>
            )}
            <p className="font-semibold text-slate-800 mb-3 pr-6">{todo.text}</p>
            
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                 <PriorityDisplay priority={todo.priority} />
                 {subtaskCount > 0 && (
                    <div className="flex items-center gap-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>{completedSubtasks}/{subtaskCount}</span>
                    </div>
                )}
                 {(todo.comments?.length || 0) > 0 && (
                    <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>{todo.comments?.length}</span>
                    </div>
                )}
            </div>
            
            <div className="flex justify-between items-center border-t pt-3 mt-3">
                <div className="flex items-center gap-2">
                    {isOverdue ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-red-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Overdue
                        </div>
                    ) : (
                        todo.dueDate && <span className="text-xs text-slate-500">{new Date(todo.dueDate).toLocaleDateString()}</span>
                    )}
                </div>
                {assignee && <Avatar name={assignee.name} imageUrl={assignee.avatarUrl} className="w-6 h-6 text-xs" />}
            </div>
        </div>
    );
};
