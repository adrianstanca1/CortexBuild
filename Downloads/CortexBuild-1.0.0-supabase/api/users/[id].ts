import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let users = [
  {
    id: 'user-1',
    email: 'adrian.stanca1@gmail.com',
    name: 'Adrian Stanca',
    role: 'super_admin',
    company_id: 'company-1',
    avatar: '',
    phone: '+1-555-0100',
    department: 'Executive',
    title: 'Platform Administrator',
    status: 'active',
    last_login: new Date().toISOString(),
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'adrian@ascladdingltd.co.uk',
    name: 'Adrian S',
    role: 'company_admin',
    company_id: 'company-1',
    avatar: '',
    phone: '+1-555-0101',
    department: 'Management',
    title: 'Company Administrator',
    status: 'active',
    last_login: new Date().toISOString(),
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-3',
    email: 'dev@constructco.com',
    name: 'Developer User',
    role: 'developer',
    company_id: 'company-1',
    avatar: '',
    phone: '+1-555-0102',
    department: 'Technology',
    title: 'Software Developer',
    status: 'active',
    last_login: new Date().toISOString(),
    created_at: '2024-01-01T00:00:00Z'
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

    // GET - Fetch single user
    if (req.method === 'GET') {
      const targetUser = users.find(u => u.id === id);

      if (!targetUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        // Users can view their own profile
        if (user.userId !== targetUser.id) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
      }

      // Remove sensitive data
      const { password, ...userData } = targetUser as any;

      console.log(`✅ Fetched user ${userData.name}`);

      return res.status(200).json({ success: true, data: userData });
    }

    // PUT/PATCH - Update user
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const userIndex = users.findIndex(u => u.id === id);

      if (userIndex === -1) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const targetUser = users[userIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        // Users can only update their own profile
        if (user.userId !== targetUser.id) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
      }

      // Company admins can't modify users from other companies
      if (user.role === 'company_admin' && targetUser.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      const updates = req.body;

      // Prevent role escalation by non-super-admins
      if (user.role !== 'super_admin' && updates.role) {
        return res.status(403).json({ success: false, error: 'Only super admins can change user roles' });
      }

      // Prevent company_id changes by non-super-admins
      if (user.role !== 'super_admin' && updates.company_id) {
        return res.status(403).json({ success: false, error: 'Only super admins can change company assignments' });
      }

      // Update user fields
      users[userIndex] = {
        ...targetUser,
        ...updates,
        id: targetUser.id, // Preserve ID
        created_at: targetUser.created_at, // Preserve created_at
        updated_at: new Date().toISOString()
      };

      const { password, ...userData } = users[userIndex] as any;

      console.log(`✅ Updated user ${userData.name}`);

      // Create activity log
      const activity = {
        type: 'user_updated',
        user_id: targetUser.id,
        updated_by: user.userId,
        changes: updates,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        data: userData,
        activity,
        message: 'User updated successfully'
      });
    }

    // DELETE - Delete user
    if (req.method === 'DELETE') {
      const userIndex = users.findIndex(u => u.id === id);

      if (userIndex === -1) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const targetUser = users[userIndex];

      // Check permissions - only super admins and company admins can delete users
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Company admins can't delete users from other companies
      if (user.role === 'company_admin' && targetUser.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Prevent self-deletion
      if (user.userId === targetUser.id) {
        return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
      }

      // Prevent deleting super admins unless you're a super admin
      if (targetUser.role === 'super_admin' && user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Cannot delete super admin accounts' });
      }

      users.splice(userIndex, 1);

      console.log(`✅ Deleted user ${targetUser.name}`);

      // Create activity log
      const activity = {
        type: 'user_deleted',
        user_id: targetUser.id,
        deleted_by: user.userId,
        user_name: targetUser.name,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        activity,
        message: 'User deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ User API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
