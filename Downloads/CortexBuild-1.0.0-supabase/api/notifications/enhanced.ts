import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase/client';
import type {
  Notification,
  NotificationPreferences,
  NotificationSummary,
  NotificationFilters,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationChannel,
  NotificationPriority,
  NotificationType,
  NotificationCategory
} from '../../types/notifications';
import { sendNotificationEmail } from './email';
import { sendNotificationSMS } from './sms';
import { showNotificationFromSystem } from '../../lib/services/pushNotifications';


// Helper function to verify authentication
async function verifyAuth(req: NextApiRequest): Promise<{ userId: string; companyId?: string }> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Invalid token');
  }

  return {
    userId: user.id,
    companyId: user.user_metadata?.company_id
  };
}

// GET /api/notifications/enhanced - Fetch notifications with filters
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, companyId } = await verifyAuth(req);

    if (req.method === 'GET') {
      return await handleGetNotifications(req, res, userId, companyId);
    }

    if (req.method === 'POST') {
      return await handleCreateNotification(req, res, userId, companyId);
    }

    if (req.method === 'PUT') {
      return await handleUpdateNotification(req, res, userId);
    }

    if (req.method === 'DELETE') {
      return await handleDeleteNotification(req, res, userId);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('Notifications API error:', error);
    return res.status(error.message === 'Unauthorized' ? 401 : 500).json({
      error: error.message === 'Unauthorized' ? 'Authentication required' : 'Internal server error'
    });
  }
}

