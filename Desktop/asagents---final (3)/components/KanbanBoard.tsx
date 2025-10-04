import React from 'react';
import { Todo, TodoStatus, User } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
    todos: Todo[];
    allTodos: Todo[];
    onUpdateTodo: (taskId: number | string, updates: Partial<Todo>) => void;
    personnel: User[];
    user: User;
}

const KanbanColumn: React.FC<{
    title: string;
    todos: Todo[];
    allTodos: Todo[];
    personnel: User[];
    user: User;
    onTaskClick: (task: Todo) => void;
}> = ({ title, todos, allTodos, personnel, user, onTaskClick }) => {
    return (
        <div className="w-80 bg-muted rounded-lg p-3 flex flex-col flex-shrink-0 h-full">
            <h3 className="font-semibold text-muted-foreground mb-4 px-1">{title} ({todos.length})</h3>
            <div className="space-y-3 overflow-y-auto flex-grow pr-1">
                {todos.map(todo => {
                    const assignee = personnel.find(p => p.id === todo.assigneeId);
                    return (
                        <TaskCard 
                            key={todo.id} 
                            todo={todo}
                            allTodos={allTodos}
                            onClick={() => onTaskClick(todo)} 
                            assignee={assignee}
                            user={user}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export const KanbanBoard: React.FC<KanbanBoardProps & { onTaskClick?: (task: Todo) => void }> = ({ todos, allTodos, onUpdateTodo, personnel, user, onTaskClick }) => {
    const columns: { title: string, status: TodoStatus }[] = [
        { title: 'To Do', status: TodoStatus.TODO },
        { title: 'In Progress', status: TodoStatus.IN_PROGRESS },
        { title: 'Done', status: TodoStatus.DONE },
    ];

    const handleTaskClick = (task: Todo) => {
        if (onTaskClick) {
            onTaskClick(task);
        } else {
            console.log("View task details for:", task.id);
        }
    };

    return (
        <div className="flex gap-4 h-[calc(100vh-20rem)]">
            {columns.map(col => (
                <KanbanColumn
                    key={col.status}
                    title={col.title}
                    todos={todos.filter(t => t.status === col.status)}
                    allTodos={allTodos}
                    personnel={personnel}
                    user={user}
                    onTaskClick={handleTaskClick}
                />
            ))}
        </div>
    );
};