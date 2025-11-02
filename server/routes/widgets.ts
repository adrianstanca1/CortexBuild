// CortexBuild - Widget & Dashboard API Routes
// Version: 2.0.0 - Supabase Migration
// Handles custom dashboards and widget management
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import * as auth from '../auth-supabase';

export function createWidgetsRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // Middleware to get current user
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

  // GET /api/widgets/dashboards - Get user's dashboards
  router.get('/dashboards', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: dashboards, error } = await supabase
        .from('user_dashboards')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: dashboards || [] });
    } catch (error: any) {
      console.error('Get dashboards error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/widgets/dashboards - Create new dashboard
  router.post('/dashboards', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { name, layout, is_default } = req.body;
      const user = (req as any).user;

      if (!name) {
        return res.status(400).json({ error: 'Dashboard name is required' });
      }

      // If setting as default, unset other defaults
      if (is_default) {
        await supabase
          .from('user_dashboards')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data: dashboard, error } = await supabase
        .from('user_dashboards')
        .insert({
          user_id: user.id,
          name,
          layout: typeof layout === 'string' ? layout : JSON.stringify(layout || []),
          is_default: is_default || false
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, data: dashboard });
    } catch (error: any) {
      console.error('Create dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/widgets/dashboards/:id - Update dashboard
  router.put('/dashboards/:id', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, layout, is_default } = req.body;
      const user = (req as any).user;

      const { data: dashboard } = await supabase
        .from('user_dashboards')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (layout !== undefined) {
        updateData.layout = typeof layout === 'string' ? layout : JSON.stringify(layout);
      }
      if (is_default !== undefined) {
        if (is_default) {
          await supabase
            .from('user_dashboards')
            .update({ is_default: false })
            .eq('user_id', user.id);
        }
        updateData.is_default = is_default;
      }

      const { data: updated, error } = await supabase
        .from('user_dashboards')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('Update dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/widgets/dashboards/:id - Delete dashboard
  router.delete('/dashboards/:id', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const { data: dashboard } = await supabase
        .from('user_dashboards')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      const { error } = await supabase
        .from('user_dashboards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'Dashboard deleted' });
    } catch (error: any) {
      console.error('Delete dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/widgets/dashboard/:id/widgets - Get widgets for a dashboard
  router.get('/dashboard/:id/widgets', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Verify dashboard belongs to user
      const { data: dashboard } = await supabase
        .from('user_dashboards')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      const { data: widgets, error } = await supabase
        .from('dashboard_widgets')
        .select(`
          *,
          modules!dashboard_widgets_module_id_fkey(id, name)
        `)
        .eq('dashboard_id', id)
        .order('position_y')
        .order('position_x');

      if (error) throw error;

      // Transform data
      const transformed = (widgets || []).map((w: any) => {
        const modules = Array.isArray(w.modules) ? w.modules[0] : w.modules;
        return {
          ...w,
          module_name: modules?.name || null
        };
      });

      res.json({ success: true, data: transformed });
    } catch (error: any) {
      console.error('Get widgets error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/widgets/add - Add widget to dashboard
  router.post('/add', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { dashboard_id, widget_type, module_id, title, config, position_x, position_y, width, height } = req.body;
      const user = (req as any).user;

      // Verify dashboard belongs to user
      const { data: dashboard } = await supabase
        .from('user_dashboards')
        .select('id')
        .eq('id', dashboard_id)
        .eq('user_id', user.id)
        .single();

      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      const { data: widget, error } = await supabase
        .from('dashboard_widgets')
        .insert({
          dashboard_id,
          widget_type,
          module_id: module_id || null,
          title,
          config: typeof config === 'string' ? config : JSON.stringify(config || {}),
          position_x: position_x || 0,
          position_y: position_y || 0,
          width: width || 4,
          height: height || 2
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, data: widget });
    } catch (error: any) {
      console.error('Add widget error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/widgets/:id - Update widget
  router.put('/:id', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, config, position_x, position_y, width, height, is_visible } = req.body;
      const user = (req as any).user;

      // Verify widget belongs to user's dashboard
      const { data: widget } = await supabase
        .from('dashboard_widgets')
        .select(`
          id,
          user_dashboards!dashboard_widgets_dashboard_id_fkey(user_id)
        `)
        .eq('id', id)
        .single();

      if (!widget) {
        return res.status(404).json({ error: 'Widget not found' });
      }

      // Check if dashboard belongs to user (via join)
      const dashboards = Array.isArray(widget.user_dashboards) ? widget.user_dashboards : [widget.user_dashboards];
      const belongsToUser = dashboards.some((d: any) => d?.user_id === user.id);

      if (!belongsToUser) {
        return res.status(404).json({ error: 'Widget not found' });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (config !== undefined) {
        updateData.config = typeof config === 'string' ? config : JSON.stringify(config);
      }
      if (position_x !== undefined) updateData.position_x = position_x;
      if (position_y !== undefined) updateData.position_y = position_y;
      if (width !== undefined) updateData.width = width;
      if (height !== undefined) updateData.height = height;
      if (is_visible !== undefined) updateData.is_visible = is_visible;

      const { data: updated, error } = await supabase
        .from('dashboard_widgets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('Update widget error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/widgets/:id - Remove widget
  router.delete('/:id', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Verify widget belongs to user's dashboard
      const { data: widget } = await supabase
        .from('dashboard_widgets')
        .select(`
          id,
          user_dashboards!dashboard_widgets_dashboard_id_fkey(user_id)
        `)
        .eq('id', id)
        .single();

      if (!widget) {
        return res.status(404).json({ error: 'Widget not found' });
      }

      const dashboards = Array.isArray(widget.user_dashboards) ? widget.user_dashboards : [widget.user_dashboards];
      const belongsToUser = dashboards.some((d: any) => d?.user_id === user.id);

      if (!belongsToUser) {
        return res.status(404).json({ error: 'Widget not found' });
      }

      const { error } = await supabase
        .from('dashboard_widgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'Widget removed' });
    } catch (error: any) {
      console.error('Remove widget error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/widgets/templates - Get available widget templates
  router.get('/templates', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { data: templates, error } = await supabase
        .from('widget_templates')
        .select('*')
        .eq('is_public', true)
        .order('name');

      if (error) throw error;

      res.json({ success: true, data: templates || [] });
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
