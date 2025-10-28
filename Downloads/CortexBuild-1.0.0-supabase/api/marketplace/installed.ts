import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { supabaseServer, isSupabaseConfigured, handleSupabaseError } from '../utils/supabaseServer';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Fallback mock installed modules data
const mockInstalledModules = [
  {
    id: 'module-1',
    name: 'Project Management',
    version: '1.0.0',
    status: 'active',
    installed_at: '2025-01-15T10:00:00Z',
    category: 'project-management'
  },
  {
    id: 'module-2',
    name: 'Financial Tracking',
    version: '1.2.0',
    status: 'active',
    installed_at: '2025-01-20T14:30:00Z',
    category: 'financial'
  }
];

const modules = [
  {
    id: 'module-1',
    name: 'Project Management',
    description: 'Comprehensive project tracking and management',
    version: '1.0.0',
    category: 'project-management',
    price: 0,
    is_installed: true,
    rating: 4.8,
    downloads: 1250
  },
  {
    id: 'module-2',
    name: 'Financial Tracking',
    description: 'Advanced budgeting and expense management',
    version: '1.2.0',
    category: 'financial',
    price: 29.99,
    is_installed: true,
    rating: 4.9,
    downloads: 890
  },
  {
    id: 'module-3',
    name: 'Team Collaboration',
    description: 'Real-time communication and file sharing',
    version: '2.0.0',
    category: 'collaboration',
    price: 19.99,
    is_installed: false,
    rating: 4.7,
    downloads: 650
  }
];

const categories = [
  { id: 'project-management', name: 'Project Management', count: 15 },
  { id: 'financial', name: 'Financial', count: 8 },
  { id: 'collaboration', name: 'Collaboration', count: 12 },
  { id: 'analytics', name: 'Analytics', count: 6 },
  { id: 'mobile', name: 'Mobile', count: 4 }
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

    // GET - Fetch installed modules
    if (req.method === 'GET') {
      console.log(`📦 Fetching installed modules for user ${user.email}`);

      // Try Supabase first
      if (isSupabaseConfigured()) {
        try {
          const { data: installations, error } = await supabaseServer!
            .from('user_module_installations')
            .select(`
              *,
              module:marketplace_modules(
                id,
                name,
                description,
                version,
                icon,
                category:marketplace_categories(id, name, slug, icon)
              )
            `)
            .eq('user_id', user.userId)
            .eq('status', 'active')
            .order('installed_at', { ascending: false });

          if (error) throw error;

          const formattedInstallations = (installations || []).map((inst: any) => ({
            id: inst.module.id,
            installation_id: inst.id,
            name: inst.module.name,
            description: inst.module.description,
            version: inst.version,
            status: inst.status,
            installed_at: inst.installed_at,
            last_used_at: inst.last_used_at,
            category: inst.module.category?.slug || '',
            icon: inst.module.icon
          }));

          console.log(`✅ Fetched ${formattedInstallations.length} installed modules from Supabase`);

          return res.status(200).json({
            success: true,
            data: formattedInstallations,
            source: 'supabase'
          });
        } catch (supabaseError) {
          console.warn('⚠️ Supabase failed, using mock data:', supabaseError);
        }
      }

      // Fallback to mock data
      console.log(`📦 Using mock installed modules`);
      return res.status(200).json({
        success: true,
        data: mockInstalledModules,
        source: 'mock'
      });
    }

    // POST - Install module
    if (req.method === 'POST') {
      const { moduleId } = req.body;

      if (!moduleId) {
        return res.status(400).json({
          success: false,
          error: 'Module ID is required'
        });
      }

      const module = modules.find(m => m.id === moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      const installedModule = {
        id: module.id,
        name: module.name,
        version: module.version,
        status: 'active',
        installed_at: new Date().toISOString(),
        category: module.category
      };

      installedModules.push(installedModule);

      console.log(`✅ Module installed: ${module.name} by ${user.email}`);

      return res.status(201).json({
        success: true,
        data: installedModule,
        message: 'Module installed successfully'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('❌ Marketplace API error:', error);

    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
