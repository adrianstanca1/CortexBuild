import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let purchaseOrders = [
  {
    id: 'po-1',
    company_id: 'company-1',
    project_id: 'proj-1',
    po_number: 'PO-2025-001',
    vendor_name: 'Precision Steel Fabricators',
    vendor_id: 'sub-1',
    status: 'approved',
    issue_date: '2025-01-20',
    delivery_date: '2025-02-15',
    total_amount: 850000,
    items: [
      { description: 'Structural steel beams - W24x84', quantity: 120, unit_price: 4200, amount: 504000 },
      { description: 'Steel columns - W14x90', quantity: 80, unit_price: 3800, amount: 304000 },
      { description: 'Connection plates and hardware', quantity: 1, unit_price: 42000, amount: 42000 }
    ],
    created_by: 'user-2',
    approved_by: 'user-2',
    approved_at: '2025-01-20T14:00:00Z',
    created_at: '2025-01-20T10:00:00Z'
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

    // GET - Fetch single purchase order
    if (req.method === 'GET') {
      const po = purchaseOrders.find(p => p.id === id);

      if (!po) {
        return res.status(404).json({ success: false, error: 'Purchase order not found' });
      }

      // Check permissions
      if (user.role !== 'super_admin' && po.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      console.log(`✅ Fetched purchase order ${po.po_number}`);

      return res.status(200).json({ success: true, data: po });
    }

    // PUT/PATCH - Update purchase order
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const poIndex = purchaseOrders.findIndex(p => p.id === id);

      if (poIndex === -1) {
        return res.status(404).json({ success: false, error: 'Purchase order not found' });
      }

      const po = purchaseOrders[poIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      if (user.role !== 'super_admin' && po.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Can't modify approved POs (except status changes)
      if (po.status === 'approved' && req.body.items) {
        return res.status(400).json({
          success: false,
          error: 'Cannot modify approved purchase orders',
          details: 'Create a new PO or cancel this one'
        });
      }

      const updates = req.body;

      // Recalculate total if items change
      if (updates.items) {
        updates.total_amount = updates.items.reduce((sum: number, item: any) => sum + item.amount, 0);
      }

      // Handle approval
      const isApproving = updates.status === 'approved' && po.status !== 'approved';
      if (isApproving) {
        updates.approved_by = user.userId;
        updates.approved_at = new Date().toISOString();
      }

      // Handle rejection
      const isRejecting = updates.status === 'rejected' && po.status !== 'rejected';
      if (isRejecting) {
        updates.rejected_by = user.userId;
        updates.rejected_at = new Date().toISOString();
        updates.rejection_reason = updates.rejection_reason || 'Not specified';
      }

      // Update purchase order
      purchaseOrders[poIndex] = {
        ...po,
        ...updates,
        id: po.id,
        company_id: po.company_id,
        po_number: po.po_number,
        created_by: po.created_by,
        created_at: po.created_at,
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Updated purchase order ${purchaseOrders[poIndex].po_number}`);

      // Create activity log
      const activity = {
        type: isApproving ? 'po_approved' : isRejecting ? 'po_rejected' : 'po_updated',
        po_id: po.id,
        po_number: po.po_number,
        user_id: user.userId,
        changes: updates,
        timestamp: new Date().toISOString()
      };

      // Create notification for approval/rejection
      const notification = (isApproving || isRejecting) ? {
        type: isApproving ? 'po_approved' : 'po_rejected',
        po_id: po.id,
        po_number: po.po_number,
        message: `Purchase order ${po.po_number} has been ${updates.status}${isRejecting ? ': ' + updates.rejection_reason : ''}`,
        recipient: po.created_by,
        timestamp: new Date().toISOString()
      } : null;

      return res.status(200).json({
        success: true,
        data: purchaseOrders[poIndex],
        activity,
        notification,
        message: 'Purchase order updated successfully'
      });
    }

    // DELETE - Delete purchase order
    if (req.method === 'DELETE') {
      const poIndex = purchaseOrders.findIndex(p => p.id === id);

      if (poIndex === -1) {
        return res.status(404).json({ success: false, error: 'Purchase order not found' });
      }

      const po = purchaseOrders[poIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      if (user.role !== 'super_admin' && po.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Can't delete approved or received POs
      if (po.status === 'approved' || po.status === 'received') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete approved or received purchase orders',
          details: 'Please cancel the PO instead'
        });
      }

      purchaseOrders.splice(poIndex, 1);

      console.log(`✅ Deleted purchase order ${po.po_number}`);

      // Create activity log
      const activity = {
        type: 'po_deleted',
        po_id: po.id,
        po_number: po.po_number,
        user_id: user.userId,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        activity,
        message: 'Purchase order deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Purchase order API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
