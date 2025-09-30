import React, { useState, useMemo, useCallback } from 'react';
import { Todo, Project, User, TodoStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface GanttTask {
  id: string | number;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: TodoStatus;
  assignee?: User;
  dependencies?: string[];
  projectId?: string | number;
  priority?: string;
  color?: string;
}

interface GanttChartProps {
  tasks: Todo[];
  projects: Project[];
  personnel: User[];
  onTaskUpdate?: (taskId: string | number, updates: Partial<Todo>) => void;
  onTaskClick?: (task: Todo) => void;
  viewMode?: 'days' | 'weeks' | 'months';
  showDependencies?: boolean;
  showCriticalPath?: boolean;
}

const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  projects,
  personnel,
  onTaskUpdate,
  onTaskClick,
  viewMode = 'weeks',
  showDependencies = true,
  showCriticalPath = false
}) => {
  const [selectedTask, setSelectedTask] = useState<string | number | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert tasks to Gantt format
  const ganttTasks: GanttTask[] = useMemo(() => {
    return tasks
      .filter(task => task.startDate && task.dueDate)
      .map(task => {
        const assignee = personnel.find(p => p.id === task.assigneeId);
        const project = projects.find(p => p.id === task.projectId);
        
        return {
          id: task.id,
          name: task.title,
          startDate: new Date(task.startDate!),
          endDate: new Date(task.dueDate!),
          progress: task.status === TodoStatus.DONE ? 100 : 
                   task.status === TodoStatus.IN_PROGRESS ? 50 : 0,
          status: task.status,
          assignee,
          dependencies: task.dependencies || [],
          projectId: task.projectId,
          priority: task.priority,
          color: project?.color || '#3B82F6'
        };
      });
  }, [tasks, personnel, projects]);

  // Calculate timeline
  const timeline = useMemo(() => {
    if (ganttTasks.length === 0) return { start: new Date(), end: new Date(), periods: [] };

    const allDates = ganttTasks.flatMap(task => [task.startDate, task.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Add padding
    const padding = viewMode === 'days' ? 7 : viewMode === 'weeks' ? 14 : 30;
    const start = new Date(minDate);
    start.setDate(start.getDate() - padding);
    const end = new Date(maxDate);
    end.setDate(end.getDate() + padding);

    // Generate periods
    const periods: Date[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      periods.push(new Date(current));
      
      if (viewMode === 'days') {
        current.setDate(current.getDate() + 1);
      } else if (viewMode === 'weeks') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    return { start, end, periods };
  }, [ganttTasks, viewMode]);

  const formatPeriodLabel = useCallback((date: Date) => {
    switch (viewMode) {
      case 'days':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weeks':
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'months':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  }, [viewMode]);

  const getTaskPosition = useCallback((task: GanttTask) => {
    const totalDuration = timeline.end.getTime() - timeline.start.getTime();
    const taskStart = task.startDate.getTime() - timeline.start.getTime();
    const taskDuration = task.endDate.getTime() - task.startDate.getTime();

    const left = (taskStart / totalDuration) * 100;
    const width = (taskDuration / totalDuration) * 100;

    return { left: `${left}%`, width: `${width}%` };
  }, [timeline]);

  const getStatusColor = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.TODO: return 'bg-gray-400';
      case TodoStatus.IN_PROGRESS: return 'bg-blue-500';
      case TodoStatus.DONE: return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const handleTaskDragStart = (taskId: string | number) => {
    setDraggedTask(taskId);
    setIsDragging(true);
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
    setIsDragging(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const todayPosition = useMemo(() => {
    const today = new Date();
    if (today < timeline.start || today > timeline.end) return null;
    
    const totalDuration = timeline.end.getTime() - timeline.start.getTime();
    const todayOffset = today.getTime() - timeline.start.getTime();
    return (todayOffset / totalDuration) * 100;
  }, [timeline]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
          <div className="flex items-center space-x-2">
            <div className="flex rounded-md shadow-sm">
              {['days', 'weeks', 'months'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    // This would be handled by parent component
                    console.log('View mode changed:', mode);
                  }}
                  className={`px-3 py-2 text-sm font-medium border ${
                    viewMode === mode
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${mode === 'days' ? 'rounded-l-md' : mode === 'months' ? 'rounded-r-md' : ''}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm">
              Export
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Not Started</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          {showCriticalPath && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Critical Path</span>
            </div>
          )}
        </div>

        {/* Gantt Chart */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Timeline Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex">
              <div className="w-80 p-3 border-r border-gray-200">
                <span className="text-sm font-medium text-gray-700">Task</span>
              </div>
              <div className="flex-1 relative">
                <div className="flex h-12">
                  {timeline.periods.map((period, index) => (
                    <div
                      key={index}
                      className={`flex-1 p-2 border-r border-gray-200 text-xs text-center ${
                        isToday(period) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600'
                      }`}
                      style={{ minWidth: '80px' }}
                    >
                      {formatPeriodLabel(period)}
                    </div>
                  ))}
                </div>
                
                {/* Today indicator */}
                {todayPosition !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${todayPosition}%` }}
                  >
                    <div className="absolute -top-2 -left-6 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Today
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="max-h-96 overflow-y-auto">
            {ganttTasks.map((task, index) => {
              const position = getTaskPosition(task);
              const isSelected = selectedTask === task.id;
              
              return (
                <div
                  key={task.id}
                  className={`flex border-b border-gray-100 hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Task Info */}
                  <div className="w-80 p-3 border-r border-gray-200">
                    <div className="flex items-center space-x-2">
                      {task.assignee && (
                        <Avatar
                          name={`${task.assignee.firstName} ${task.assignee.lastName}`}
                          imageUrl={task.assignee.avatar}
                          className="h-6 w-6"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative p-2">
                    <div
                      className={`relative h-6 rounded cursor-pointer transition-all duration-200 ${getStatusColor(task.status)} ${
                        isDragging && draggedTask === task.id ? 'opacity-50' : ''
                      }`}
                      style={position}
                      draggable
                      onDragStart={() => handleTaskDragStart(task.id)}
                      onDragEnd={handleTaskDragEnd}
                      onClick={() => {
                        setSelectedTask(task.id);
                        onTaskClick?.(tasks.find(t => t.id === task.id)!);
                      }}
                    >
                      {/* Progress bar */}
                      <div
                        className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded"
                        style={{ width: `${task.progress}%` }}
                      />
                      
                      {/* Task label */}
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-xs text-white font-medium truncate">
                          {task.progress}%
                        </span>
                      </div>

                      {/* Resize handles */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white bg-opacity-50 cursor-w-resize" />
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white bg-opacity-50 cursor-e-resize" />
                    </div>

                    {/* Dependencies */}
                    {showDependencies && task.dependencies && task.dependencies.length > 0 && (
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {task.dependencies.map(depId => {
                          const depTask = ganttTasks.find(t => t.id.toString() === depId);
                          if (!depTask) return null;
                          
                          const depPosition = getTaskPosition(depTask);
                          const currentPosition = getTaskPosition(task);
                          
                          // Simple arrow line (in a real implementation, you'd use SVG)
                          return (
                            <div
                              key={depId}
                              className="absolute border-t-2 border-gray-400 border-dashed"
                              style={{
                                top: '50%',
                                left: `calc(${depPosition.left} + ${depPosition.width})`,
                                width: `calc(${currentPosition.left} - ${depPosition.left} - ${depPosition.width})`,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{ganttTasks.length}</div>
            <div className="text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {ganttTasks.filter(t => t.status === TodoStatus.DONE).length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {ganttTasks.filter(t => t.status === TodoStatus.IN_PROGRESS).length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {Math.round(ganttTasks.reduce((acc, task) => acc + task.progress, 0) / ganttTasks.length) || 0}%
            </div>
            <div className="text-gray-600">Overall Progress</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GanttChart;
