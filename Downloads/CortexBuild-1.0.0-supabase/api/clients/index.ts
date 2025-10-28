import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let clients = [
  {
    id: 'client-1',
    company_id: 'company-1',
    name: 'Acme Developments',
    contact_name: 'Alice Johnson',
    email: 'alice@acme.dev',
    phone: '+1 (415) 555-1010',
    address: '100 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94103',
    payment_terms: 30,
    is_active: 1,
    total_projects: 3,
    total_revenue: 45000000,
    outstanding_balance: 1200000,
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'client-2',
    company_id: 'company-1',
    name: 'Skyline Properties',
    contact_name: 'Robert Allen',
    email: 'robert@skyline.com',
    phone: '+1 (415) 555-2020',
    address: '200 Mission St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94105',
    payment_terms: 45,
    is_active: 1,
    total_projects: 2,
    total_revenue: 28000000,
    outstanding_balance: 0,
    created_at: '2024-01-15T00:00:00Z'
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
      const { company_id, search, is_active } = req.query;
      let filteredClients = [...clients];

      if (user.role !== 'super_admin') {
        filteredClients = filteredClients.filter(c => c.company_id === company_id);
      }

      if (company_id && user.role === 'super_admin') {
        filteredClients = filteredClients.filter(c => c.company_id === company_id);
      }

      if (is_active !== undefined) {
        filteredClients = filteredClients.filter(c => c.is_active === parseInt(is_active as string));
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredClients = filteredClients.filter(c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.contact_name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower)
        );
      }

      const summary = {
        total: filteredClients.length,
        active: filteredClients.filter(c => c.is_active).length,
        total_revenue: filteredClients.reduce((sum, c) => sum + c.total_revenue, 0),
        total_outstanding: filteredClients.reduce((sum, c) => sum + c.outstanding_balance, 0),
        total_projects: filteredClients.reduce((sum, c) => sum + c.total_projects, 0)
      };

      return res.status(200).json({ success: true, data: filteredClients, summary });
    }

    if (req.method === 'POST') {
      const clientData = req.body;

      if (!clientData.name || !clientData.company_id) {
        return res.status(400).json({ success: false, error: 'Client name and company are required' });
      }

      const newClient = {
        id: `client-${Date.now()}`,
        company_id: clientData.company_id,
        name: clientData.name,
        contact_name: clientData.contact_name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        city: clientData.city || '',
        state: clientData.state || '',
        zip_code: clientData.zip_code || '',
        payment_terms: clientData.payment_terms || 30,
        is_active: 1,
        total_projects: 0,
        total_revenue: 0,
        outstanding_balance: 0,
        created_at: new Date().toISOString()
      };

      clients.push(newClient);

      console.log(`✅ Client created: ${newClient.name}`);

      return res.status(201).json({ success: true, data: newClient, message: 'Client created successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Clients API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
