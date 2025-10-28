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

    // GET - Fetch single RFI
    if (req.method === 'GET') {
      const rfi = rfis.find(r => r.id === id);

      if (!rfi) {
        return res.status(404).json({ success: false, error: 'RFI not found' });
      }

      console.log(`✅ Fetched RFI ${rfi.rfi_number}`);

      return res.status(200).json({ success: true, data: rfi });
    }

    // PUT/PATCH - Update RFI (answer, status, priority, etc.)
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const rfiIndex = rfis.findIndex(r => r.id === id);

      if (rfiIndex === -1) {
        return res.status(404).json({ success: false, error: 'RFI not found' });
      }

      const rfi = rfis[rfiIndex];
      const updates = req.body;

      // Check if answering the RFI
      const isAnswering = updates.answer && updates.answer !== rfi.answer;

      if (isAnswering) {
        updates.status = 'answered';
        updates.answered_at = new Date().toISOString();
      }

      // Check if closing the RFI
      if (updates.status === 'closed' && rfi.status !== 'answered') {
        return res.status(400).json({
          success: false,
          error: 'Cannot close unanswered RFI',
          details: 'RFI must be answered before it can be closed'
        });
      }

      // Update RFI
      rfis[rfiIndex] = {
        ...rfi,
        ...updates,
        id: rfi.id,
        project_id: rfi.project_id,
        rfi_number: rfi.rfi_number,
        submitted_by: rfi.submitted_by,
        created_at: rfi.created_at,
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Updated RFI ${rfis[rfiIndex].rfi_number}`);

      // Create activity log
      const activity = {
        type: isAnswering ? 'rfi_answered' : 'rfi_updated',
        rfi_id: rfi.id,
        rfi_number: rfi.rfi_number,
        user_id: user.userId,
        changes: updates,
        timestamp: new Date().toISOString()
      };

      // Create notification
      const notification = isAnswering ? {
        type: 'rfi_answered',
        rfi_id: rfi.id,
        rfi_number: rfi.rfi_number,
        message: `RFI ${rfi.rfi_number} has been answered: ${rfi.subject}`,
        recipient: rfi.submitted_by,
        timestamp: new Date().toISOString()
      } : null;

      return res.status(200).json({
        success: true,
        data: rfis[rfiIndex],
        activity,
        notification,
        message: isAnswering ? 'RFI answered successfully' : 'RFI updated successfully'
      });
    }

    // DELETE - Delete RFI
    if (req.method === 'DELETE') {
      const rfiIndex = rfis.findIndex(r => r.id === id);

      if (rfiIndex === -1) {
        return res.status(404).json({ success: false, error: 'RFI not found' });
      }

      const rfi = rfis[rfiIndex];

      // Check permissions - only super_admin and company_admin can delete
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Can't delete closed RFIs
      if (rfi.status === 'closed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete closed RFI',
          details: 'Closed RFIs cannot be deleted for audit trail purposes'
        });
      }

      rfis.splice(rfiIndex, 1);

      console.log(`✅ Deleted RFI ${rfi.rfi_number}`);

      // Create activity log
      const activity = {
        type: 'rfi_deleted',
        rfi_id: rfi.id,
        rfi_number: rfi.rfi_number,
        user_id: user.userId,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        activity,
        message: 'RFI deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ RFI API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
