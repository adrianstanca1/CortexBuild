// CortexBuild - Module Marketplace API Routes
// Version: 2.0.0 - Supabase Migration
// Handles module browsing, installation, and management
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import * as auth from '../auth-supabase';

export function createMarketplaceRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // Middleware to get current user from token
  const getCurrentUser = async (req: any, res: Response, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await auth.getCurrentUserByToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      req.user = user;
      next();
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Unauthorized' });
    }
  };

  // GET /api/marketplace/modules - Browse available modules
  router.get('/modules', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { category, search, sort = 'downloads' } = req.query as any;
      
      let query = supabase
        .from('modules')
        .select(`
          *,
          module_categories!modules_category_fkey(name, icon),
          module_installations!inner(module_id)
        `)
        .eq('status', 'published');

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Sorting
      if (sort === 'downloads') {
        query = query.order('downloads', { ascending: false });
      } else if (sort === 'rating') {
        query = query.order('rating', { ascending: false });
      } else if (sort === 'newest') {
        query = query.order('published_at', { ascending: false });
      } else {
        query = query.order('name');
      }

      const { data: modules, error } = await query;

      if (error) throw error;

      // Transform data and count installations
      const transformedModules = (modules || []).map((m: any) => {
        const category = Array.isArray(m.module_categories) ? m.module_categories[0] : m.module_categories;
        const installations = m.module_installations || [];
        return {
          ...m,
          category_name: category?.name || null,
          category_icon: category?.icon || null,
          install_count: installations.length
        };
      });

      res.json({ success: true, data: transformedModules });
    } catch (error: any) {
      console.error('Browse modules error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/marketplace/categories - Get all categories
  router.get('/categories', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { data: categories, error } = await supabase
        .from('module_categories')
        .select(`
          *,
          modules!inner(id)
        `)
        .eq('modules.status', 'published');

      if (error) throw error;

      // Group and count modules per category
      const transformedCategories = (categories || []).map((c: any) => {
        const modules = c.modules || [];
        return {
          ...c,
          module_count: modules.length
        };
      });

      res.json({ success: true, data: transformedCategories });
    } catch (error: any) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/marketplace/modules/:id - Get module details
  router.get('/modules/:id', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select(`
          *,
          module_categories!modules_category_fkey(name),
          module_installations!inner(module_id),
          module_reviews!inner(module_id)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (moduleError || !module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      // Get reviews and dependencies separately
      const [reviewsResult, dependenciesResult] = await Promise.all([
        supabase
          .from('module_reviews')
          .select(`
            *,
            users!module_reviews_user_id_fkey(id, name, email)
          `)
          .eq('module_id', id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('module_dependencies')
          .select(`
            *,
            modules!module_dependencies_depends_on_module_id_fkey(id, name, version)
          `)
          .eq('module_id', id)
      ]);

      // Transform data
      const category = Array.isArray(module.module_categories) ? module.module_categories[0] : module.module_categories;
      const installations = module.module_installations || [];
      const reviews = (reviewsResult.data || []).map((r: any) => {
        const users = Array.isArray(r.users) ? r.users[0] : r.users;
        return {
          ...r,
          user_name: users?.name || null,
          user_email: users?.email || null
        };
      });
      const dependencies = (dependenciesResult.data || []).map((d: any) => {
        const modules = Array.isArray(d.modules) ? d.modules[0] : d.modules;
        return {
          ...d,
          module_name: modules?.name || null,
          current_version: modules?.version || null
        };
      });

      res.json({ 
        success: true, 
        data: { 
          ...module,
          category_name: category?.name || null,
          install_count: installations.length,
          review_count: reviews.length,
          reviews, 
          dependencies 
        } 
      });
    } catch (error: any) {
      console.error('Get module details error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/marketplace/install - Install a module
  router.post('/install', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { module_id } = req.body;
      const user = (req as any).user;

      if (!module_id) {
        return res.status(400).json({ error: 'Module ID is required' });
      }

      // Check if module exists and is published
      const { data: module } = await supabase
        .from('modules')
        .select('id, name, status')
        .eq('id', module_id)
        .eq('status', 'published')
        .single();

      if (!module) {
        return res.status(404).json({ error: 'Module not found or not available' });
      }

      // Check if already installed
      const { data: existing } = await supabase
        .from('module_installations')
        .select('id')
        .eq('company_id', user.company_id)
        .eq('module_id', module_id)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Module already installed' });
      }

      // Check subscription limits
      const { data: company } = await supabase
        .from('companies')
        .select('subscription_plan')
        .eq('id', user.company_id)
        .single();

      const { count: installedCount } = await supabase
        .from('module_installations')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.company_id);

      const limits: any = {
        'free': 5,
        'starter': 15,
        'pro': 999,
        'enterprise': 999
      };

      const plan = company?.subscription_plan || 'free';
      if ((installedCount || 0) >= limits[plan]) {
        return res.status(403).json({ error: 'Module installation limit reached. Upgrade your plan.' });
      }

      // Install module
      const { error: installError } = await supabase
        .from('module_installations')
        .insert({
          company_id: user.company_id,
          module_id,
          config: {}
        });

      if (installError) throw installError;

      // Increment download count
      await supabase.rpc('increment', {
        table_name: 'modules',
        column_name: 'downloads',
        row_id: module_id,
        increment_value: 1
      }).catch(() => {
        // Fallback if RPC doesn't exist
        supabase
          .from('modules')
          .update({ downloads: supabase.raw('downloads + 1') })
          .eq('id', module_id);
      });

      // Log activity
      try {
        await supabase
          .from('activities')
          .insert({
            user_id: user.id,
            action: 'module_install',
            description: `Installed module: ${module.name}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.json({ success: true, message: 'Module installed successfully' });
    } catch (error: any) {
      console.error('Install module error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/marketplace/uninstall/:module_id - Uninstall a module
  router.delete('/uninstall/:module_id', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { module_id } = req.params;
      const user = (req as any).user;

      const { data: installation } = await supabase
        .from('module_installations')
        .select('id')
        .eq('company_id', user.company_id)
        .eq('module_id', module_id)
        .single();

      if (!installation) {
        return res.status(404).json({ error: 'Module not installed' });
      }

      // Delete installation
      const { error } = await supabase
        .from('module_installations')
        .delete()
        .eq('company_id', user.company_id)
        .eq('module_id', module_id);

      if (error) throw error;

      // Log activity
      try {
        const { data: module } = await supabase
          .from('modules')
          .select('name')
          .eq('id', module_id)
          .single();

        await supabase
          .from('activities')
          .insert({
            user_id: user.id,
            action: 'module_uninstall',
            description: `Uninstalled module: ${module?.name || module_id}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.json({ success: true, message: 'Module uninstalled successfully' });
    } catch (error: any) {
      console.error('Uninstall module error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/marketplace/installed - Get installed modules for current company
  router.get('/installed', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: installed, error } = await supabase
        .from('module_installations')
        .select(`
          *,
          modules!module_installations_module_id_fkey(id, name, description, version, category),
          module_categories!modules_category_fkey(name)
        `)
        .eq('company_id', user.company_id)
        .order('installed_at', { ascending: false });

      if (error) throw error;

      // Transform data
      const transformed = (installed || []).map((i: any) => {
        const module = Array.isArray(i.modules) ? i.modules[0] : i.modules;
        const category = Array.isArray(i.module_categories) ? i.module_categories[0] : i.module_categories;
        return {
          ...i,
          name: module?.name || null,
          description: module?.description || null,
          version: module?.version || null,
          category: module?.category || null,
          category_name: category?.name || null
        };
      });

      res.json({ success: true, data: transformed });
    } catch (error: any) {
      console.error('Get installed modules error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/marketplace/configure/:module_id - Configure module settings
  router.put('/configure/:module_id', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { module_id } = req.params;
      const { config } = req.body;
      const user = (req as any).user;

      const { data: installation } = await supabase
        .from('module_installations')
        .select('id')
        .eq('company_id', user.company_id)
        .eq('module_id', module_id)
        .single();

      if (!installation) {
        return res.status(404).json({ error: 'Module not installed' });
      }

      const { error } = await supabase
        .from('module_installations')
        .update({
          config: typeof config === 'string' ? config : JSON.stringify(config)
        })
        .eq('company_id', user.company_id)
        .eq('module_id', module_id);

      if (error) throw error;

      res.json({ success: true, message: 'Module configuration updated' });
    } catch (error: any) {
      console.error('Configure module error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
