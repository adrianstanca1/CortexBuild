import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Mock companies data (same as in companies.ts)
let companies = [
  {
    id: 'company-1',
    name: 'ConstructCo',
    subscription_plan: 'enterprise',
    max_users: 100,
    max_projects: 50,
    is_active: 1,
    user_count: 4,
    project_count: 2,
    created_at: new Date('2024-01-15').toISOString()
  },
  {
    id: 'company-2',
    name: 'AS CLADDING AND ROOFING LTD',
    subscription_plan: 'professional',
    max_users: 50,
    max_projects: 25,
    is_active: 1,
    user_count: 1,
    project_count: 1,
    created_at: new Date('2024-02-20').toISOString()
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

  // Verify authentication
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    // Only super_admin can manage companies
    if (decoded.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    const { id } = req.query;

    // Handle PUT request - update company
    if (req.method === 'PUT') {
      const companyIndex = companies.findIndex(c => c.id === id);

      if (companyIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      const updates = req.body;
      companies[companyIndex] = {
        ...companies[companyIndex],
        ...updates,
        id: companies[companyIndex].id // Ensure ID doesn't change
      };

      console.log('✅ Company updated:', id);

      return res.status(200).json({
        success: true,
        data: companies[companyIndex],
        message: 'Company updated successfully'
      });
    }

    // Handle DELETE request - delete company
    if (req.method === 'DELETE') {
      const companyIndex = companies.findIndex(c => c.id === id);

      if (companyIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      companies.splice(companyIndex, 1);

      console.log('✅ Company deleted:', id);

      return res.status(200).json({
        success: true,
        message: 'Company deleted successfully'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error: any) {
    console.error('❌ Company API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
