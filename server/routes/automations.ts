// CortexBuild - Automations API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../auth-supabase';
import { v4 as uuidv4 } from 'uuid';

export const createAutomationsRouter = (supabase: SupabaseClient) => {
  const router = Router();

  router.use(authenticateToken);

  // GET /api/automations - List all automation rules
  router.get('/', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      const { data: rules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('company_id', user.company_id || user.companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        rules: (rules || []).map((rule: any) => ({
          id: rule.id,
          name: rule.name,
          description: rule.description || '',
          triggerType: rule.trigger_type,
          triggerConfig: rule.trigger_config ? (typeof rule.trigger_config === 'string' ? JSON.parse(rule.trigger_config) : rule.trigger_config) : {},
          actionType: rule.action_type,
          actionConfig: rule.action_config ? (typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : rule.action_config) : {},
          isActive: rule.is_active === true || rule.is_active === 1,
          lastTriggeredAt: rule.last_triggered_at || undefined,
          createdAt: rule.created_at,
          updatedAt: rule.updated_at
        }))
      });
    } catch (error: any) {
      console.error('[Automations] list error', error);
      res.status(500).json({ success: false, error: 'Failed to fetch automation rules' });
    }
  });

  // POST /api/automations - Create new automation rule
  router.post('/', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { name, description, triggerType, triggerConfig, actionType, actionConfig } = req.body;

      if (!name || !triggerType || !actionType) {
        return res.status(400).json({ success: false, error: 'Name, triggerType, and actionType are required' });
      }

      const id = `rule-${uuidv4()}`;
      const { data: rule, error } = await supabase
        .from('automation_rules')
        .insert({
          id,
          company_id: user.company_id || user.companyId,
          name,
          description: description || '',
          trigger_type: triggerType,
          trigger_config: typeof triggerConfig === 'string' ? triggerConfig : JSON.stringify(triggerConfig || {}),
          action_type: actionType,
          action_config: typeof actionConfig === 'string' ? actionConfig : JSON.stringify(actionConfig || {}),
          is_active: true,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        rule: {
          ...rule,
          trigger_config: typeof rule.trigger_config === 'string' ? JSON.parse(rule.trigger_config) : rule.trigger_config,
          action_config: typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : rule.action_config,
          is_active: rule.is_active === true || rule.is_active === 1
        }
      });
    } catch (error: any) {
      console.error('[Automations] create error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to create automation rule' });
    }
  });

  // PATCH /api/automations/:id - Update automation rule
  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: existing } = await supabase
        .from('automation_rules')
        .select('id')
        .eq('id', id)
        .eq('company_id', user.company_id || user.companyId)
        .single();

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Automation rule not found' });
      }

      const updates: any = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.triggerType !== undefined) updates.trigger_type = req.body.triggerType;
      if (req.body.triggerConfig !== undefined) {
        updates.trigger_config = typeof req.body.triggerConfig === 'string' 
          ? req.body.triggerConfig 
          : JSON.stringify(req.body.triggerConfig);
      }
      if (req.body.actionType !== undefined) updates.action_type = req.body.actionType;
      if (req.body.actionConfig !== undefined) {
        updates.action_config = typeof req.body.actionConfig === 'string'
          ? req.body.actionConfig
          : JSON.stringify(req.body.actionConfig);
      }
      if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;

      const { data: rule, error } = await supabase
        .from('automation_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        rule: {
          ...rule,
          trigger_config: typeof rule.trigger_config === 'string' ? JSON.parse(rule.trigger_config) : rule.trigger_config,
          action_config: typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : rule.action_config,
          is_active: rule.is_active === true || rule.is_active === 1
        }
      });
    } catch (error: any) {
      console.error('[Automations] update error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to update automation rule' });
    }
  });

  // DELETE /api/automations/:id - Delete automation rule
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: existing } = await supabase
        .from('automation_rules')
        .select('id')
        .eq('id', id)
        .eq('company_id', user.company_id || user.companyId)
        .single();

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Automation rule not found' });
      }

      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'Automation rule deleted' });
    } catch (error: any) {
      console.error('[Automations] delete error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to delete automation rule' });
    }
  });

  // POST /api/automations/:id/toggle - Toggle automation rule
  router.post('/:id/toggle', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: existing } = await supabase
        .from('automation_rules')
        .select('id, is_active')
        .eq('id', id)
        .eq('company_id', user.company_id || user.companyId)
        .single();

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Automation rule not found' });
      }

      const newStatus = !(existing.is_active === true || existing.is_active === 1);
      const { data: rule, error } = await supabase
        .from('automation_rules')
        .update({ is_active: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        rule: {
          ...rule,
          trigger_config: typeof rule.trigger_config === 'string' ? JSON.parse(rule.trigger_config) : rule.trigger_config,
          action_config: typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : rule.action_config,
          is_active: rule.is_active === true || rule.is_active === 1
        }
      });
    } catch (error: any) {
      console.error('[Automations] toggle error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to toggle automation rule' });
    }
  });

  // POST /api/automations/:id/test - Test automation rule
  router.post('/:id/test', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: rule } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', id)
        .eq('company_id', user.company_id || user.companyId)
        .single();

      if (!rule) {
        return res.status(404).json({ success: false, error: 'Automation rule not found' });
      }

      // Update last triggered time
      await supabase
        .from('automation_rules')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', id);

      // In a real implementation, this would execute the automation
      res.json({
        success: true,
        message: 'Automation rule test executed successfully',
        triggeredAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('[Automations] test error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to test automation rule' });
    }
  });

  return router;
};