async function handleGetNotifications(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  companyId?: string
) {
  const {
    limit = '20',
    offset = '0',
    read,
    type,
    category,
    priority,
    source_type,
    date_from,
    date_to,
    include_summary = 'false'
  } = req.query;

  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply filters
    if (read !== undefined) {
      query = query.eq('read', read === 'true');
    }
    if (type) {
      query = query.in('type', (type as string).split(','));
    }
    if (category) {
      query = query.in('category', (category as string).split(','));
    }
    if (priority) {
      query = query.in('priority', (priority as string).split(','));
    }
    if (source_type) {
      query = query.in('source_type', (source_type as string).split(','));
    }
    if (date_from) {
      query = query.gte('created_at', date_from as string);
    }
    if (date_to) {
      query = query.lte('created_at', date_to as string);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw error;
    }

    let summary: NotificationSummary | null = null;

    if (include_summary === 'true') {
      summary = await generateNotificationSummary(userId);
    }

    return res.status(200).json({
      success: true,
      data: notifications || [],
      summary,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        has_more: (notifications?.length || 0) === parseInt(limit as string)
      }
    });

  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleCreateNotification(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  companyId?: string
) {
  const body: CreateNotificationRequest = req.body;

  if (!body.user_id || (!body.message && !body.template_name)) {
    return res.status(400).json({ error: 'User ID and message or template are required' });
  }

  try {
    // Get template if provided
    let template = null;
    if (body.template_name) {
      const { data: templateData, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('name', body.template_name)
        .eq('is_active', true)
        .single();

      if (templateError && templateError.code !== 'PGRST116') {
        throw templateError;
      }
      template = templateData;
    }

    // Prepare notification data
    const notificationData = {
      user_id: body.user_id,
      company_id: body.company_id || companyId,
      title: body.title || template?.title_template || 'Notification',
      message: body.message || template?.message_template || 'You have a new notification',
      type: body.type || template?.type || 'info',
      category: body.category || template?.category || 'system',
      priority: body.priority || template?.priority || 'medium',
      channels: body.channels || template?.channels || ['in_app'],
      action_url: body.action_url,
      metadata: body.metadata || {},
      expires_at: body.expires_at,
      source_type: body.source_type || 'system',
      source_id: body.source_id,
      company_wide: body.company_wide || false,
    };

    // Insert notification
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Create channel delivery records
    const channelRecords = (notificationData.channels as NotificationChannel[]).map(channel => ({
      notification_id: notification.id,
      channel,
      status: 'pending' as const
    }));

    if (channelRecords.length > 0) {
      const { error: channelError } = await supabase
        .from('notification_channels')
        .insert(channelRecords);

      if (channelError) {
        console.error('Error creating channel records:', channelError);
      }
    }

    // TODO: Trigger actual channel deliveries (email, push, SMS)
    // TODO: Trigger actual channel deliveries (email, push, SMS)
    await triggerChannelDeliveries(notification, notificationData.channels as NotificationChannel[]);

    return res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });

  } catch (error: any) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleUpdateNotification(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id, updates } = req.body as { id: string; updates: UpdateNotificationRequest };

  if (!id) {
    return res.status(400).json({ error: 'Notification ID is required' });
  }

  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.read !== undefined) {
      updateData.read = updates.read;
      if (updates.read) {
        updateData.clicked_at = new Date().toISOString();
      }
    }

    if (updates.dismissed !== undefined) {
      updateData.dismissed_at = updates.dismissed ? new Date().toISOString() : null;
    }

    if (updates.clicked !== undefined) {
      updateData.clicked_at = updates.clicked ? new Date().toISOString() : null;
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleDeleteNotification(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Notification ID is required' });
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function generateNotificationSummary(userId: string): Promise<NotificationSummary> {
  const { data, error } = await supabase
    .from('notifications')
    .select('type, category, priority, read')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  const summary: NotificationSummary = {
    total: data.length,
    unread: data.filter(n => !n.read).length,
    high_priority: data.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
    by_type: {} as Record<string, number>,
    by_category: {} as Record<NotificationCategory, number>,
    by_priority: {} as Record<NotificationPriority, number>,
  };

  // Count by type
  const typeCounts: Record<string, number> = {};
  data.forEach(n => {
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
  });
  summary.by_type = typeCounts;

  // Count by category
  const categoryCounts: Record<NotificationCategory, number> = {
    project: 0, task: 0, invoice: 0, system: 0, chat: 0, comment: 0, file: 0, milestone: 0, deadline: 0, integration: 0
  };
  data.forEach(n => {
    if (n.category in categoryCounts) {
      categoryCounts[n.category as NotificationCategory]++;
    }
  });
  summary.by_category = categoryCounts;

  // Count by priority
  const priorityCounts: Record<NotificationPriority, number> = {
    low: 0, medium: 0, high: 0, urgent: 0
  };
  data.forEach(n => {
    priorityCounts[n.priority as NotificationPriority]++;
  });
  summary.by_priority = priorityCounts;

  return summary;
}

// Additional API routes for preferences and templates

// GET /api/notifications/preferences - Get user preferences
export async function getPreferences(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = await verifyAuth(req);

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data || null
    });

  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/notifications/preferences - Update user preferences
export async function updatePreferences(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = await verifyAuth(req);
    const preferences: Partial<NotificationPreferences> = req.body;

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data,
      message: 'Preferences updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/notifications/templates - Get available templates
export async function getTemplates(req: NextApiRequest, res: NextApiResponse) {
  try {
    await verifyAuth(req); // Just verify auth, no user-specific filtering for templates

    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function markAllAsRead(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = await verifyAuth(req);

    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        clicked_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error: any) {
    console.error('Error marking all as read:', error);
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/notifications/unread-count - Get unread count
export async function getUnreadCount(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = await verifyAuth(req);

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: { count: count || 0 }
    });

  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return res.status(500).json({ error: error.message });
  }
}


// Function to trigger channel deliveries
async function triggerChannelDeliveries(notification: any, channels: NotificationChannel[]): Promise<void> {
  const deliveryPromises: Promise<void>[] = [];

  // Get user email and phone from database
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("email, phone")
    .eq("id", notification.user_id)
    .single();

  if (userError) {
    console.error("Error fetching user data for notifications:", userError);
    return;
  }

  for (const channel of channels) {
    switch (channel) {
      case "email":
        if (userData?.email) {
          deliveryPromises.push(
            sendNotificationEmail(
              userData.email,
              notification.title,
              {
                title: notification.title,
                message: notification.message,
                actionUrl: notification.action_url,
                priority: notification.priority
              }
            ).then(success => {
              if (success) {
                updateChannelStatus(notification.id, channel, "sent");
              } else {
                updateChannelStatus(notification.id, channel, "failed");
              }
            })
          );
        }
        break;

      case "sms":
        if (userData?.phone) {
          deliveryPromises.push(
            sendNotificationSMS(
              userData.phone,
              notification.message,
              {
                priority: notification.priority,
                actionUrl: notification.action_url
              }
            ).then(success => {
              if (success) {
                updateChannelStatus(notification.id, channel, "sent");
              } else {
                updateChannelStatus(notification.id, channel, "failed");
              }
            })
          );
        }
        break;

      case "push":
        // Push notifications are handled by the client-side service
        deliveryPromises.push(
          showNotificationFromSystem(notification).then(() => {
            updateChannelStatus(notification.id, channel, "delivered");
          }).catch(() => {
            updateChannelStatus(notification.id, channel, "failed");
          })
        );
        break;

      case "in_app":
        // In-app notifications are already created in the database
        updateChannelStatus(notification.id, channel, "delivered");
        break;
    }
  }

  // Execute all deliveries concurrently
  await Promise.allSettled(deliveryPromises);
  console.log(`📨 Notification deliveries triggered for ${channels.join(", ")}`);
}

// Helper function to update channel delivery status
async function updateChannelStatus(notificationId: string, channel: NotificationChannel, status: string): Promise<void> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === "sent") {
      updateData.sent_at = new Date().toISOString();
    } else if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === "failed") {
      updateData.failed_at = new Date().toISOString();
    }

    await supabase
      .from("notification_channels")
      .update(updateData)
      .eq("notification_id", notificationId)
      .eq("channel", channel);
  } catch (error) {
    console.error("Error updating channel status:", error);
  }
}

