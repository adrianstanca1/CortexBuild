import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { supabaseServer, isSupabaseConfigured, handleSupabaseError } from '../utils/supabaseServer';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Fallback mock modules data
const mockModules = [
  {
    id: 'module-1',
    name: 'Project Management',
    description: 'Comprehensive project tracking and management',
    version: '1.0.0',
    category: 'project-management',
    price: 0,
    is_installed: true,
    rating: 4.8,
    downloads: 1250,
    features: ['Task Management', 'Progress Tracking', 'Team Collaboration'],
    screenshots: ['/screenshots/project-mgmt-1.png', '/screenshots/project-mgmt-2.png']
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
    downloads: 890,
    features: ['Budget Management', 'Expense Tracking', 'Financial Reports'],
    screenshots: ['/screenshots/financial-1.png', '/screenshots/financial-2.png']
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
    downloads: 650,
    features: ['Real-time Chat', 'File Sharing', 'Video Calls'],
    screenshots: ['/screenshots/collaboration-1.png', '/screenshots/collaboration-2.png']
  },
  {
    id: 'module-4',
    name: 'Advanced Analytics',
    description: 'AI-powered insights and reporting',
    version: '1.5.0',
    category: 'analytics',
    price: 49.99,
    is_installed: false,
    rating: 4.6,
    downloads: 420,
    features: ['AI Insights', 'Custom Reports', 'Data Visualization'],
    screenshots: ['/screenshots/analytics-1.png', '/screenshots/analytics-2.png']
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

    // GET - Fetch all modules with advanced filtering
    if (req.method === 'GET') {
      const { category, search, featured, sort } = req.query;

      console.log(`📦 Fetching modules for user ${user.email}`, { category, search, featured, sort });

      // Try Supabase first
      if (isSupabaseConfigured()) {
        try {
          let query = supabaseServer!
            .from('marketplace_modules')
            .select(`
              *,
              category:marketplace_categories(id, name, slug, icon)
            `)
            .eq('is_public', true)
            .eq('status', 'published');

          // Apply filters
          if (category) {
            const { data: categoryData } = await supabaseServer!
              .from('marketplace_categories')
              .select('id')
              .eq('slug', category as string)
              .single();

            if (categoryData) {
              query = query.eq('category_id', categoryData.id);
            }
          }

          if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
          }

          if (featured === 'true') {
            query = query.eq('is_featured', true);
          }

          // Apply sorting
          if (sort === 'popular') {
            query = query.order('downloads', { ascending: false });
          } else if (sort === 'rating') {
            query = query.order('rating_average', { ascending: false });
          } else if (sort === 'newest') {
            query = query.order('published_at', { ascending: false });
          } else {
            query = query.order('rating_average', { ascending: false });
          }

          const { data: modules, error } = await query;

          if (error) throw error;

          // Check installation status
          const { data: installations } = await supabaseServer!
            .from('user_module_installations')
            .select('module_id')
            .eq('user_id', user.userId)
            .eq('status', 'active');

          const installedIds = new Set(installations?.map(i => i.module_id) || []);

          const modulesWithStatus = (modules || []).map(module => ({
            ...module,
            is_installed: installedIds.has(module.id),
            rating: module.rating_average,
            category: module.category?.slug || module.category_id
          }));

          console.log(`✅ Fetched ${modulesWithStatus.length} modules from Supabase`);

          return res.status(200).json({
            success: true,
            data: modulesWithStatus,
            total: modulesWithStatus.length,
            source: 'supabase'
          });
        } catch (supabaseError) {
          console.warn('⚠️ Supabase failed, using mock data:', supabaseError);
        }
      }

      // Fallback to mock data
      let filteredModules = [...mockModules];

      if (category) {
        filteredModules = filteredModules.filter(m => m.category === category);
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredModules = filteredModules.filter(m =>
          m.name.toLowerCase().includes(searchLower) ||
          m.description.toLowerCase().includes(searchLower)
        );
      }
      if (featured === 'true') {
        filteredModules = filteredModules.filter(m => m.rating >= 4.7);
      }

      if (sort === 'popular') {
        filteredModules.sort((a, b) => b.downloads - a.downloads);
      } else if (sort === 'rating') {
        filteredModules.sort((a, b) => b.rating - a.rating);
      }

      console.log(`📦 Using ${filteredModules.length} mock modules`);

      return res.status(200).json({
        success: true,
        data: filteredModules,
        total: filteredModules.length,
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

      console.log(`📥 Installing module ${moduleId} for user ${user.email}`);

      if (isSupabaseConfigured()) {
        try {
          const { data: module, error: moduleError } = await supabaseServer!
            .from('marketplace_modules')
            .select('id, name, version')
            .eq('id', moduleId)
            .single();

          if (moduleError || !module) {
            return res.status(404).json({
              success: false,
              error: 'Module not found'
            });
          }

          const { data: existing } = await supabaseServer!
            .from('user_module_installations')
            .select('id')
            .eq('user_id', user.userId)
            .eq('module_id', moduleId)
            .single();

          if (existing) {
            return res.status(409).json({
              success: false,
              error: 'Module already installed'
            });
          }

          const { data: installation, error: installError } = await supabaseServer!
            .from('user_module_installations')
            .insert({
              user_id: user.userId,
              module_id: moduleId,
              version: module.version,
              installed_by: user.userId,
              installation_type: 'user',
              status: 'active',
              is_active: true
            })
            .select()
            .single();

          if (installError) throw installError;

          await supabaseServer!
            .from('module_analytics')
            .insert({
              module_id: moduleId,
              user_id: user.userId,
              event_type: 'install'
            });

          console.log(`✅ Module ${module.name} installed successfully`);

          return res.status(201).json({
            success: true,
            data: installation,
            message: 'Module installed successfully'
          });
        } catch (supabaseError) {
          console.error('Installation error:', supabaseError);
          const errorDetails = handleSupabaseError(supabaseError);
          return res.status(errorDetails.status).json({
            success: false,
            error: errorDetails.message
          });
        }
      }

      // Mock installation
      const module = mockModules.find(m => m.id === moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      return res.status(201).json({
        success: true,
        data: {
          id: `install-${Date.now()}`,
          module_id: moduleId,
          version: module.version,
          status: 'active'
        },
        message: 'Module installed successfully (mock)'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('❌ Modules API error:', error);

    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
