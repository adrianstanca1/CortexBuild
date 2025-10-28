import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let timeEntries = [
  {
    id: 'time-1',
    user_id: 'user-3',
    project_id: 'proj-1',
    task_id: 'task-1',
    company_id: 'company-1',
    description: 'Structural drawing revisions',
    start_time: '2025-01-26T09:00:00Z',
    end_time: '2025-01-26T17:30:00Z',
    duration_minutes: 510,
    is_billable: 1,
    hourly_rate: 125,
    amount: 1062.50,
    status: 'approved',
    approved_by: 'user-2',
    approved_at: '2025-01-26T18:00:00Z',
    created_at: '2025-01-26T17:30:00Z'
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
    const { id } = req.query;

    // GET - Fetch single time entry
    if (req.method === 'GET') {
      const entry = timeEntries.find(e => e.id === id);

      if (!entry) {
        return res.status(404).json({ success: false, error: 'Time entry not found' });
      }

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        // Users can only view their own time entries
        if (user.userId !== entry.user_id) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
      }

      console.log(`✅ Fetched time entry ${entry.id}`);

      return res.status(200).json({ success: true, data: entry });
    }

    // PUT/PATCH - Update time entry
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const entryIndex = timeEntries.findIndex(e => e.id === id);

      if (entryIndex === -1) {
        return res.status(404).json({ success: false, error: 'Time entry not found' });
      }

      const entry = timeEntries[entryIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        // Users can only update their own unapproved time entries
        if (user.userId !== entry.user_id) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        if (entry.status === 'approved') {
          return res.status(400).json({ success: false, error: 'Cannot modify approved time entries' });
        }
      }

      const updates = req.body;

      // Recalculate duration and amount if times change
      let duration = entry.duration_minutes;
      let amount = entry.amount;

      if (updates.start_time || updates.end_time) {
        const startTime = new Date(updates.start_time || entry.start_time);
        const endTime = new Date(updates.end_time || entry.end_time);
        duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      }

      const hourlyRate = updates.hourly_rate ?? entry.hourly_rate;
      const isBillable = updates.is_billable ?? entry.is_billable;
      amount = isBillable ? Math.round((duration / 60) * hourlyRate * 100) / 100 : 0;

      // Update entry
      timeEntries[entryIndex] = {
        ...entry,
        ...updates,
        duration_minutes: duration,
        amount: amount,
        id: entry.id,
        user_id: entry.user_id,
        company_id: entry.company_id,
        created_at: entry.created_at,
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Updated time entry ${timeEntries[entryIndex].id}`);

      // Create activity log
      const activity = {
        type: 'time_entry_updated',
        entry_id: entry.id,
        user_id: user.userId,
        changes: updates,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        data: timeEntries[entryIndex],
        activity,
        message: 'Time entry updated successfully'
      });
    }

    // DELETE - Delete time entry
    if (req.method === 'DELETE') {
      const entryIndex = timeEntries.findIndex(e => e.id === id);

      if (entryIndex === -1) {
        return res.status(404).json({ success: false, error: 'Time entry not found' });
      }

      const entry = timeEntries[entryIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        // Users can only delete their own unapproved time entries
        if (user.userId !== entry.user_id) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        if (entry.status === 'approved') {
          return res.status(400).json({ success: false, error: 'Cannot delete approved time entries' });
        }
      }

      timeEntries.splice(entryIndex, 1);

      console.log(`✅ Deleted time entry ${entry.id}`);

      // Create activity log
      const activity = {
        type: 'time_entry_deleted',
        entry_id: entry.id,
        user_id: user.userId,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        activity,
        message: 'Time entry deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Time entry API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
