/**
 * Vercel Serverless Function: Register
 * POST /api/auth/register
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
    const { email, password, firstName, lastName, role, companyId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, first name, and last name are required',
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('app_users')
      .select('id')
      .ilike('email', email)
      .single();

    if (existingUser) {
      console.log('❌ Registration failed: Email already exists');
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
      });
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('app_users')
      .insert({
        email,
        password_hash: passwordHash,
        name: `${firstName} ${lastName}`.trim(),
        role: role || 'operative',
        company_id: companyId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Registration error:', error);
      return res.status(500).json({
        success: false,
        error: 'Registration failed',
      });
    }

    // Map user data
    const user = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name || newUser.email || 'User',
      role: newUser.role,
      avatar: newUser.avatar || '',
      company_id: newUser.company_id || undefined,
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

    console.log(`✅ Registration successful: ${user.email}`);

    return res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error: any) {
    console.error('❌ Registration exception:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
}

