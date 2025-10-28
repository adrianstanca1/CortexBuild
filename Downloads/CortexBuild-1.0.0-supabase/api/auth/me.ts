import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Hardcoded users matching the database seed data
const USERS = [
  {
    id: 'user-1',
    email: 'adrian.stanca1@gmail.com',
    name: 'Adrian Stanca',
    role: 'super_admin',
    company_id: 'company-1',
    avatar: ''
  },
  {
    id: 'user-4',
    email: 'adrian@ascladdingltd.co.uk',
    name: 'Adrian Stanca',
    role: 'company_admin',
    company_id: 'company-2',
    avatar: ''
  },
  {
    id: 'user-2',
    email: 'casey@constructco.com',
    name: 'Casey Johnson',
    role: 'company_admin',
    company_id: 'company-1',
    avatar: ''
  },
  {
    id: 'user-3',
    email: 'mike@constructco.com',
    name: 'Mike Wilson',
    role: 'supervisor',
    company_id: 'company-1',
    avatar: ''
  },
  {
    id: 'user-5',
    email: 'dev@constructco.com',
    name: 'Dev User',
    role: 'developer',
    company_id: 'company-1',
    avatar: ''
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    // Find user by ID
    const user = USERS.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User authenticated:', user.name);

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
}
