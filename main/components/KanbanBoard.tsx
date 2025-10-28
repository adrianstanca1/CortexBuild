import React from 'react';
// FIX: Corrected import path to be relative.
import { Todo, TodoStatus, User } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
    todos: Todo[];
    onUpdateTodo: (taskId: number | string, updates: Partial<Todo>) => void;
    personnel: User[];
    user: User;
}

const KanbanColumn: React.FC<{
    title: string;
    todos: Todo[];
    onUpdateTodo: (taskId: number | string, updates: Partial<Todo>) => void;
    personnel: User[];
    user: User;
}> = ({ title, todos, onUpdateTodo, personnel, user }) => {
    return (
        <div className="w-80 bg-slate-100 rounded-lg p-3 flex-shrink-0">
            <h3 className="font-semibold text-slate-700 mb-4 px-1">{title} ({todos.length})</h3>
            <div className="space-y-3 overflow-y-auto h-full">
                {todos.map(todo => {
                    const assignee = personnel.find(p => p.id === todo.assigneeId);
                    return (
                        <TaskCard 
                            key={todo.id} 
                            todo={todo} 
                            onClick={() => console.log("view task", todo.id)} 
                            assignee={assignee}
                            user={user}
                        />
                    );
                })}
            </div>
        </div>
    );
};


export const KanbanBoard: React.FC<KanbanBoardProps> = ({ todos, onUpdateTodo, personnel, user }) => {

    const columns: { title: string, status: TodoStatus }[] = [
        { title: 'To Do', status: TodoStatus.TODO },
        { title: 'In Progress', status: TodoStatus.IN_PROGRESS },
        { title: 'Done', status: TodoStatus.DONE },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <KanbanColumn
                    key={col.status}
                    title={col.title}
                    todos={todos.filter(t => t.status === col.status)}
                    onUpdateTodo={onUpdateTodo}
                    personnel={personnel}
                    user={user}
                />
            ))}
        </div>
    );
};