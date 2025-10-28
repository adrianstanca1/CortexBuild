import React, { useState } from 'react';
import { User, View } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface TasksViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  setActiveView: (view: View) => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  project: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
}

export const TasksView: React.FC<TasksViewProps> = ({ user, addToast, setActiveView }) => {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Foundation Inspection',
      description: 'Complete structural inspection of foundation work',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Smith',
      project: 'Riverside Apartments',
      dueDate: '2024-02-15',
      estimatedHours: 8,
      actualHours: 6
    },
    {
      id: '2',
      title: 'Electrical Wiring - Floor 2',
      description: 'Install electrical wiring for second floor units',
      status: 'todo',
      priority: 'medium',
      assignee: 'Mike Johnson',
      project: 'Commercial Office',
      dueDate: '2024-02-18',
      estimatedHours: 16
    },
    {
      id: '3',
      title: 'Safety Equipment Check',
      description: 'Monthly safety equipment inspection and maintenance',
      status: 'review',
      priority: 'urgent',
      assignee: 'Sarah Wilson',
      project: 'All Projects',
      dueDate: '2024-02-10',
      estimatedHours: 4,
      actualHours: 3
    },
    {
      id: '4',
      title: 'Plumbing Installation',
      description: 'Install plumbing system for kitchen and bathrooms',
      status: 'completed',
      priority: 'medium',
      assignee: 'David Brown',
      project: 'Shopping Center',
      dueDate: '2024-02-08',
      estimatedHours: 12,
      actualHours: 14
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getTaskStats = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length
    };
  };

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage and track project tasks</p>
        </div>
        <Button
          onClick={() => addToast('New task creation coming soon!', 'success')}
          variant="primary"
        >
          + New Task
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Tasks</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-500">{stats.todo}</p>
            <p className="text-sm text-gray-600">To Do</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.review}</p>
            <p className="text-sm text-gray-600">Review</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Priority:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex-1" />

          <Button
            onClick={() => {
              setFilterStatus('all');
              setFilterPriority('all');
            }}
            variant="ghost"
            size="sm"
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{task.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Assignee:</span>
                    <p className="font-medium">{task.assignee}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <p className="font-medium">{task.project}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <p className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <p className="font-medium">
                      {task.actualHours ? `${task.actualHours}h` : `${task.estimatedHours}h est.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => addToast(`Editing task: ${task.title}`, 'success')}
                variant="primary"
                size="sm"
              >
                Edit
              </Button>
              <Button
                onClick={() => addToast(`Viewing details for: ${task.title}`, 'success')}
                variant="secondary"
                size="sm"
              >
                View Details
              </Button>
              {task.status !== 'completed' && (
                <Button
                  onClick={() => addToast(`Marking ${task.title} as completed`, 'success')}
                  variant="success"
                  size="sm"
                >
                  Complete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No tasks match your current filters.</p>
          <Button
            onClick={() => {
              setFilterStatus('all');
              setFilterPriority('all');
            }}
            variant="ghost"
            className="mt-2"
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
};