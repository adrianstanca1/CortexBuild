import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let activities = [
  {
    id: 'act-1',
    user_id: 'user-2',
    user_name: 'Casey Johnson',
    project_id: 'proj-1',
    project_name: 'Metropolis Tower',
    entity_type: 'project',
    entity_id: 'proj-1',
    action: 'updated',
    description: 'Updated project budget from $12.2M to $12.5M',
    changes: {
      field: 'budget',
      old_value: 12200000,
      new_value: 12500000
    },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    metadata: {
      reason: 'Additional scope approved',
      approved_by: 'user-1'
    },
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'act-2',
    user_id: 'user-3',
    user_name: 'Mike Wilson',
    project_id: 'proj-1',
    project_name: 'Metropolis Tower',
    entity_type: 'task',
    entity_id: 'task-1',
    action: 'status_changed',
    description: 'Changed task status from "todo" to "in-progress"',
    changes: {
      field: 'status',
      old_value: 'todo',
      new_value: 'in-progress'
    },
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    metadata: {
      task_name: 'Finalize structural drawings'
    },
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'act-3',
    user_id: 'user-2',
    user_name: 'Casey Johnson',
    project_id: 'proj-1',
    project_name: 'Metropolis Tower',
    entity_type: 'document',
    entity_id: 'doc-1',
    action: 'uploaded',
    description: 'Uploaded new document: Structural Drawings Package A',
    changes: null,
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    metadata: {
      file_name: 'structural-package-a.pdf',
      file_size: 15728640,
      category: 'drawing'
    },
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    // GET - Fetch activity logs with filtering
    if (req.method === 'GET') {
      const { project_id, user_id, entity_type, action, start_date, end_date, search } = req.query;
      let filteredActivities = [...activities];

      if (project_id) {
        filteredActivities = filteredActivities.filter(a => a.project_id === project_id);
      }

      if (user_id) {
        filteredActivities = filteredActivities.filter(a => a.user_id === user_id);
      }

      if (entity_type) {
        filteredActivities = filteredActivities.filter(a => a.entity_type === entity_type);
      }

      if (action) {
        filteredActivities = filteredActivities.filter(a => a.action === action);
      }

      if (start_date) {
        filteredActivities = filteredActivities.filter(a =>
          new Date(a.created_at) >= new Date(start_date as string)
        );
      }

      if (end_date) {
        filteredActivities = filteredActivities.filter(a =>
          new Date(a.created_at) <= new Date(end_date as string)
        );
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredActivities = filteredActivities.filter(a =>
          a.description.toLowerCase().includes(searchLower) ||
          a.user_name.toLowerCase().includes(searchLower) ||
          a.project_name?.toLowerCase().includes(searchLower)
        );
      }

      // Sort by newest first
      filteredActivities.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const summary = {
        total: filteredActivities.length,
        by_action: {
          created: filteredActivities.filter(a => a.action === 'created').length,
          updated: filteredActivities.filter(a => a.action === 'updated').length,
          deleted: filteredActivities.filter(a => a.action === 'deleted').length,
          status_changed: filteredActivities.filter(a => a.action === 'status_changed').length,
          uploaded: filteredActivities.filter(a => a.action === 'uploaded').length,
          approved: filteredActivities.filter(a => a.action === 'approved').length
        },
        by_entity: {
          project: filteredActivities.filter(a => a.entity_type === 'project').length,
          task: filteredActivities.filter(a => a.entity_type === 'task').length,
          document: filteredActivities.filter(a => a.entity_type === 'document').length,
          invoice: filteredActivities.filter(a => a.entity_type === 'invoice').length,
          user: filteredActivities.filter(a => a.entity_type === 'user').length,
          company: filteredActivities.filter(a => a.entity_type === 'company').length
        },
        most_active_users: Object.values(
          filteredActivities.reduce((acc: any, a) => {
            if (!acc[a.user_id]) {
              acc[a.user_id] = {
                user_id: a.user_id,
                user_name: a.user_name,
                count: 0
              };
            }
            acc[a.user_id].count += 1;
            return acc;
          }, {})
        )
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5),
        timeline: {
          last_hour: filteredActivities.filter(a =>
            new Date(a.created_at) > new Date(Date.now() - 3600000)
          ).length,
          last_24_hours: filteredActivities.filter(a =>
            new Date(a.created_at) > new Date(Date.now() - 86400000)
          ).length,
          last_7_days: filteredActivities.filter(a =>
            new Date(a.created_at) > new Date(Date.now() - 604800000)
          ).length
        }
      };

      console.log(`📝 Fetched ${filteredActivities.length} activity logs for ${user.email}`);

      return res.status(200).json({ success: true, data: filteredActivities, summary });
    }

    // POST - Log new activity
    if (req.method === 'POST') {
      const activityData = req.body;

      if (!activityData.entity_type || !activityData.entity_id || !activityData.action) {
        return res.status(400).json({
          success: false,
          error: 'Entity type, entity ID, and action are required'
        });
      }

      const newActivity = {
        id: `act-${Date.now()}`,
        user_id: user.userId,
        user_name: activityData.user_name || 'Unknown User',
        project_id: activityData.project_id || null,
        project_name: activityData.project_name || null,
        entity_type: activityData.entity_type,
        entity_id: activityData.entity_id,
        action: activityData.action,
        description: activityData.description || `${activityData.action} ${activityData.entity_type}`,
        changes: activityData.changes || null,
        ip_address: activityData.ip_address || 'unknown',
        user_agent: activityData.user_agent || 'unknown',
        metadata: activityData.metadata || {},
        created_at: new Date().toISOString()
      };

      activities.push(newActivity);

      console.log(`✅ Activity logged: ${newActivity.description}`);

      return res.status(201).json({
        success: true,
        data: newActivity,
        message: 'Activity logged successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Activity API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
