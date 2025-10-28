import React, { useState } from 'react';
import {
  CheckSquare, Plus, Filter, Search, Calendar, User,
  MapPin, Clock, AlertCircle, CheckCircle, Circle,
  ChevronRight, Camera, Mic, Paperclip, X, Flag,
  Edit3, Trash2, MoreVertical, Tag, Users, Settings
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  location?: string;
  project: string;
  tags?: string[];
  attachments?: number;
  subtasks?: SubTask[];
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export default function TasksFieldView() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Install wall framing at Grid C',
      description: 'Complete metal stud framing for walls at grid C, levels 2-3',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Smith',
      dueDate: '2025-01-17',
      location: 'Grid C, Level 2',
      project: 'North Tower',
      tags: ['Framing', 'Level 2'],
      attachments: 3,
      subtasks: [
        { id: 's1', title: 'Install top track', completed: true },
        { id: 's2', title: 'Install studs', completed: false },
        { id: 's3', title: 'Install bottom track', completed: false }
      ],
      createdBy: 'Mike Johnson',
      createdAt: '2025-01-15T08:00:00Z'
    },
    {
      id: '2',
      title: 'Rough-in electrical boxes',
      description: 'Install electrical boxes per plan E-401',
      status: 'todo',
      priority: 'medium',
      assignee: 'Sarah Davis',
      dueDate: '2025-01-18',
      location: 'Level 3, North Wing',
      project: 'North Tower',
      tags: ['Electrical'],
      attachments: 1,
      createdBy: 'Tom Wilson',
      createdAt: '2025-01-15T09:30:00Z'
    },
    {
      id: '3',
      title: 'Final inspection - Foundation',
      description: 'Inspector arriving at 2pm',
      status: 'review',
      priority: 'urgent',
      assignee: 'Mike Johnson',
      dueDate: '2025-01-16',
      location: 'Foundation',
      project: 'North Tower',
      tags: ['Inspection', 'Critical'],
      createdBy: 'Admin',
      createdAt: '2025-01-14T14:00:00Z'
    },
    {
      id: '4',
      title: 'Complete drywall taping',
      status: 'done',
      priority: 'low',
      assignee: 'Crew B',
      dueDate: '2025-01-15',
      location: 'Level 1',
      project: 'North Tower',
      tags: ['Drywall'],
      createdBy: 'Sarah Davis',
      createdAt: '2025-01-13T10:00:00Z',
      completedAt: '2025-01-15T16:30:00Z'
    }
  ]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isOffline, setIsOffline] = useState(false);

  const statusConfig = {
    todo: { label: 'To Do', color: 'bg-gray-100 text-gray-700', icon: Circle },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
    review: { label: 'Review', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    done: { label: 'Done', color: 'bg-green-100 text-green-700', icon: CheckCircle }
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-600' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-600' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600' }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    done: filteredTasks.filter(t => t.status === 'done')
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, completedAt: newStatus === 'done' ? new Date().toISOString() : undefined }
        : task
    ));
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.subtasks) {
        return {
          ...task,
          subtasks: task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setSelectedTask(null);
  };

  const getTaskProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(st => st.completed).length;
    return (completed / task.subtasks.length) * 100;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const StatusIcon = statusConfig[task.status].icon;
    const progress = getTaskProgress(task);

    return (
      <div
        onClick={() => setSelectedTask(task)}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const statuses: Task['status'][] = ['todo', 'in-progress', 'review', 'done'];
              const currentIndex = statuses.indexOf(task.status);
              const nextStatus = statuses[(currentIndex + 1) % statuses.length];
              handleStatusChange(task.id, nextStatus);
            }}
            className="mt-0.5"
          >
            <StatusIcon className={`w-6 h-6 ${
              task.status === 'done' ? 'text-green-500' :
              task.status === 'in-progress' ? 'text-blue-500' :
              task.status === 'review' ? 'text-yellow-500' :
              'text-gray-400'
            }`} />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            {task.assignee && (
              <div className="flex items-center gap-1 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-xs">{task.assignee.split(' ')[0]}</span>
              </div>
            )}
            {task.attachments && task.attachments > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <Paperclip className="w-4 h-4" />
                <span className="text-xs">{task.attachments}</span>
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className={`flex items-center gap-1 ${
              isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'
            }`}>
              <Calendar className="w-4 h-4" />
              <span className="text-xs">{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Priority Badge */}
        <div className="flex items-center justify-between mt-2">
          <span className={`px-2 py-0.5 text-xs rounded-full ${priorityConfig[task.priority].color}`}>
            {priorityConfig[task.priority].label}
          </span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig[task.status].color}`}>
            {statusConfig[task.status].label}
          </span>
        </div>
      </div>
    );
  };

  if (selectedTask) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setSelectedTask(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Edit3 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title & Status */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{selectedTask.title}</h1>
            <div className="flex items-center gap-2">
              <select
                value={selectedTask.status}
                onChange={(e) => handleStatusChange(selectedTask.id, e.target.value as Task['status'])}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusConfig[selectedTask.status].color}`}
              >
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${priorityConfig[selectedTask.priority].color}`}>
                {priorityConfig[selectedTask.priority].label}
              </span>
            </div>
          </div>

          {/* Description */}
          {selectedTask.description && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{selectedTask.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
            <h3 className="font-medium text-gray-900 mb-2">Details</h3>
            
            {selectedTask.assignee && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assignee
                </span>
                <span className="text-sm text-gray-900">{selectedTask.assignee}</span>
              </div>
            )}

            {selectedTask.dueDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </span>
                <span className={`text-sm ${isOverdue(selectedTask.dueDate) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {formatDate(selectedTask.dueDate)}
                </span>
              </div>
            )}

            {selectedTask.location && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </span>
                <span className="text-sm text-gray-900">{selectedTask.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created by</span>
              <span className="text-sm text-gray-900">{selectedTask.createdBy}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created</span>
              <span className="text-sm text-gray-900">
                {new Date(selectedTask.createdAt).toLocaleDateString()}
              </span>
            </div>

            {selectedTask.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm text-green-600">
                  {new Date(selectedTask.completedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">
                Subtasks ({selectedTask.subtasks.filter(st => st.completed).length}/{selectedTask.subtasks.length})
              </h3>
              <div className="space-y-2">
                {selectedTask.subtasks.map(subtask => (
                  <label key={subtask.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleSubtaskToggle(selectedTask.id, subtask.id)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {subtask.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {selectedTask.tags && selectedTask.tags.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTask.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex gap-2">
            <button className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" />
              Add Photo
            </button>
            <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2">
              <Mic className="w-5 h-5" />
              Add Note
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">Tasks</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Priority</option>
            {Object.entries(priorityConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-900">Offline - Changes will sync when online</span>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tasks found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="bg-gray-100 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  {React.createElement(statusConfig[status as Task['status']].icon, {
                    className: 'w-5 h-5'
                  })}
                  {statusConfig[status as Task['status']].label}
                  <span className="ml-auto text-sm text-gray-600">{statusTasks.length}</span>
                </h3>
                <div className="space-y-2">
                  {statusTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowNewTask(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
