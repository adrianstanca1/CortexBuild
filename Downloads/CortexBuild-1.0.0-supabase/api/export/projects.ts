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

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      // Escape commas and quotes
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Mock projects data (in production, fetch from database)
const projects = [
  {
    id: 'proj-1',
    name: 'Metropolis Tower',
    company_id: 'company-1',
    client_id: 'client-1',
    status: 'active',
    priority: 'high',
    progress: 35,
    budget: 125000000,
    actual_cost: 43750000,
    start_date: '2025-01-01',
    end_date: '2026-12-31',
    health_score: 87
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
    const { format = 'json', company_id, status, include_tasks, include_milestones } = req.query;

    // Filter projects
    let filteredProjects = [...projects];

    if (user.role !== 'super_admin') {
      filteredProjects = filteredProjects.filter(p => p.company_id === company_id);
    }

    if (company_id && user.role === 'super_admin') {
      filteredProjects = filteredProjects.filter(p => p.company_id === company_id);
    }

    if (status) {
      filteredProjects = filteredProjects.filter(p => p.status === status);
    }

    // Prepare export data
    const exportData = filteredProjects.map(project => {
      const baseData = {
        ...project,
        exported_at: new Date().toISOString(),
        exported_by: user.email
      };

      // Optionally include related data
      const extendedData: any = baseData;
      
      if (include_tasks) {
        extendedData.tasks = []; // In production, fetch related tasks
      }

      if (include_milestones) {
        extendedData.milestones = []; // In production, fetch related milestones
      }
      
      return extendedData;


    });

    const filename = `projects_export_${new Date().toISOString().split('T')[0]}`;

    // Return data in requested format
    switch (format) {
      case 'csv':
        const csvData = convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        return res.status(200).send(csvData);

      case 'xlsx':
        // In production, use a library like 'xlsx' to generate Excel files
        return res.status(501).json({
          success: false,
          error: 'Excel export not yet implemented. Use CSV or JSON format.'
        });

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
            format: 'json'
          }
        });
    }

  } catch (error: any) {
    console.error('❌ Export projects API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
