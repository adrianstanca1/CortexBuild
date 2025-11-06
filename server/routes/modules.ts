// CortexBuild Platform - Developer Platform API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Module, ModuleReview, ApiKey, ApiResponse, PaginatedResponse } from '../types';

export function createModulesRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // ========== MODULES MARKETPLACE ==========

  // GET /api/modules - List all modules in marketplace
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        category,
        status = 'published',
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('modules')
        .select(`
          *,
          users!modules_developer_id_fkey(id, name),
          module_reviews(rating)
        `, { count: 'exact' });

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Add pagination and ordering
      query = query
        .order('downloads', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: modules, error, count } = await query;

      if (error) throw error;

      // Transform data and calculate ratings
      const transformedModules = (modules || []).map((m: any) => {
        const users = Array.isArray(m.users) ? m.users[0] : m.users;
        const reviews = m.module_reviews || [];
        const ratings = reviews.map((r: any) => r.rating).filter(Boolean);
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length 
          : 0;

        return {
          ...m,
          developer_name: users?.name || null,
          avg_rating: Math.round(avgRating * 10) / 10,
          review_count: ratings.length
        };
      });

      res.json({
        success: true,
        data: transformedModules,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get modules error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/modules/:id - Get single module with reviews
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select(`
          *,
          users!modules_developer_id_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (moduleError || !module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      // Get reviews
      const { data: reviews } = await supabase
        .from('module_reviews')
        .select(`
          *,
          users!module_reviews_user_id_fkey(id, name)
        `)
        .eq('module_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Transform data
      const users = Array.isArray(module.users) ? module.users[0] : module.users;
      const transformedReviews = (reviews || []).map((r: any) => {
        const reviewUsers = Array.isArray(r.users) ? r.users[0] : r.users;
        return {
          ...r,
          reviewer_name: reviewUsers?.name || null
        };
      });

      const transformedModule = {
        ...module,
        developer_name: users?.name || null,
        developer_email: users?.email || null,
        reviews: transformedReviews
      };

      res.json({
        success: true,
        data: transformedModule
      });
    } catch (error: any) {
      console.error('Get module error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/modules - Publish new module
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        developer_id,
        name,
        description,
        category,
        version,
        price = 0,
        repository_url,
        documentation_url
      } = req.body;

      if (!developer_id || !name || !description || !category || !version) {
        return res.status(400).json({
          success: false,
          error: 'Developer ID, name, description, category, and version are required'
        });
      }

      const { data: module, error } = await supabase
        .from('modules')
        .insert({
          developer_id,
          name,
          description,
          category,
          version,
          price,
          repository_url: repository_url || null,
          documentation_url: documentation_url || null
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: module,
        message: 'Module published successfully'
      });
    } catch (error: any) {
      console.error('Publish module error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/modules/:id - Update module
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('modules')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      const { id: _, ...updateData } = updates;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const { data: module, error } = await supabase
        .from('modules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: module,
        message: 'Module updated successfully'
      });
    } catch (error: any) {
      console.error('Update module error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/modules/:id/review - Add review to module
  router.post('/:id/review', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { user_id, rating, comment } = req.body;

      if (!user_id || !rating) {
        return res.status(400).json({
          success: false,
          error: 'User ID and rating are required'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      const { data: module } = await supabase
        .from('modules')
        .select('id')
        .eq('id', id)
        .single();

      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      const { data: review, error } = await supabase
        .from('module_reviews')
        .insert({
          module_id: id,
          user_id,
          rating,
          comment: comment || null
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: review,
        message: 'Review added successfully'
      });
    } catch (error: any) {
      console.error('Add review error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========== API KEYS MANAGEMENT ==========

  // GET /api/api-keys/list - List all API keys for user
  router.get('/api-keys/list', async (req: Request, res: Response) => {
    try {
      const { user_id } = req.query as any;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const { data: keys, error } = await supabase
        .from('api_keys')
        .select('id, user_id, name, key_prefix, permissions, created_at, last_used_at, expires_at')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: keys || []
      });
    } catch (error: any) {
      console.error('Get API keys error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/api-keys/generate - Generate new API key
  router.post('/api-keys/generate', async (req: Request, res: Response) => {
    try {
      const { user_id, name, permissions = 'read' } = req.body;

      if (!user_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'User ID and name are required'
        });
      }

      // Generate API key (in production, use crypto.randomBytes)
      const apiKey = `cbk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const keyPrefix = apiKey.substring(0, 12);

      const { data: keyData, error } = await supabase
        .from('api_keys')
        .insert({
          user_id,
          name,
          api_key: apiKey,
          key_prefix: keyPrefix,
          permissions
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: {
          id: keyData.id,
          api_key: apiKey,
          key_prefix: keyPrefix,
          name,
          permissions
        },
        message: 'API key generated successfully. Save it securely - it will not be shown again.'
      });
    } catch (error: any) {
      console.error('Generate API key error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/api-keys/:id - Revoke API key
  router.delete('/api-keys/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: key } = await supabase
        .from('api_keys')
        .select('id')
        .eq('id', id)
        .single();

      if (!key) {
        return res.status(404).json({
          success: false,
          error: 'API key not found'
        });
      }

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'API key revoked successfully'
      });
    } catch (error: any) {
      console.error('Revoke API key error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
