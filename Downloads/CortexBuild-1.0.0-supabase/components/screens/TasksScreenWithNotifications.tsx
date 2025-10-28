/**
 * Enhanced Tasks Screen with Integrated Notifications
 * Demonstrates how to integrate the notification system into the Tasks screen
 */

import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { NotificationProvider, useNotifications } from '../../contexts/NotificationContext';
import { NotificationBell, NotificationCenter } from '../notifications';
import { AlertSettings } from '../notifications/AlertSettings';
import { useTasksWithNotifications } from '../../hooks/useTasksWithNotifications';
import { useAuth } from '../../hooks/useAuth'; // Assuming this exists

interface TasksScreenContentProps {
  userId: string;
  companyId?: string;
}

const TasksScreenContent: React.FC<TasksScreenContentProps> = ({ userId, companyId }) => {
  const { user } = useAuth();
  const { 
    tasks, 
    loading, 
    error, 
    createTask, 
    updateTask, 
    refreshTasks,
    checkUpcomingDeadlines,
    checkOverdueTasks 
  } = useTasksWithNotifications({ userId, companyId });
  
  // Notification states
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handle task creation
  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask(taskData);
      setShowCreateTask(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Handle task status update
  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your tasks and deadlines
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Manual deadline check buttons */}
            <button
              onClick={checkUpcomingDeadlines}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Check upcoming deadlines"
            >
              Check Deadlines
            </button>
            
            <button
              onClick={checkOverdueTasks}
              className="px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Check overdue tasks"
            >
              Check Overdue
            </button>

            {/* Notification Bell */}
            <NotificationBell
              userId={userId}
              onOpenNotifications={() => setShowNotificationCenter(true)}
              showUnreadCount={true}
              maxCount={99}
            />

            {/* Create Task Button */}
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <span className="text-gray-500">Loading tasks...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-red-500 mb-4">Error loading tasks</div>
            <button
              onClick={refreshTasks}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-400 mb-4">No tasks found</div>
            <button
              onClick={() => setShowCreateTask(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {task.assignee_name && (
                        <span>Assigned to: {task.assignee_name}</span>
                      )}
                      {task.due_date && (
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      )}
                      {task.project_name && (
                        <span>Project: {task.project_name}</span>
                      )}
                      <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter
        userId={userId}
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />

      {/* Notification Settings Modal */}
      <AlertSettings
        userId={userId}
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />

      {/* Create Task Modal would go here */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 overflow-hidden" onClick={() => setShowCreateTask(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-25" />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Create New Task</h2>
              <button
                onClick={() => setShowCreateTask(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {/* Task creation form would go here */}
            <div className="text-center text-gray-500">
              Task creation form implementation would go here
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Tasks Screen Component with Notification Provider
interface TasksScreenWithNotificationsProps {
  userId: string;
  companyId?: string;
}

export const TasksScreenWithNotifications: React.FC<TasksScreenWithNotificationsProps> = ({ 
  userId, 
  companyId 
}) => {
  return (
    <NotificationProvider userId={userId} companyId={companyId}>
      <TasksScreenContent userId={userId} companyId={companyId} />
    </NotificationProvider>
  );
};
