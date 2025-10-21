/**
 * Vercel Serverless Function: Login
 * POST /api/auth/login
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Get user by email
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();

    if (userError || !dbUser) {
      console.log('❌ Login failed: User not found', userError);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    console.log('✅ User found:', dbUser.email);
    console.log('🔐 Password hash from DB:', dbUser.password_hash);
    console.log('🔐 Password provided:', password);

    // Verify password using bcrypt
    const isValid = await bcrypt.compare(password, dbUser.password_hash);
    console.log('🔐 Password valid:', isValid);

    if (!isValid) {
      console.log('❌ Login failed: Invalid password');
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Map user data - convert snake_case to camelCase for frontend
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || dbUser.email || 'User',
      role: dbUser.role || 'super_admin',
      avatar: dbUser.avatar || '',
      companyId: dbUser.company_id || undefined,
    };

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY },
    );

    console.log(`✅ Login successful: ${user.email} (${user.role})`);

    return res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error: any) {
    console.error('❌ Login exception:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
}

