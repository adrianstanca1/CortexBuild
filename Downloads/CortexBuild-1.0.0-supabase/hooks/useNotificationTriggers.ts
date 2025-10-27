/**
 * Notification Trigger Hooks
 * Automatically send notifications when specific events occur in Tasks, Projects, and Dashboard
 */

import { useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import type { 
  NotificationPriority, 
  NotificationType, 
  NotificationCategory,
  CreateNotificationRequest 
} from '../types/notifications';

interface UseNotificationTriggersProps {
  userId: string;
  companyId?: string;
}

export function useNotificationTriggers({ userId, companyId }: UseNotificationTriggersProps) {
  
  // Send notification using the enhanced API
  const sendNotification = useCallback(async (notification: CreateNotificationRequest) => {
    try {
      const response = await fetch('/api/notifications/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession()}`
        },
        body: JSON.stringify({
          ...notification,
          user_id: notification.user_id || userId,
          company_id: notification.company_id || companyId,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      return result.data;

    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }, [userId, companyId]);

  // Task-related notifications
  const notifyTaskAssigned = useCallback(async (
    taskId: string,
    taskName: string,
    assigneeId: string,
    assigneeName: string,
    projectName?: string
  ) => {
    return sendNotification({
      user_id: assigneeId,
      title: 'New Task Assigned',
      message: `You have been assigned task: ${taskName}${projectName ? ` in ${projectName}` : ''}`,
      type: 'info',
      category: 'task',
      priority: 'medium',
      channels: ['in_app', 'push'],
      action_url: `/tasks/${taskId}`,
      source_type: 'task',
      source_id: taskId,
      metadata: {
        task_id: taskId,
        task_name: taskName,
        assignee_name: assigneeName,
        project_name: projectName
      }
    });
  }, [sendNotification]);

  const notifyTaskDeadlineApproaching = useCallback(async (
    taskId: string,
    taskName: string,
    assigneeId: string,
    daysUntilDue: number,
    dueDate: string
  ) => {
    const priority: NotificationPriority = daysUntilDue <= 1 ? 'urgent' : daysUntilDue <= 3 ? 'high' : 'medium';
    
    return sendNotification({
      user_id: assigneeId,
      title: 'Task Deadline Approaching',
      message: `Task "${taskName}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
      type: 'warning',
      category: 'deadline',
      priority,
      channels: ['in_app', 'push', 'email'],
      action_url: `/tasks/${taskId}`,
      source_type: 'task',
      source_id: taskId,
      metadata: {
        task_id: taskId,
        task_name: taskName,
        days_until_due: daysUntilDue,
        due_date: dueDate
      }
    });
  }, [sendNotification]);

  const notifyTaskOverdue = useCallback(async (
    taskId: string,
    taskName: string,
    assigneeId: string,
    daysOverdue: number,
    dueDate: string
  ) => {
    return sendNotification({
      user_id: assigneeId,
      title: 'Task Overdue',
      message: `Task "${taskName}" is now ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
      type: 'error',
      category: 'deadline',
      priority: 'urgent',
      channels: ['in_app', 'push', 'email', 'sms'],
      action_url: `/tasks/${taskId}`,
      source_type: 'task',
      source_id: taskId,
      metadata: {
        task_id: taskId,
        task_name: taskName,
        days_overdue: daysOverdue,
        due_date: dueDate
      }
    });
  }, [sendNotification]);

  const notifyTaskCompleted = useCallback(async (
    taskId: string,
    taskName: string,
    assigneeId: string,
    completedByName: string,
    projectName?: string
  ) => {
    return sendNotification({
      user_id: assigneeId,
      title: 'Task Completed',
      message: `Task "${taskName}" has been completed by ${completedByName}${projectName ? ` in ${projectName}` : ''}`,
      type: 'success',
      category: 'task',
      priority: 'low',
      channels: ['in_app'],
      action_url: `/tasks/${taskId}`,
      source_type: 'task',
      source_id: taskId,
      metadata: {
        task_id: taskId,
        task_name: taskName,
        completed_by: completedByName,
        project_name: projectName
      }
    });
  }, [sendNotification]);

  const notifyTaskStatusChanged = useCallback(async (
    taskId: string,
    taskName: string,
    assigneeId: string,
    oldStatus: string,
    newStatus: string,
    changedByName: string,
    projectName?: string
  ) => {
    return sendNotification({
      user_id: assigneeId,
      title: 'Task Status Updated',
      message: `Task "${taskName}" status changed from ${oldStatus} to ${newStatus} by ${changedByName}${projectName ? ` in ${projectName}` : ''}`,
      type: 'info',
      category: 'task',
      priority: 'low',
      channels: ['in_app'],
      action_url: `/tasks/${taskId}`,
      source_type: 'task',
      source_id: taskId,
      metadata: {
        task_id: taskId,
        task_name: taskName,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedByName,
        project_name: projectName
      }
    });
  }, [sendNotification]);

  // Project-related notifications
  const notifyProjectMilestone = useCallback(async (
    projectId: string,
    projectName: string,
    milestoneName: string,
    managerId: string,
    completionPercentage: number
  ) => {
    return sendNotification({
      user_id: managerId,
      title: 'Project Milestone Reached',
      message: `Project "${projectName}" has reached ${milestoneName} milestone (${completionPercentage}% complete)`,
      type: 'success',
      category: 'milestone',
      priority: 'medium',
      channels: ['in_app', 'push'],
      action_url: `/projects/${projectId}`,
      source_type: 'project',
      source_id: projectId,
      metadata: {
        project_id: projectId,
        project_name: projectName,
        milestone_name: milestoneName,
        completion_percentage: completionPercentage
      }
    });
  }, [sendNotification]);

  const notifyProjectDeadlineApproaching = useCallback(async (
    projectId: string,
    projectName: string,
    managerId: string,
    daysUntilDue: number,
    deadline: string
  ) => {
    const priority: NotificationPriority = daysUntilDue <= 7 ? 'urgent' : daysUntilDue <= 14 ? 'high' : 'medium';
    
    return sendNotification({
      user_id: managerId,
      title: 'Project Deadline Approaching',
      message: `Project "${projectName}" deadline is approaching in ${daysUntilDue} days`,
      type: 'warning',
      category: 'deadline',
      priority,
      channels: ['in_app', 'push', 'email'],
      action_url: `/projects/${projectId}`,
      source_type: 'project',
      source_id: projectId,
      metadata: {
        project_id: projectId,
        project_name: projectName,
        days_until_due: daysUntilDue,
        deadline
      }
    });
  }, [sendNotification]);

  const notifyProjectStatusChanged = useCallback(async (
    projectId: string,
    projectName: string,
    managerId: string,
    oldStatus: string,
    newStatus: string,
    changedByName: string
  ) => {
    return sendNotification({
      user_id: managerId,
      title: 'Project Status Updated',
      message: `Project "${projectName}" status changed from ${oldStatus} to ${newStatus} by ${changedByName}`,
      type: 'info',
      category: 'project',
      priority: 'medium',
      channels: ['in_app', 'push'],
      action_url: `/projects/${projectId}`,
      source_type: 'project',
      source_id: projectId,
      metadata: {
        project_id: projectId,
        project_name: projectName,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedByName
      }
    });
  }, [sendNotification]);

  // Comment and mention notifications
  const notifyCommentMention = useCallback(async (
    commentId: string,
    mentionedUserId: string,
    mentionedByName: string,
    commentText: string,
    sourceType: 'task' | 'project' | 'file',
    sourceId: string,
    sourceName: string
  ) => {
    return sendNotification({
      user_id: mentionedUserId,
      title: 'You were mentioned in a comment',
      message: `${mentionedByName} mentioned you: "${commentText.length > 100 ? commentText.substring(0, 100) + '...' : commentText}"`,
      type: 'info',
      category: 'comment',
      priority: 'medium',
      channels: ['in_app', 'push'],
      action_url: `/${sourceType}s/${sourceId}#comment-${commentId}`,
      source_type: 'comment',
      source_id: commentId,
      metadata: {
        comment_id: commentId,
        mentioned_by: mentionedByName,
        comment_text: commentText,
        source_type: sourceType,
        source_id: sourceId,
        source_name: sourceName
      }
    });
  }, [sendNotification]);

  const notifyNewComment = useCallback(async (
    commentId: string,
    targetUserId: string,
    commentByName: string,
    commentText: string,
    sourceType: 'task' | 'project' | 'file',
    sourceId: string,
    sourceName: string
  ) => {
    return sendNotification({
      user_id: targetUserId,
      title: 'New Comment',
      message: `${commentByName} commented on ${sourceName}: "${commentText.length > 100 ? commentText.substring(0, 100) + '...' : commentText}"`,
      type: 'info',
      category: 'comment',
      priority: 'low',
      channels: ['in_app'],
      action_url: `/${sourceType}s/${sourceId}#comment-${commentId}`,
      source_type: 'comment',
      source_id: commentId,
      metadata: {
        comment_id: commentId,
        comment_by: commentByName,
        comment_text: commentText,
        source_type: sourceType,
        source_id: sourceId,
        source_name: sourceName
      }
    });
  }, [sendNotification]);

  // File sharing notifications
  const notifyFileShared = useCallback(async (
    fileId: string,
    recipientUserId: string,
    sharedByName: string,
    fileName: string,
    fileUrl: string,
    projectName?: string
  ) => {
    return sendNotification({
      user_id: recipientUserId,
      title: 'File shared with you',
      message: `${sharedByName} shared "${fileName}" with you${projectName ? ` in ${projectName}` : ''}`,
      type: 'info',
      category: 'file',
      priority: 'low',
      channels: ['in_app'],
      action_url: fileUrl,
      source_type: 'file',
      source_id: fileId,
      metadata: {
        file_id: fileId,
        file_name: fileName,
        file_url: fileUrl,
        shared_by: sharedByName,
        project_name: projectName
      }
    });
  }, [sendNotification]);

  // System notifications
  const notifySystemMaintenance = useCallback(async (
    userId: string,
    maintenanceDate: string,
    downtimeDuration: string,
    maintenanceType: string
  ) => {
    return sendNotification({
      user_id,
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${maintenanceDate}. Expected downtime: ${downtimeDuration}`,
      type: 'warning',
      category: 'system',
      priority: 'medium',
      channels: ['in_app', 'email'],
      source_type: 'system',
      metadata: {
        maintenance_date: maintenanceDate,
        downtime_duration: downtimeDuration,
        maintenance_type: maintenanceType
      }
    });
  }, [sendNotification]);

  const notifySystemUpdate = useCallback(async (
    userId: string,
    updateVersion: string,
    updateDescription: string,
    releaseDate: string
  ) => {
    return sendNotification({
      user_id,
      title: 'System Update Available',
      message: `Version ${updateVersion} is now available: ${updateDescription}`,
      type: 'info',
      category: 'system',
      priority: 'low',
      channels: ['in_app'],
      source_type: 'system',
      metadata: {
        update_version: updateVersion,
        update_description: updateDescription,
        release_date: releaseDate
      }
    });
  }, [sendNotification]);

  // Batch notifications for multiple users
  const notifyMultipleUsers = useCallback(async (
    userIds: string[],
    notification: Omit<CreateNotificationRequest, 'user_id'>
  ) => {
    const promises = userIds.map(userId => 
      sendNotification({
        ...notification,
        user_id: userId
      })
    );

    try {
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`Batch notification: ${successful} sent, ${failed} failed`);
      return { successful, failed };

    } catch (error) {
      console.error('Error sending batch notifications:', error);
      throw error;
    }
  }, [sendNotification]);

  // Company-wide notifications
  const notifyCompanyWide = useCallback(async (
    companyId: string,
    notification: Omit<CreateNotificationRequest, 'user_id' | 'company_id' | 'company_wide'>
  ) => {
    try {
      // Get all users in the company
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', companyId);

      if (error) throw error;

      if (users && users.length > 0) {
        return notifyMultipleUsers(
          users.map(u => u.id),
          {
            ...notification,
            company_id: companyId,
            company_wide: true
          }
        );
      }

    } catch (error) {
      console.error('Error sending company-wide notification:', error);
      throw error;
    }
  }, [notifyMultipleUsers]);

  return {
    // Task notifications
    notifyTaskAssigned,
    notifyTaskDeadlineApproaching,
    notifyTaskOverdue,
    notifyTaskCompleted,
    notifyTaskStatusChanged,

    // Project notifications
    notifyProjectMilestone,
    notifyProjectDeadlineApproaching,
    notifyProjectStatusChanged,

    // Comment notifications
    notifyCommentMention,
    notifyNewComment,

    // File notifications
    notifyFileShared,

    // System notifications
    notifySystemMaintenance,
    notifySystemUpdate,

    // Utility functions
    notifyMultipleUsers,
    notifyCompanyWide,
    sendNotification
  };
}
