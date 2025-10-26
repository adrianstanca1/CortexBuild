import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { supabaseServer, isSupabaseConfigured, handleSupabaseError } from '../utils/supabaseServer';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Fallback mock categories data (used if Supabase is not configured)
const mockCategories = [
  {
    id: 'project-management',
    name: 'Project Management',
    count: 15,
    description: 'Tools for managing construction projects',
    icon: '📋',
    slug: 'project-management',
    is_active: true
  },
  {
    id: 'financial',
    name: 'Financial',
    count: 8,
    description: 'Budgeting and expense management tools',
    icon: '💰',
    slug: 'financial',
    is_active: true
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    count: 12,
    description: 'Team communication and file sharing',
    icon: '💬',
    slug: 'collaboration',
    is_active: true
  },
  {
    id: 'analytics',
    name: 'Analytics',
    count: 6,
    description: 'Data insights and reporting tools',
    icon: '📊',
    slug: 'analytics',
    is_active: true
  },
  {
    id: 'mobile',
    name: 'Mobile',
    count: 4,
    description: 'Mobile-first construction tools',
    icon: '📱',
    slug: 'mobile',
    is_active: true
  },
  {
    id: 'safety',
    name: 'Safety',
    count: 7,
    description: 'Safety compliance and incident tracking',
    icon: '🛡️',
    slug: 'safety',
    is_active: true
  },
  {
    id: 'quality',
    name: 'Quality Control',
    count: 5,
    description: 'Quality assurance and inspection tools',
    icon: '✅',
    slug: 'quality',
    is_active: true
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    count: 9,
    description: 'Project scheduling and timeline management',
    icon: '📅',
    slug: 'scheduling',
    is_active: true
  }
];

// Verify JWT and extract user info
const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as {
    userId: string;
    email: string;
    role: string;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    // GET - Fetch all categories
    if (req.method === 'GET') {
      console.log(`📂 Fetching categories for user ${user.email}`);

      // Try Supabase first, fall back to mock data
      if (isSupabaseConfigured()) {
        try {
          // Fetch categories from Supabase
          const { data: categories, error } = await supabaseServer!
            .from('marketplace_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

          if (error) {
            console.error('Supabase error:', error);
            throw error;
          }

          // Count modules per category
          const categoriesWithCount = await Promise.all(
            (categories || []).map(async (category) => {
              const { count } = await supabaseServer!
                .from('marketplace_modules')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id)
                .eq('is_public', true)
                .eq('status', 'published');

              return {
                ...category,
                count: count || 0
              };
            })
          );

          console.log(`✅ Fetched ${categoriesWithCount.length} categories from Supabase`);

          return res.status(200).json({
            success: true,
            data: categoriesWithCount,
            source: 'supabase'
          });
        } catch (supabaseError) {
          console.warn('⚠️ Supabase failed, using mock data:', supabaseError);
          // Fall through to mock data
        }
      }

      // Use mock data as fallback
      console.log(`📦 Using mock categories data`);
      return res.status(200).json({
        success: true,
        data: mockCategories,
        source: 'mock'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('❌ Categories API error:', error);

    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
