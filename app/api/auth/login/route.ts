import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/server/supabase';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025-production';

/**
 * POST /api/auth/login
 * Authenticates user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Hash password with SHA-256 (same as database)
    const passwordHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    console.log(`🔐 Login attempt for: ${email}`);

    // Try to authenticate using the database function
    const { data, error } = await supabase
      .rpc('authenticate_user', {
        p_email: email.toLowerCase(),
        p_password_hash: passwordHash,
      });

    if (error) {
      console.error('❌ Authentication error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!data) {
      console.log('❌ Login failed: Invalid credentials');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Parse the result
    const user = typeof data === 'string' ? JSON.parse(data) : data;

    if (!user || !user.id) {
      console.log('❌ Login failed: User not found');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId || user.company_id,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Login successful: ${user.email} (${user.role})`);

    // Return user data and token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId || user.company_id,
        status: user.status || 'active',
      },
      token,
    });
  } catch (error: any) {
    console.error('❌ Login exception:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/login
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

