import React, { useState, useCallback, useMemo } from 'react';
import { User, Todo, TodoStatus, Project } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { PriorityDisplay } from '../ui/PriorityDisplay';
import { Tag } from '../ui/Tag';

interface EnhancedKanbanBoardProps {
  todos: Todo[];
  allTodos: Todo[];
  user: User;
  personnel: User[];
  projects: Project[];
  onTaskStatusChange: (taskId: string | number, newStatus: TodoStatus) => void;
  onTaskSelectionChange: (taskId: string | number, selected: boolean) => void;
  selectedTaskIds: Set<string | number>;
  onTaskEdit?: (task: Todo) => void;
  groupBy?: 'status' | 'assignee' | 'priority' | 'project';
  showSwimlanes?: boolean;
}

interface KanbanColumnProps {
  title: string;
  status: TodoStatus;
  todos: Todo[];
  allTodos: Todo[];
  user: User;
  personnel: User[];
  selectedTaskIds: Set<string | number>;
  onTaskSelectionChange: (taskId: string | number, selected: boolean) => void;
  onDrop: (newStatus: TodoStatus) => void;
  onDragStart: (taskId: string | number) => void;
  onTaskEdit?: (task: Todo) => void;
  swimlaneGroups?: { [key: string]: Todo[] };
  showSwimlanes?: boolean;
}

interface TaskCardProps {
  todo: Todo;
  user: User;
  personnel: User[];
  isSelected: boolean;
  onSelectionChange: (taskId: string | number, selected: boolean) => void;
  onDragStart: () => void;
  onEdit?: (task: Todo) => void;
  isCompact?: boolean;
}

