import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Mock authentication endpoint
 * POST /api/auth/login
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Mock validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Mock authentication (always succeed for demo)
    const mockUser = {
      id: 'user-' + Date.now(),
      email: email,
      firstName: email.split('@')[0],
      lastName: 'User',
      role: 'admin',
      companyId: 'company-demo-1',
      permissions: ['read', 'write', 'admin'],
    };

    const mockToken = Buffer.from(JSON.stringify({
      userId: mockUser.id,
      email: mockUser.email,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })).toString('base64');

    return res.status(200).json({
      success: true,
      token: mockToken,
      refreshToken: 'refresh-' + mockToken,
      user: mockUser,
      company: {
        id: 'company-demo-1',
        name: 'Demo Construction Inc.',
        industry: 'Construction',
      },
      availableCompanies: [
        {
          id: 'company-demo-1',
          name: 'Demo Construction Inc.',
        },
      ],
      activeCompanyId: 'company-demo-1',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
