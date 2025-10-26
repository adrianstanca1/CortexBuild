import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let clients = [
  {
    id: 'client-1',
    company_id: 'company-1',
    name: 'Meridian Development Corp',
    contact_person: 'Robert Chen',
    email: 'rchen@meridiandev.com',
    phone: '+1-415-555-0182',
    address: '2400 Market Street, San Francisco, CA 94114',
    status: 'active',
    total_projects: 5,
    total_revenue: 87500000,
    outstanding_balance: 135625,
    created_at: '2024-06-15T00:00:00Z',
    notes: 'Premium client - high-rise commercial projects'
  },
  {
    id: 'client-2',
    company_id: 'company-1',
    name: 'Urban Living Properties',
    contact_person: 'Sarah Mitchell',
    email: 'sarah.m@urbanliving.com',
    phone: '+1-415-555-0193',
    address: '1850 Mission Street, San Francisco, CA 94103',
    status: 'active',
    total_projects: 3,
    total_revenue: 42000000,
    outstanding_balance: 0,
    created_at: '2024-08-22T00:00:00Z',
    notes: 'Residential development focus'
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

    // GET - Fetch single client
    if (req.method === 'GET') {
      const client = clients.find(c => c.id === id);

      if (!client) {
        return res.status(404).json({ success: false, error: 'Client not found' });
      }

      // Check permissions
      if (user.role !== 'super_admin' && client.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      console.log(`✅ Fetched client ${client.name}`);

      return res.status(200).json({ success: true, data: client });
    }

    // PUT/PATCH - Update client
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const clientIndex = clients.findIndex(c => c.id === id);

      if (clientIndex === -1) {
        return res.status(404).json({ success: false, error: 'Client not found' });
      }

      const client = clients[clientIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      if (user.role !== 'super_admin' && client.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      const updates = req.body;

      // Update client fields
      clients[clientIndex] = {
        ...client,
        ...updates,
        id: client.id, // Preserve ID
        company_id: client.company_id, // Preserve company_id
        created_at: client.created_at, // Preserve created_at
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Updated client ${clients[clientIndex].name}`);

      // Create activity log
      const activity = {
        type: 'client_updated',
        client_id: client.id,
        user_id: user.userId,
        changes: updates,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        data: clients[clientIndex],
        activity,
        message: 'Client updated successfully'
      });
    }

    // DELETE - Delete client
    if (req.method === 'DELETE') {
      const clientIndex = clients.findIndex(c => c.id === id);

      if (clientIndex === -1) {
        return res.status(404).json({ success: false, error: 'Client not found' });
      }

      const client = clients[clientIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      if (user.role !== 'super_admin' && client.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Check if client has active projects
      if (client.total_projects > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete client with active projects',
          details: `Client has ${client.total_projects} active project(s)`
        });
      }

      clients.splice(clientIndex, 1);

      console.log(`✅ Deleted client ${client.name}`);

      // Create activity log
      const activity = {
        type: 'client_deleted',
        client_id: client.id,
        user_id: user.userId,
        client_name: client.name,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        activity,
        message: 'Client deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Client API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
