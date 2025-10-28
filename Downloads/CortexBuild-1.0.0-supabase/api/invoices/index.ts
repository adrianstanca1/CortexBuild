import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let invoices = [
  {
    id: 'inv-1',
    company_id: 'company-1',
    project_id: 'proj-1',
    client_id: 'client-1',
    invoice_number: 'INV-2025-001',
    status: 'sent',
    issue_date: '2025-01-15',
    due_date: '2025-02-14',
    subtotal: 125000,
    tax_rate: 8.5,
    tax_amount: 10625,
    total: 135625,
    paid_amount: 0,
    balance: 135625,
    items: [
      { description: 'Foundation work - January', quantity: 1, unit_price: 85000, amount: 85000 },
      { description: 'Steel framework materials', quantity: 1, unit_price: 40000, amount: 40000 }
    ],
    created_at: '2025-01-15T00:00:00Z'
  },
  {
    id: 'inv-2',
    company_id: 'company-1',
    project_id: 'proj-1',
    client_id: 'client-1',
    invoice_number: 'INV-2024-045',
    status: 'paid',
    issue_date: '2024-12-15',
    due_date: '2025-01-14',
    subtotal: 95000,
    tax_rate: 8.5,
    tax_amount: 8075,
    total: 103075,
    paid_amount: 103075,
    balance: 0,
    items: [
      { description: 'Site preparation', quantity: 1, unit_price: 95000, amount: 95000 }
    ],
    created_at: '2024-12-15T00:00:00Z'
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
      const { company_id, project_id, client_id, status } = req.query;
      let filteredInvoices = [...invoices];

      if (user.role !== 'super_admin') {
        filteredInvoices = filteredInvoices.filter(inv => inv.company_id === company_id);
      }

      if (company_id && user.role === 'super_admin') {
        filteredInvoices = filteredInvoices.filter(inv => inv.company_id === company_id);
      }

      if (project_id) {
        filteredInvoices = filteredInvoices.filter(inv => inv.project_id === project_id);
      }

      if (client_id) {
        filteredInvoices = filteredInvoices.filter(inv => inv.client_id === client_id);
      }

      if (status) {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
      }

      const today = new Date().toISOString().split('T')[0];

      const summary = {
        total: filteredInvoices.length,
        draft: filteredInvoices.filter(i => i.status === 'draft').length,
        sent: filteredInvoices.filter(i => i.status === 'sent').length,
        paid: filteredInvoices.filter(i => i.status === 'paid').length,
        overdue: filteredInvoices.filter(i => i.status === 'sent' && i.due_date < today).length,
        total_amount: filteredInvoices.reduce((sum, i) => sum + i.total, 0),
        paid_amount: filteredInvoices.reduce((sum, i) => sum + i.paid_amount, 0),
        outstanding: filteredInvoices.reduce((sum, i) => sum + i.balance, 0)
      };

      return res.status(200).json({ success: true, data: filteredInvoices, summary });
    }

    if (req.method === 'POST') {
      const invoiceData = req.body;

      if (!invoiceData.company_id || !invoiceData.client_id) {
        return res.status(400).json({ success: false, error: 'Company and client are required' });
      }

      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;

      const items = invoiceData.items || [];
      const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
      const taxRate = invoiceData.tax_rate || 0;
      const taxAmount = Math.round((subtotal * taxRate / 100) * 100) / 100;
      const total = subtotal + taxAmount;

      const newInvoice = {
        id: `inv-${Date.now()}`,
        company_id: invoiceData.company_id,
        project_id: invoiceData.project_id || null,
        client_id: invoiceData.client_id,
        invoice_number: invoiceNumber,
        status: invoiceData.status || 'draft',
        issue_date: invoiceData.issue_date || new Date().toISOString().split('T')[0],
        due_date: invoiceData.due_date || '',
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        paid_amount: 0,
        balance: total,
        items,
        created_at: new Date().toISOString()
      };

      invoices.push(newInvoice);

      console.log(`✅ Invoice created: ${invoiceNumber}`);

      return res.status(201).json({ success: true, data: newInvoice, message: 'Invoice created successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Invoices API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
