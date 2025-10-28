import React, { useState } from 'react';
import { Todo, TodoStatus, User } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  todos: Todo[];
  allTodos: Todo[];
  user: User;
  personnel: User[];
  onTaskStatusChange: (taskId: string | number, newStatus: TodoStatus) => void;
  onTaskSelectionChange: (taskId: string | number) => void;
  selectedTaskIds: Set<string | number>;
}

const KanbanColumn: React.FC<{
  title: string;
  status: TodoStatus;
  todos: Todo[];
  allTodos: Todo[];
  user: User;
  personnel: User[];
  selectedTaskIds: Set<string | number>;
  onTaskSelectionChange: (id: string | number) => void;
  onDrop: (status: TodoStatus) => void;
  onDragStart: (taskId: string | number) => void;
}> = ({ title, status, todos, allTodos, user, personnel, selectedTaskIds, onTaskSelectionChange, onDrop, onDragStart }) => {
    const [isOver, setIsOver] = useState(false);
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => setIsOver(false);

    const handleDrop = () => {
        onDrop(status);
        setIsOver(false);
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 p-3 bg-muted rounded-lg transition-colors ${isOver ? 'bg-primary/20' : ''}`}
        >
            <h3 className="font-semibold mb-4 text-foreground">{title} ({todos.length})</h3>
            <div className="space-y-3 h-full overflow-y-auto pr-1">
                {todos.map(todo => (
                    <TaskCard 
                        key={todo.id}
                        todo={todo}
                        allTodos={allTodos}
                        user={user}
                        personnel={personnel}
                        isSelected={selectedTaskIds.has(todo.id)}
                        onSelectionChange={onTaskSelectionChange}
                        onDragStart={() => onDragStart(todo.id)}
                    />
                ))}
            </div>
        </div>
    );
export const KanbanBoard: React.FC<KanbanBoardProps> = ({ todos, allTodos, user, personnel, onTaskStatusChange, onTaskSelectionChange, selectedTaskIds }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | number | null>(null);

  const handleDragStart = (taskId: string | number) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = (newStatus: TodoStatus) => {
    if (draggedTaskId !== null) {
      onTaskStatusChange(draggedTaskId, newStatus);
      setDraggedTaskId(null);
    }
  };
  
  const columns = {
    [TodoStatus.TODO]: todos.filter(t => t.status === TodoStatus.TODO),
    [TodoStatus.IN_PROGRESS]: todos.filter(t => t.status === TodoStatus.IN_PROGRESS),
    [TodoStatus.DONE]: todos.filter(t => t.status === TodoStatus.DONE),
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-22rem)]">
        <KanbanColumn 
            title="To Do" 
            status={TodoStatus.TODO} 
            todos={columns[TodoStatus.TODO]}
            allTodos={allTodos}
            user={user}
            personnel={personnel}
            selectedTaskIds={selectedTaskIds}
            onTaskSelectionChange={onTaskSelectionChange}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
        />
         <KanbanColumn 
            title="In Progress" 
            status={TodoStatus.IN_PROGRESS} 
            todos={columns[TodoStatus.IN_PROGRESS]}
            allTodos={allTodos}
            user={user}
            personnel={personnel}
            selectedTaskIds={selectedTaskIds}
            onTaskSelectionChange={onTaskSelectionChange}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
        />
         <KanbanColumn 
            title="Done" 
            status={TodoStatus.DONE} 
            todos={columns[TodoStatus.DONE]}
            allTodos={allTodos}
            user={user}
            personnel={personnel}
            selectedTaskIds={selectedTaskIds}
            onTaskSelectionChange={onTaskSelectionChange}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
        />
    </div>
  );
};