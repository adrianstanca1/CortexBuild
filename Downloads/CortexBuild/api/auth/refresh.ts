/**
 * Vercel Serverless Function: Refresh Token
 * POST /api/auth/refresh
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';
const TOKEN_EXPIRY = '24h';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(400).json({ 
        success: false,
        error: 'Token is required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    // Get user from database
    const { data: dbUser, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !dbUser) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Map user data
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || dbUser.email || 'User',
      role: dbUser.role,
      avatar: dbUser.avatar || '',
      company_id: dbUser.company_id || undefined,
    };

    // Generate new token
    const newToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY },
    );

    return res.status(200).json({
      success: true,
      user,
      token: newToken,
    });
  } catch (error: any) {
    console.error('❌ Token refresh error:', error);
    return res.status(403).json({
      success: false,
      error: error.message || 'Token refresh failed',
    });
  }
}

