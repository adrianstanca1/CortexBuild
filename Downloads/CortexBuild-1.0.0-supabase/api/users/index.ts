import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let users = [
  { id: 'user-1', email: 'adrian.stanca1@gmail.com', name: 'Adrian Stanca', role: 'super_admin', company_id: 'company-1', avatar: '', is_active: 1, created_at: '2024-01-15T00:00:00Z' },
  { id: 'user-2', email: 'casey@constructco.com', name: 'Casey Johnson', role: 'company_admin', company_id: 'company-1', avatar: '', is_active: 1, created_at: '2024-01-20T00:00:00Z' },
  { id: 'user-3', email: 'mike@constructco.com', name: 'Mike Wilson', role: 'supervisor', company_id: 'company-1', avatar: '', is_active: 1, created_at: '2024-02-01T00:00:00Z' },
  { id: 'user-4', email: 'adrian@ascladdingltd.co.uk', name: 'Adrian Stanca', role: 'company_admin', company_id: 'company-2', avatar: '', is_active: 1, created_at: '2024-02-10T00:00:00Z' },
  { id: 'user-5', email: 'dev@constructco.com', name: 'Dev User', role: 'developer', company_id: 'company-1', avatar: '', is_active: 1, created_at: '2024-02-15T00:00:00Z' }
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

    // GET - Fetch users
    if (req.method === 'GET') {
      const { company_id, role, search } = req.query;
      let filteredUsers = [...users];

      // Non-super admins only see their company's users
      if (user.role !== 'super_admin') {
        filteredUsers = filteredUsers.filter(u => u.company_id === company_id);
      }

      if (company_id && user.role === 'super_admin') {
        filteredUsers = filteredUsers.filter(u => u.company_id === company_id);
      }

      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredUsers = filteredUsers.filter(u =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
        );
      }

      const stats = {
        total: filteredUsers.length,
        active: filteredUsers.filter(u => u.is_active).length,
        by_role: {
          super_admin: filteredUsers.filter(u => u.role === 'super_admin').length,
          company_admin: filteredUsers.filter(u => u.role === 'company_admin').length,
          supervisor: filteredUsers.filter(u => u.role === 'supervisor').length,
          developer: filteredUsers.filter(u => u.role === 'developer').length
        }
      };

      return res.status(200).json({ success: true, data: filteredUsers, stats });
    }

    // POST - Create user
    if (req.method === 'POST') {
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      const userData = req.body;

      if (!userData.email || !userData.name) {
        return res.status(400).json({ success: false, error: 'Email and name are required' });
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'supervisor',
        company_id: userData.company_id,
        avatar: userData.avatar || '',
        is_active: 1,
        created_at: new Date().toISOString()
      };

      users.push(newUser);

      console.log(`✅ User created: ${newUser.name}`);

      return res.status(201).json({ success: true, data: newUser, message: 'User created successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Users API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
