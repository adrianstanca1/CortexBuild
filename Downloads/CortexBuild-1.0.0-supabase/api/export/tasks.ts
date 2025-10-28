import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
};

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Mock tasks data
const tasks = [
  {
    id: 'task-1',
    project_id: 'proj-1',
    title: 'Finalize structural drawings',
    description: 'Complete Level 1-5 structural steel drawings',
    status: 'in-progress',
    priority: 'high',
    progress: 65,
    assigned_to: 'user-3',
    due_date: '2025-02-15',
    created_at: '2025-01-20T00:00:00Z'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = verifyAuth(req);
    const {
      format = 'json',
      project_id,
      status,
      priority,
      assigned_to,
      date_from,
      date_to
    } = req.query;

    // Filter tasks
    let filteredTasks = [...tasks];

    if (project_id) {
      filteredTasks = filteredTasks.filter(t => t.project_id === project_id);
    }

    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status);
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === priority);
    }

    if (assigned_to) {
      filteredTasks = filteredTasks.filter(t => t.assigned_to === assigned_to);
    }

    if (date_from) {
      filteredTasks = filteredTasks.filter(t => t.created_at >= date_from);
    }

    if (date_to) {
      filteredTasks = filteredTasks.filter(t => t.created_at <= date_to);
    }

    // Prepare export data
    const exportData = filteredTasks.map(task => ({
      ...task,
      exported_at: new Date().toISOString(),
      exported_by: user.email
    }));

    const filename = `tasks_export_${new Date().toISOString().split('T')[0]}`;

    console.log(`📤 Exporting ${exportData.length} tasks in ${format} format for ${user.email}`);

    // Return data in requested format
    switch (format) {
      case 'csv':
        const csvData = convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        return res.status(200).send(csvData);

      case 'json':
      default:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        return res.status(200).json({
          success: true,
          data: exportData,
          meta: {
            total_records: exportData.length,
            exported_at: new Date().toISOString(),
            exported_by: user.email,
            format: 'json',
            filters: { project_id, status, priority, assigned_to, date_from, date_to }
          }
        });
    }

  } catch (error: any) {
    console.error('❌ Export tasks API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
