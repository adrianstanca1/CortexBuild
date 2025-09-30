// @ts-nocheck
import React, { memo, useMemo, useCallback, useState } from 'react';
import type { Todo, User, TodoStatus } from '../../types';
import { OptimizedTaskCard } from './OptimizedTaskCard';

interface KanbanBoardProps {
  todos: Todo[];
  allTodos: Todo[];
  user: User;
  personnel: User[];
  onTaskStatusChange: (taskId: string | number, newStatus: TodoStatus) => void;
  onTaskSelectionChange: (id: string | number) => void;
  selectedTaskIds: Set<string | number>;
}

interface KanbanColumnProps {
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
}

/**
 * Optimized Kanban Column with memoization and performance optimizations
 */
const OptimizedKanbanColumn: React.FC<KanbanColumnProps> = memo(({
  title,
  status,
  todos,
  allTodos,
  user,
  personnel,
  selectedTaskIds,
  onTaskSelectionChange,
  onDrop,
  onDragStart
}) => {
  const [isOver, setIsOver] = useState(false);

  // Memoize drag handlers to prevent unnecessary re-renders
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(() => {
    onDrop(status);
    setIsOver(false);
  }, [onDrop, status]);

  // Memoize column statistics
  const columnStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.status === TodoStatus.DONE).length;
    const inProgress = todos.filter(todo => todo.status === TodoStatus.IN_PROGRESS).length;
    
    return { total, completed, inProgress };
  }, [todos]);

  // Memoize column header
  const columnHeader = useMemo(() => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-foreground">
        {title} ({columnStats.total})
      </h3>
      {status === TodoStatus.IN_PROGRESS && columnStats.inProgress > 0 && (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {columnStats.inProgress} active
        </span>
      )}
      {status === TodoStatus.DONE && columnStats.completed > 0 && (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          {columnStats.completed} done
        </span>
      )}
    </div>
  ), [title, columnStats, status]);

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex-1 p-3 bg-muted rounded-lg transition-all duration-200
        ${isOver ? 'bg-primary/20 ring-2 ring-primary/50' : ''}
      `}
    >
      {columnHeader}
      
      <div className="space-y-3 h-full overflow-y-auto pr-1 max-h-[calc(100vh-16rem)]">
        {todos.map(todo => (
          <OptimizedTaskCard 
            key={todo.id}
            todo={todo}
            allTodos={allTodos}
            user={user}
            personnel={personnel}
            isSelected={selectedTaskIds.has(todo.id)}
            onSelectionChange={onTaskSelectionChange}
            onDragStart={onDragStart}
          />
        ))}
        
        {todos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">No tasks in {title.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for column optimization
  return (
    prevProps.title === nextProps.title &&
    prevProps.status === nextProps.status &&
    prevProps.todos.length === nextProps.todos.length &&
    prevProps.allTodos.length === nextProps.allTodos.length &&
    prevProps.personnel.length === nextProps.personnel.length &&
    prevProps.selectedTaskIds.size === nextProps.selectedTaskIds.size &&
    // Check if todos array actually changed (shallow comparison)
    prevProps.todos.every((todo, index) => todo.id === nextProps.todos[index]?.id)
  );
});

OptimizedKanbanColumn.displayName = 'OptimizedKanbanColumn';

/**
 * Optimized Kanban Board with performance improvements
 */
export const OptimizedKanbanBoard: React.FC<KanbanBoardProps> = memo(({
  todos,
  allTodos,
  user,
  personnel,
  onTaskStatusChange,
  onTaskSelectionChange,
  selectedTaskIds
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | number | null>(null);

  // Memoize drag handlers
  const handleDragStart = useCallback((taskId: string | number) => {
    setDraggedTaskId(taskId);
  }, []);

  const handleDrop = useCallback((newStatus: TodoStatus) => {
    if (draggedTaskId !== null) {
      onTaskStatusChange(draggedTaskId, newStatus);
      setDraggedTaskId(null);
    }
  }, [draggedTaskId, onTaskStatusChange]);

  // Memoize column data to prevent recalculation
  const columns = useMemo(() => ({
    [TodoStatus.TODO]: todos.filter(t => t.status === TodoStatus.TODO),
    [TodoStatus.IN_PROGRESS]: todos.filter(t => t.status === TodoStatus.IN_PROGRESS),
    [TodoStatus.DONE]: todos.filter(t => t.status === TodoStatus.DONE),
  }), [todos]);

  // Memoize board statistics
  const boardStats = useMemo(() => {
    const total = todos.length;
    const todo = columns[TodoStatus.TODO].length;
    const inProgress = columns[TodoStatus.IN_PROGRESS].length;
    const done = columns[TodoStatus.DONE].length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, todo, inProgress, done, completionRate };
  }, [todos.length, columns]);

  // Memoize board header
  const boardHeader = useMemo(() => (
    <div className="mb-4 p-4 bg-background rounded-lg border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Task Board</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total: {boardStats.total}</span>
          <span>Completion: {boardStats.completionRate}%</span>
          {boardStats.inProgress > 0 && (
            <span className="text-blue-600">
              {boardStats.inProgress} in progress
            </span>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${boardStats.completionRate}%` }}
        />
      </div>
    </div>
  ), [boardStats]);

  return (
    <div className="space-y-4">
      {boardHeader}
      
      <div className="flex gap-4 h-[calc(100vh-22rem)]">
        <OptimizedKanbanColumn 
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
        
        <OptimizedKanbanColumn 
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
        
        <OptimizedKanbanColumn 
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
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.todos.length === nextProps.todos.length &&
    prevProps.allTodos.length === nextProps.allTodos.length &&
    prevProps.personnel.length === nextProps.personnel.length &&
    prevProps.selectedTaskIds.size === nextProps.selectedTaskIds.size &&
    prevProps.user.id === nextProps.user.id
  );
});

OptimizedKanbanBoard.displayName = 'OptimizedKanbanBoard';
