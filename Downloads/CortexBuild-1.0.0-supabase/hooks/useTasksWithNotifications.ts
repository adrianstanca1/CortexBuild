/**
 * Enhanced Tasks Hook with Automatic Notifications
 * Integrates notification triggers with task management
 */

import { useCallback } from 'react';
import { useNotificationTriggers } from './useNotificationTriggers';
import { useTasks } from './useTasks'; // Assuming this exists
import { supabase } from '../lib/supabase/client';

interface UseTasksWithNotificationsProps {
  userId: string;
  companyId?: string;
}

export function useTasksWithNotifications({ userId, companyId }: UseTasksWithNotificationsProps) {
  const notificationTriggers = useNotificationTriggers({ userId, companyId });
  const { tasks, loading, error, createTask, updateTask, deleteTask, refreshTasks } = useTasks({ userId, companyId });

  // Enhanced create task with notifications
  const createTaskWithNotification = useCallback(async (taskData: any) => {
    try {
      // Create the task first
      const newTask = await createTask(taskData);
      
      if (newTask && taskData.assignee_id && taskData.assignee_id !== userId) {
        // Notify the assignee
        try {
          await notificationTriggers.notifyTaskAssigned(
            newTask.id,
            newTask.title,
            taskData.assignee_id,
            taskData.assignee_name || 'Unknown User',
            taskData.project_name
          );
        } catch (notificationError) {
          console.error('Failed to send task assignment notification:', notificationError);
        }
      }

      return newTask;
    } catch (error) {
      console.error('Error creating task with notification:', error);
      throw error;
    }
  }, [createTask, notificationTriggers, userId]);

  // Enhanced update task with notifications
  const updateTaskWithNotification = useCallback(async (taskId: string, updates: any) => {
    try {
      // Get the current task before updating
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      // Update the task
      const updatedTask = await updateTask(taskId, updates);

      // Check for status changes that need notifications
      if (updates.status && updates.status !== currentTask.status) {
        await handleStatusChangeNotification(currentTask, updatedTask, updates);
      }

      // Check for assignee changes
      if (updates.assignee_id && updates.assignee_id !== currentTask.assignee_id) {
        await handleAssigneeChangeNotification(currentTask, updatedTask, updates);
      }

      // Check for deadline changes
      if (updates.due_date && updates.due_date !== currentTask.due_date) {
        await handleDeadlineChangeNotification(currentTask, updatedTask, updates);
      }

      return updatedTask;
    } catch (error) {
      console.error('Error updating task with notification:', error);
      throw error;
    }
  }, [updateTask, tasks, notificationTriggers]);

  // Handle status change notifications
  const handleStatusChangeNotification = useCallback(async (oldTask: any, newTask: any, updates: any) => {
    const { notifyTaskCompleted, notifyTaskStatusChanged } = notificationTriggers;

    try {
      if (newTask.status === 'completed' && oldTask.status !== 'completed') {
        // Task completed - notify assignee
        if (newTask.assignee_id) {
          await notifyTaskCompleted(
            newTask.id,
            newTask.title,
            newTask.assignee_id,
            updates.completed_by_name || 'System',
            newTask.project_name
          );
        }
      } else if (newTask.status !== oldTask.status) {
        // General status change - notify assignee
        if (newTask.assignee_id) {
          await notifyTaskStatusChanged(
            newTask.id,
            newTask.title,
            newTask.assignee_id,
            oldTask.status,
            newTask.status,
            updates.changed_by_name || 'System',
            newTask.project_name
          );
        }
      }
    } catch (error) {
      console.error('Error sending status change notification:', error);
    }
  }, [notificationTriggers]);

  // Handle assignee change notifications
  const handleAssigneeChangeNotification = useCallback(async (oldTask: any, newTask: any, updates: any) => {
    const { notifyTaskAssigned } = notificationTriggers;

    try {
      if (newTask.assignee_id && newTask.assignee_id !== oldTask.assignee_id) {
        // New assignee - send assignment notification
        await notifyTaskAssigned(
          newTask.id,
          newTask.title,
          newTask.assignee_id,
          updates.assignee_name || 'Unknown User',
          newTask.project_name
        );
      }
    } catch (error) {
      console.error('Error sending assignee change notification:', error);
    }
  }, [notificationTriggers]);

  // Handle deadline change notifications
  const handleDeadlineChangeNotification = useCallback(async (oldTask: any, newTask: any, updates: any) => {
    const { notifyTaskDeadlineApproaching, notifyTaskOverdue } = notificationTriggers;

    try {
      if (newTask.due_date && newTask.assignee_id) {
        const dueDate = new Date(newTask.due_date);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue > 0 && daysUntilDue <= 7) {
          // Deadline approaching
          await notifyTaskDeadlineApproaching(
            newTask.id,
            newTask.title,
            newTask.assignee_id,
            daysUntilDue,
            newTask.due_date
          );
        } else if (daysUntilDue < 0) {
          // Task is overdue
          const daysOverdue = Math.abs(daysUntilDue);
          await notifyTaskOverdue(
            newTask.id,
            newTask.title,
            newTask.assignee_id,
            daysOverdue,
            newTask.due_date
          );
        }
      }
    } catch (error) {
      console.error('Error sending deadline change notification:', error);
    }
  }, [notificationTriggers]);

  // Check for upcoming deadlines and send notifications
  const checkUpcomingDeadlines = useCallback(async () => {
    try {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get tasks with upcoming deadlines
      const { data: upcomingTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .gte('due_date', now.toISOString())
        .lte('due_date', weekFromNow.toISOString())
        .neq('status', 'completed')
        .not('assignee_id', 'is', null);

      if (error) throw error;

      if (upcomingTasks) {
        for (const task of upcomingTasks) {
          const dueDate = new Date(task.due_date);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Only send notification if we haven't sent one recently for this task
          const lastNotificationKey = `deadline_notification_${task.id}`;
          const lastNotification = localStorage.getItem(lastNotificationKey);
          const lastNotificationDate = lastNotification ? new Date(lastNotification) : null;

          // Don't send duplicate notifications within 24 hours
          if (!lastNotificationDate || (now.getTime() - lastNotificationDate.getTime()) > 24 * 60 * 60 * 1000) {
            try {
              await notificationTriggers.notifyTaskDeadlineApproaching(
                task.id,
                task.title,
                task.assignee_id,
                daysUntilDue,
                task.due_date
              );

              // Store last notification time
              localStorage.setItem(lastNotificationKey, now.toISOString());
            } catch (error) {
              console.error(`Error sending deadline notification for task ${task.id}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking upcoming deadlines:', error);
    }
  }, [companyId, notificationTriggers]);

  // Check for overdue tasks and send notifications
  const checkOverdueTasks = useCallback(async () => {
    try {
      const now = new Date();

      // Get overdue tasks
      const { data: overdueTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .lt('due_date', now.toISOString())
        .neq('status', 'completed')
        .not('assignee_id', 'is', null);

      if (error) throw error;

      if (overdueTasks) {
        for (const task of overdueTasks) {
          const dueDate = new Date(task.due_date);
          const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          // Only send notification if we haven't sent one recently for this task
          const lastNotificationKey = `overdue_notification_${task.id}`;
          const lastNotification = localStorage.getItem(lastNotificationKey);
          const lastNotificationDate = lastNotification ? new Date(lastNotification) : null;

          // Don't send duplicate notifications within 6 hours for overdue tasks
          if (!lastNotificationDate || (now.getTime() - lastNotificationDate.getTime()) > 6 * 60 * 60 * 1000) {
            try {
              await notificationTriggers.notifyTaskOverdue(
                task.id,
                task.title,
                task.assignee_id,
                daysOverdue,
                task.due_date
              );

              // Store last notification time
              localStorage.setItem(lastNotificationKey, now.toISOString());
            } catch (error) {
              console.error(`Error sending overdue notification for task ${task.id}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
    }
  }, [companyId, notificationTriggers]);

  // Initialize deadline checking on mount
  useCallback(() => {
    // Check deadlines every hour
    const interval = setInterval(() => {
      checkUpcomingDeadlines();
      checkOverdueTasks();
    }, 60 * 60 * 1000); // 1 hour

    // Check immediately
    checkUpcomingDeadlines();
    checkOverdueTasks();

    return () => clearInterval(interval);
  }, [checkUpcomingDeadlines, checkOverdueTasks]);

  return {
    // Original task functionality
    tasks,
    loading,
    error,
    createTask: createTaskWithNotification,
    updateTask: updateTaskWithNotification,
    deleteTask,
    refreshTasks,

    // Additional notification functionality
    checkUpcomingDeadlines,
    checkOverdueTasks,

    // Direct access to notification triggers
    notifications: notificationTriggers
  };
}
