import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let timeEntries = [
  {
    id: 'time-1',
    user_id: 'user-3',
    project_id: 'proj-1',
    task_id: 'task-1',
    description: 'Reviewed structural drawings',
    start_time: '2025-01-26T09:00:00Z',
    end_time: '2025-01-26T13:30:00Z',
    duration_minutes: 270,
    is_billable: 1,
    hourly_rate: 90,
    amount: 405,
    created_at: '2025-01-26T13:30:00Z'
  },
  {
    id: 'time-2',
    user_id: 'user-5',
    project_id: 'proj-1',
    task_id: 'task-2',
    description: 'Updated procurement schedule',
    start_time: '2025-01-26T10:00:00Z',
    end_time: '2025-01-26T12:00:00Z',
    duration_minutes: 120,
    is_billable: 1,
    hourly_rate: 110,
    amount: 220,
    created_at: '2025-01-26T12:00:00Z'
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

    if (req.method === 'GET') {
      const { user_id, project_id, start_date, end_date } = req.query;
      let filteredEntries = [...timeEntries];

      if (user_id) {
        filteredEntries = filteredEntries.filter(e => e.user_id === user_id);
      }

      if (project_id) {
        filteredEntries = filteredEntries.filter(e => e.project_id === project_id);
      }

      if (start_date) {
        filteredEntries = filteredEntries.filter(e => e.start_time >= start_date);
      }

      if (end_date) {
        filteredEntries = filteredEntries.filter(e => e.start_time <= end_date);
      }

      const summary = {
        total_entries: filteredEntries.length,
        total_hours: Math.round(filteredEntries.reduce((sum, e) => sum + e.duration_minutes, 0) / 60 * 10) / 10,
        billable_hours: Math.round(filteredEntries.filter(e => e.is_billable).reduce((sum, e) => sum + e.duration_minutes, 0) / 60 * 10) / 10,
        total_amount: filteredEntries.reduce((sum, e) => sum + e.amount, 0),
        billable_amount: filteredEntries.filter(e => e.is_billable).reduce((sum, e) => sum + e.amount, 0)
      };

      return res.status(200).json({ success: true, data: filteredEntries, summary });
    }

    if (req.method === 'POST') {
      const entryData = req.body;

      if (!entryData.project_id || !entryData.start_time) {
        return res.status(400).json({ success: false, error: 'Project and start time are required' });
      }

      // Calculate duration and amount
      let duration = 0;
      if (entryData.end_time && entryData.start_time) {
        const start = new Date(entryData.start_time).getTime();
        const end = new Date(entryData.end_time).getTime();
        duration = Math.round((end - start) / 1000 / 60); // minutes
      }

      const hourlyRate = entryData.hourly_rate || 0;
      const amount = Math.round((duration / 60) * hourlyRate * 100) / 100;

      const newEntry = {
        id: `time-${Date.now()}`,
        user_id: entryData.user_id || user.userId,
        project_id: entryData.project_id,
        task_id: entryData.task_id || null,
        description: entryData.description || '',
        start_time: entryData.start_time,
        end_time: entryData.end_time || null,
        duration_minutes: duration,
        is_billable: entryData.is_billable !== undefined ? entryData.is_billable : 1,
        hourly_rate: hourlyRate,
        amount: amount,
        created_at: new Date().toISOString()
      };

      timeEntries.push(newEntry);

      console.log(`✅ Time entry created: ${duration} minutes for project ${entryData.project_id}`);

      return res.status(201).json({ success: true, data: newEntry, message: 'Time entry created successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Time entries API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
