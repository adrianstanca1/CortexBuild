import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let purchaseOrders = [
  {
    id: 'po-1',
    company_id: 'company-1',
    project_id: 'proj-1',
    vendor_id: 'sub-1',
    vendor_name: 'Premier Steel Fabricators',
    po_number: 'PO-2025-001',
    status: 'approved',
    issue_date: '2025-01-15',
    delivery_date: '2025-02-15',
    subtotal: 450000,
    tax_amount: 38250,
    total: 488250,
    notes: 'Structural steel for levels 1-5, delivery in two shipments',
    items: [
      {
        id: 'item-1',
        description: 'W14x30 steel beams (40 units)',
        quantity: 40,
        unit: 'each',
        unit_price: 850,
        amount: 34000
      },
      {
        id: 'item-2',
        description: 'W24x84 steel beams (25 units)',
        quantity: 25,
        unit: 'each',
        unit_price: 1680,
        amount: 42000
      },
      {
        id: 'item-3',
        description: 'Steel columns and connections',
        quantity: 1,
        unit: 'lot',
        unit_price: 374000,
        amount: 374000
      }
    ],
    created_by: 'user-2',
    approved_by: 'user-2',
    approved_at: '2025-01-16T10:00:00Z',
    created_at: '2025-01-15T14:00:00Z'
  },
  {
    id: 'po-2',
    company_id: 'company-1',
    project_id: 'proj-1',
    vendor_id: 'sub-3',
    vendor_name: 'Bay Area Concrete Solutions',
    po_number: 'PO-2025-002',
    status: 'sent',
    issue_date: '2025-01-20',
    delivery_date: '2025-02-01',
    subtotal: 125000,
    tax_amount: 10625,
    total: 135625,
    notes: 'Ready-mix concrete for foundation, 5000 PSI',
    items: [
      {
        id: 'item-4',
        description: 'Ready-mix concrete 5000 PSI',
        quantity: 500,
        unit: 'cubic yards',
        unit_price: 250,
        amount: 125000
      }
    ],
    created_by: 'user-2',
    approved_by: null,
    approved_at: null,
    created_at: '2025-01-20T09:00:00Z'
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

    // GET - Fetch purchase orders
    if (req.method === 'GET') {
      const { company_id, project_id, vendor_id, status, search } = req.query;
      let filteredPOs = [...purchaseOrders];

      if (user.role !== 'super_admin') {
        filteredPOs = filteredPOs.filter(po => po.company_id === company_id);
      }

      if (company_id && user.role === 'super_admin') {
        filteredPOs = filteredPOs.filter(po => po.company_id === company_id);
      }

      if (project_id) {
        filteredPOs = filteredPOs.filter(po => po.project_id === project_id);
      }

      if (vendor_id) {
        filteredPOs = filteredPOs.filter(po => po.vendor_id === vendor_id);
      }

      if (status) {
        filteredPOs = filteredPOs.filter(po => po.status === status);
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredPOs = filteredPOs.filter(po =>
          po.po_number.toLowerCase().includes(searchLower) ||
          po.vendor_name.toLowerCase().includes(searchLower) ||
          po.notes.toLowerCase().includes(searchLower)
        );
      }

      const summary = {
        total: filteredPOs.length,
        draft: filteredPOs.filter(po => po.status === 'draft').length,
        sent: filteredPOs.filter(po => po.status === 'sent').length,
        approved: filteredPOs.filter(po => po.status === 'approved').length,
        received: filteredPOs.filter(po => po.status === 'received').length,
        cancelled: filteredPOs.filter(po => po.status === 'cancelled').length,
        total_value: filteredPOs.reduce((sum, po) => sum + po.total, 0),
        pending_approval: filteredPOs.filter(po => po.status === 'sent' && !po.approved_by).length,
        avg_po_value: Math.round(
          filteredPOs.reduce((sum, po) => sum + po.total, 0) / filteredPOs.length || 0
        ),
        by_vendor: filteredPOs.reduce((acc: any, po) => {
          const vendor = po.vendor_name;
          if (!acc[vendor]) {
            acc[vendor] = { count: 0, total_value: 0 };
          }
          acc[vendor].count += 1;
          acc[vendor].total_value += po.total;
          return acc;
        }, {})
      };

      console.log(`📦 Fetched ${filteredPOs.length} purchase orders for ${user.email}`);

      return res.status(200).json({ success: true, data: filteredPOs, summary });
    }

    // POST - Create purchase order
    if (req.method === 'POST') {
      const poData = req.body;

      if (!poData.company_id || !poData.vendor_id || !poData.items || poData.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Company, vendor, and items are required'
        });
      }

      const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

      // Calculate totals
      const subtotal = poData.items.reduce((sum: number, item: any) =>
        sum + (item.quantity * item.unit_price), 0
      );
      const taxAmount = Math.round((subtotal * (poData.tax_rate || 8.5) / 100) * 100) / 100;
      const total = subtotal + taxAmount;

      const newPO = {
        id: `po-${Date.now()}`,
        company_id: poData.company_id,
        project_id: poData.project_id || null,
        vendor_id: poData.vendor_id,
        vendor_name: poData.vendor_name || 'Unknown Vendor',
        po_number: poNumber,
        status: poData.status || 'draft',
        issue_date: poData.issue_date || new Date().toISOString().split('T')[0],
        delivery_date: poData.delivery_date || null,
        subtotal,
        tax_amount: taxAmount,
        total,
        notes: poData.notes || '',
        items: poData.items.map((item: any, index: number) => ({
          id: `item-${Date.now()}-${index}`,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'each',
          unit_price: item.unit_price,
          amount: item.quantity * item.unit_price
        })),
        created_by: user.userId,
        approved_by: null,
        approved_at: null,
        created_at: new Date().toISOString()
      };

      purchaseOrders.push(newPO);

      console.log(`✅ Purchase order created: ${poNumber} - $${total.toLocaleString()}`);

      const notification = {
        type: 'po_created',
        po_id: newPO.id,
        message: `Purchase order ${poNumber} created for ${newPO.vendor_name}`,
        amount: newPO.total,
        timestamp: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        data: newPO,
        notification,
        message: 'Purchase order created successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Purchase orders API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