const EnhancedTaskCard: React.FC<TaskCardProps> = ({
  todo,
  user,
  personnel,
  isSelected,
  onSelectionChange,
  onDragStart,
  onEdit,
  isCompact = false
}) => {
  const assignee = personnel.find(p => p.id === todo.assigneeId);
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date();
  const daysUntilDue = todo.dueDate ? Math.ceil((new Date(todo.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onSelectionChange(todo.id, !isSelected);
    } else if (onEdit) {
      onEdit(todo);
    }
  };

  return (
    <Card
      className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        } ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
      draggable
      onDragStart={onDragStart}
      onClick={handleClick}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-gray-900 ${isCompact ? 'text-sm' : 'text-base'} truncate`}>
              {todo.title}
            </h4>
            {!isCompact && todo.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}
          </div>
          <PriorityDisplay priority={todo.priority} size="sm" />
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {assignee && (
              <div className="flex items-center space-x-1">
                <Avatar
                  name={`${assignee.firstName} ${assignee.lastName}`}
                  imageUrl={assignee.avatar}
                  className="h-5 w-5"
                />
                <span className="truncate max-w-20">
                  {assignee.firstName}
                </span>
              </div>
            )}
            {todo.tags && todo.tags.length > 0 && (
              <div className="flex space-x-1">
                {todo.tags.slice(0, 2).map((tag, index) => (
                  <Tag key={`${todo.id}-tag-${tag}-${index}`} variant="secondary" size="sm">
                    {tag}
                  </Tag>
                ))}
                {todo.tags.length > 2 && (
                  <span className="text-gray-400">+{todo.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>

          {/* Due date */}
          {todo.dueDate && (
            <div className={`text-xs ${isOverdue ? 'text-red-600 font-medium' :
              daysUntilDue !== null && daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-500'
              }`}>
              {isOverdue ? 'Overdue' :
                daysUntilDue === 0 ? 'Due today' :
                  daysUntilDue === 1 ? 'Due tomorrow' :
                    `${daysUntilDue}d left`}
            </div>
          )}
        </div>

        {/* Progress indicator for subtasks */}
        {todo.subTasks && todo.subTasks.length > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtasks</span>
              <span>{todo.subTasks.filter(st => st.completedAt).length}/{todo.subTasks.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 subtask-progress"
                data-progress={`${(todo.subTasks.filter(st => st.completedAt).length / todo.subTasks.length) * 100}%`}
                style={{
                  width: `${(todo.subTasks.filter(st => st.completedAt).length / todo.subTasks.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  todos,
  allTodos,
  user,
  personnel,
  selectedTaskIds,
  onTaskSelectionChange,
  onDrop,
  onDragStart,
  onTaskEdit,
  swimlaneGroups,
  showSwimlanes
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(status);
  };

  const getStatusColor = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.TODO: return 'bg-gray-100 border-gray-300';
      case TodoStatus.IN_PROGRESS: return 'bg-blue-100 border-blue-300';
      case TodoStatus.DONE: return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  if (showSwimlanes && swimlaneGroups) {
    return (
      <div className={`flex-1 ${getStatusColor(status)} rounded-lg border-2 transition-colors ${isOver ? 'border-blue-500 bg-blue-50' : ''
        }`}>
        <div className="p-4 border-b bg-white rounded-t-lg">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">({todos.length} tasks)</span>
        </div>

        <div
          className="p-2 min-h-[500px]"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {Object.entries(swimlaneGroups).map(([groupKey, groupTodos]) => (
            <div key={groupKey} className="mb-4">
              <div className="text-xs font-medium text-gray-600 mb-2 px-2">
                {groupKey} ({groupTodos.length})
              </div>
              <div className="space-y-2">
                {groupTodos.map(todo => (
                  <EnhancedTaskCard
                    key={todo.id}
                    todo={todo}
                    allTodos={allTodos}
                    user={user}
                    personnel={personnel}
                    isSelected={selectedTaskIds.has(todo.id)}
                    onSelectionChange={onTaskSelectionChange}
                    onDragStart={() => onDragStart(todo.id)}
                    onEdit={onTaskEdit}
                    isCompact={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 ${getStatusColor(status)} rounded-lg border-2 transition-colors ${isOver ? 'border-blue-500 bg-blue-50' : ''
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-4 border-b bg-white rounded-t-lg">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">({todos.length} tasks)</span>
      </div>

      <div className="p-3 space-y-3 min-h-[500px] max-h-[600px] overflow-y-auto">
        {todos.map(todo => (
          <EnhancedTaskCard
            key={todo.id}
            todo={todo}
            allTodos={allTodos}
            user={user}
            personnel={personnel}
            isSelected={selectedTaskIds.has(todo.id)}
            onSelectionChange={onTaskSelectionChange}
            onDragStart={() => onDragStart(todo.id)}
            onEdit={onTaskEdit}
          />
        ))}
      </div>
    </div>
  );
};

export const EnhancedKanbanBoard: React.FC<EnhancedKanbanBoardProps> = ({
  todos,
  allTodos,
  user,
  personnel,
  projects,
  onTaskStatusChange,
  onTaskSelectionChange,
  selectedTaskIds,
  onTaskEdit,
  groupBy = 'status',
  showSwimlanes = false
}) => {
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

  const columns = useMemo(() => {
    return {
      [TodoStatus.TODO]: todos.filter(t => t.status === TodoStatus.TODO),
      [TodoStatus.IN_PROGRESS]: todos.filter(t => t.status === TodoStatus.IN_PROGRESS),
      [TodoStatus.DONE]: todos.filter(t => t.status === TodoStatus.DONE),
    };
  }, [todos]);

  const getSwimlaneGroups = useCallback((columnTodos: Todo[]) => {
    if (!showSwimlanes) return undefined;

    switch (groupBy) {
      case 'assignee':
        return columnTodos.reduce((groups, todo) => {
          const assignee = personnel.find(p => p.id === todo.assigneeId);
          const key = assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned';
          if (!groups[key]) groups[key] = [];
          groups[key].push(todo);
          return groups;
        }, {} as { [key: string]: Todo[] });

      case 'priority':
        return columnTodos.reduce((groups, todo) => {
          const key = todo.priority || 'No Priority';
          if (!groups[key]) groups[key] = [];
          groups[key].push(todo);
          return groups;
        }, {} as { [key: string]: Todo[] });

      case 'project':
        return columnTodos.reduce((groups, todo) => {
          const project = projects.find(p => p.id === todo.projectId);
          const key = project ? project.name : 'No Project';
          if (!groups[key]) groups[key] = [];
          groups[key].push(todo);
          return groups;
        }, {} as { [key: string]: Todo[] });

      default:
        return undefined;
    }
  }, [showSwimlanes, groupBy, personnel, projects]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Task Board</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Group by:</label>
            <select
              title="Group tasks by"
              value={groupBy}
              onChange={(e) => {
                // This would be handled by parent component
                console.log('Group by changed:', e.target.value);
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="status">Status</option>
              <option value="assignee">Assignee</option>
              <option value="priority">Priority</option>
              <option value="project">Project</option>
            </select>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // This would be handled by parent component
              console.log('Toggle swimlanes:', !showSwimlanes);
            }}
          >
            {showSwimlanes ? 'Hide' : 'Show'} Swimlanes
          </Button>
        </div>

        {selectedTaskIds.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedTaskIds.size} task{selectedTaskIds.size !== 1 ? 's' : ''} selected
            </span>
            <Button variant="secondary" size="sm">
              Bulk Edit
            </Button>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 h-[calc(100vh-16rem)] overflow-x-auto">
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
          onTaskEdit={onTaskEdit}
          swimlaneGroups={getSwimlaneGroups(columns[TodoStatus.TODO])}
          showSwimlanes={showSwimlanes}
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
          onTaskEdit={onTaskEdit}
          swimlaneGroups={getSwimlaneGroups(columns[TodoStatus.IN_PROGRESS])}
          showSwimlanes={showSwimlanes}
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
          onTaskEdit={onTaskEdit}
          swimlaneGroups={getSwimlaneGroups(columns[TodoStatus.DONE])}
          showSwimlanes={showSwimlanes}
        />
      </div>
    </div>
  );
};
