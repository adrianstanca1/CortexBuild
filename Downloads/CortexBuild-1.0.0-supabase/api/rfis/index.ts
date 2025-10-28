import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let rfis = [
  {
    id: 'rfi-1',
    project_id: 'proj-1',
    rfi_number: 'RFI-001',
    subject: 'Foundation waterproofing details',
    question: 'Please clarify the waterproofing membrane specification for below-grade walls',
    answer: '',
    status: 'open',
    priority: 'high',
    submitted_by: 'user-3',
    assigned_to: 'user-2',
    due_date: '2025-02-05',
    created_at: '2025-01-25T00:00:00Z',
    answered_at: null
  },
  {
    id: 'rfi-2',
    project_id: 'proj-1',
    rfi_number: 'RFI-002',
    subject: 'Steel beam connection detail',
    question: 'Require additional detail for beam-to-column connection at grid D-4',
    answer: 'See revised structural drawings sheet S-104 dated 01/28/2025',
    status: 'answered',
    priority: 'medium',
    submitted_by: 'user-5',
    assigned_to: 'user-2',
    due_date: '2025-01-30',
    created_at: '2025-01-22T00:00:00Z',
    answered_at: '2025-01-28T00:00:00Z'
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
      const { project_id, status, priority, overdue } = req.query;
      let filteredRfis = [...rfis];

      if (project_id) {
        filteredRfis = filteredRfis.filter(r => r.project_id === project_id);
      }

      if (status) {
        filteredRfis = filteredRfis.filter(r => r.status === status);
      }

      if (priority) {
        filteredRfis = filteredRfis.filter(r => r.priority === priority);
      }

      if (overdue === 'true') {
        const today = new Date().toISOString().split('T')[0];
        filteredRfis = filteredRfis.filter(r =>
          r.status === 'open' && r.due_date && r.due_date < today
        );
      }

      const today = new Date().toISOString().split('T')[0];

      const summary = {
        total: filteredRfis.length,
        open: filteredRfis.filter(r => r.status === 'open').length,
        answered: filteredRfis.filter(r => r.status === 'answered').length,
        closed: filteredRfis.filter(r => r.status === 'closed').length,
        overdue: filteredRfis.filter(r => r.status === 'open' && r.due_date && r.due_date < today).length,
        high_priority: filteredRfis.filter(r => r.priority === 'high' || r.priority === 'critical').length,
        avg_response_time: 2.3 // days
      };

      return res.status(200).json({ success: true, data: filteredRfis, summary });
    }

    if (req.method === 'POST') {
      const rfiData = req.body;

      if (!rfiData.project_id || !rfiData.subject || !rfiData.question) {
        return res.status(400).json({ success: false, error: 'Project, subject, and question are required' });
      }

      const rfiNumber = `RFI-${String(rfis.length + 1).padStart(3, '0')}`;

      const newRfi = {
        id: `rfi-${Date.now()}`,
        project_id: rfiData.project_id,
        rfi_number: rfiNumber,
        subject: rfiData.subject,
        question: rfiData.question,
        answer: '',
        status: 'open',
        priority: rfiData.priority || 'medium',
        submitted_by: user.userId,
        assigned_to: rfiData.assigned_to || null,
        due_date: rfiData.due_date || null,
        created_at: new Date().toISOString(),
        answered_at: null
      };

      rfis.push(newRfi);

      console.log(`✅ RFI created: ${rfiNumber} - ${newRfi.subject}`);

      // Notification for assignment
      const notification = {
        type: 'rfi_created',
        rfi_id: newRfi.id,
        message: `New RFI ${rfiNumber}: ${newRfi.subject}`,
        assigned_to: newRfi.assigned_to,
        timestamp: new Date().toISOString()
      };

      return res.status(201).json({ success: true, data: newRfi, notification, message: 'RFI created successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ RFIs API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
