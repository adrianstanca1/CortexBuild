import React, { memo, useMemo, useCallback } from 'react';
import { Todo, User, TodoStatus } from '../../types';

interface TaskCardProps {
  todo: Todo;
  allTodos: Todo[];
  user: User;
  personnel: User[];
  isSelected: boolean;
  onSelectionChange: (id: string | number) => void;
  onDragStart: (taskId: string | number) => void;
}

/**
 * Optimized TaskCard component with React.memo and performance optimizations
 */
const OptimizedTaskCard: React.FC<TaskCardProps> = memo(({
  todo,
  allTodos,
  user,
  personnel,
  isSelected,
  onSelectionChange,
  onDragStart
}) => {
  // Memoize assignee lookup to prevent recalculation on every render
  const assignee = useMemo(() => 
    personnel.find(p => p.id === (todo as any).assigneeId),
    [personnel, todo]
  );

  // Memoize blocked status calculation
  const isBlocked = useMemo(() => {
    const dependsOn = (todo as any).dependsOn;
    if (!dependsOn || dependsOn.length === 0) return false;
    
    return dependsOn.some((depId: any) => {
      const dependency = allTodos.find(t => t.id == depId);
      return dependency && dependency.status !== TodoStatus.DONE;
    });
  }, [todo, allTodos]);

  // Memoize priority display component
  const PriorityDisplay = useMemo(() => {
    const priority = (todo as any).priority;
    if (!priority) return null;

    const priorityColors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800',
      URGENT: 'bg-red-200 text-red-900',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    );
  }, [todo]);

  // Memoize status display
  const statusDisplay = useMemo(() => {
    const statusColors = {
      [TodoStatus.TODO]: 'bg-gray-100 text-gray-800',
      [TodoStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [TodoStatus.DONE]: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[todo.status]}`}>
        {todo.status.replace('_', ' ')}
      </span>
    );
  }, [todo.status]);

  // Memoize callbacks to prevent child re-renders
  const handleSelectionChange = useCallback(() => {
    onSelectionChange(todo.id);
  }, [onSelectionChange, todo.id]);

  const handleDragStart = useCallback(() => {
    onDragStart(todo.id);
  }, [onDragStart, todo.id]);

  // Memoize assignee display
  const assigneeDisplay = useMemo(() => {
    if (!assignee) return null;
    
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
          {assignee.firstName?.[0]}{assignee.lastName?.[0]}
        </div>
        <span>{assignee.firstName} {assignee.lastName}</span>
      </div>
    );
  }, [assignee]);

  // Memoize due date display
  const dueDateDisplay = useMemo(() => {
    const dueDate = (todo as any).dueDate;
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const now = new Date();
    const isOverdue = date < now;
    const isToday = date.toDateString() === now.toDateString();

    return (
      <div className={`text-xs ${isOverdue ? 'text-red-600' : isToday ? 'text-orange-600' : 'text-muted-foreground'}`}>
        Due: {date.toLocaleDateString()}
        {isOverdue && ' (Overdue)'}
        {isToday && ' (Today)'}
      </div>
    );
  }, [todo]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        p-3 bg-background rounded-md border cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-md
        ${isSelected ? 'ring-2 ring-primary' : ''}
        ${isBlocked ? 'opacity-60 border-orange-300' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionChange}
            className="rounded border-gray-300"
          />
          <span className="font-medium text-sm flex-1">{todo.text}</span>
        </div>
        {PriorityDisplay}
      </div>

      <div className="space-y-2">
        {statusDisplay}
        
        {isBlocked && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            ⚠️ Blocked by dependencies
          </div>
        )}

        {assigneeDisplay}
        {dueDateDisplay}

        {(todo as any).description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {(todo as any).description}
          </p>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if these specific props change
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.text === nextProps.todo.text &&
    prevProps.todo.status === nextProps.todo.status &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.allTodos.length === nextProps.allTodos.length &&
    prevProps.personnel.length === nextProps.personnel.length &&
    JSON.stringify((prevProps.todo as any).dependsOn) === JSON.stringify((nextProps.todo as any).dependsOn) &&
    (prevProps.todo as any).assigneeId === (nextProps.todo as any).assigneeId &&
    (prevProps.todo as any).priority === (nextProps.todo as any).priority &&
    (prevProps.todo as any).dueDate === (nextProps.todo as any).dueDate
  );
});

OptimizedTaskCard.displayName = 'OptimizedTaskCard';

export { OptimizedTaskCard };
