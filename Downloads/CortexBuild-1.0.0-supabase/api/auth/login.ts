import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Hardcoded users matching the database seed data
const USERS = [
  {
    id: 'user-1',
    email: 'adrian.stanca1@gmail.com',
    password: 'Cumparavinde1',
    name: 'Adrian Stanca',
    role: 'super_admin',
    company_id: 'company-1',
    avatar: ''
  },
  {
    id: 'user-4',
    email: 'adrian@ascladdingltd.co.uk',
    password: 'lolozania1',
    name: 'Adrian Stanca',
    role: 'company_admin',
    company_id: 'company-2',
    avatar: ''
  },
  {
    id: 'user-2',
    email: 'casey@constructco.com',
    password: 'password123',
    name: 'Casey Johnson',
    role: 'company_admin',
    company_id: 'company-1',
    avatar: ''
  },
  {
    id: 'user-3',
    email: 'mike@constructco.com',
    password: 'password123',
    name: 'Mike Wilson',
    role: 'supervisor',
    company_id: 'company-1',
    avatar: ''
  },
  {
    id: 'user-5',
    email: 'dev@constructco.com',
    password: 'password123',
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    console.log('🔐 Login attempt:', email);

    // Find user by email
    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password (plain text comparison for demo)
    if (user.password !== password) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful:', user.name);

    // Return user data without password
    const { password: _, ...userData } = user;

    return res.status(200).json({
      success: true,
      user: userData,
      token
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
