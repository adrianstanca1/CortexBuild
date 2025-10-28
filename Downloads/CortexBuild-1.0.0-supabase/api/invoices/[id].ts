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

    // GET - Fetch single invoice
    if (req.method === 'GET') {
      const invoice = invoices.find(inv => inv.id === id);

      if (!invoice) {
        return res.status(404).json({ success: false, error: 'Invoice not found' });
      }

      // Check permissions
      if (user.role !== 'super_admin' && invoice.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      console.log(`✅ Fetched invoice ${invoice.invoice_number}`);

      return res.status(200).json({ success: true, data: invoice });
    }

    // PUT/PATCH - Update invoice
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const invoiceIndex = invoices.findIndex(inv => inv.id === id);

      if (invoiceIndex === -1) {
        return res.status(404).json({ success: false, error: 'Invoice not found' });
      }

      const invoice = invoices[invoiceIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      if (user.role !== 'super_admin' && invoice.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Can't modify paid invoices
      if (invoice.status === 'paid' && !req.body.paid_amount) {
        return res.status(400).json({ success: false, error: 'Cannot modify paid invoices' });
      }

      const updates = req.body;

      // Recalculate totals if items change
      let subtotal = invoice.subtotal;
      let taxAmount = invoice.tax_amount;
      let total = invoice.total;
      let balance = invoice.balance;

      if (updates.items) {
        subtotal = updates.items.reduce((sum: number, item: any) => sum + item.amount, 0);
        const taxRate = updates.tax_rate ?? invoice.tax_rate;
        taxAmount = Math.round((subtotal * taxRate / 100) * 100) / 100;
        total = subtotal + taxAmount;
      }

      // Handle payment
      if (updates.paid_amount !== undefined) {
        const paidAmount = updates.paid_amount;
        balance = total - paidAmount;

        // Update status based on payment
        if (balance <= 0) {
          updates.status = 'paid';
          balance = 0;
        } else if (paidAmount > 0) {
          updates.status = 'partial';
        }
      }

      // Update invoice
      invoices[invoiceIndex] = {
        ...invoice,
        ...updates,
        subtotal,
        tax_amount: taxAmount,
        total,
        balance,
        id: invoice.id,
        company_id: invoice.company_id,
        invoice_number: invoice.invoice_number,
        created_at: invoice.created_at,
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Updated invoice ${invoices[invoiceIndex].invoice_number}`);

      // Create activity log
      const activity = {
        type: 'invoice_updated',
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        user_id: user.userId,
        changes: updates,
        timestamp: new Date().toISOString()
      };

      // Create notification if payment received
      const notification = updates.paid_amount > 0 ? {
        type: 'payment_received',
        invoice_id: invoice.id,
        amount: updates.paid_amount,
        message: `Payment of $${updates.paid_amount.toLocaleString()} received for ${invoice.invoice_number}`,
        timestamp: new Date().toISOString()
      } : null;

      return res.status(200).json({
        success: true,
        data: invoices[invoiceIndex],
        activity,
        notification,
        message: 'Invoice updated successfully'
      });
    }

    // DELETE - Delete invoice
    if (req.method === 'DELETE') {
      const invoiceIndex = invoices.findIndex(inv => inv.id === id);

      if (invoiceIndex === -1) {
        return res.status(404).json({ success: false, error: 'Invoice not found' });
      }

      const invoice = invoices[invoiceIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      if (user.role !== 'super_admin' && invoice.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Can't delete paid or partially paid invoices
      if (invoice.paid_amount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete invoices with payments',
          details: `Invoice has received $${invoice.paid_amount} in payments`
        });
      }

      invoices.splice(invoiceIndex, 1);

      console.log(`✅ Deleted invoice ${invoice.invoice_number}`);

      // Create activity log
      const activity = {
        type: 'invoice_deleted',
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        user_id: user.userId,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        activity,
        message: 'Invoice deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Invoice API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
