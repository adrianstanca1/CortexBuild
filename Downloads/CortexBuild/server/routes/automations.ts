import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { authenticateToken } from '../auth';
import { v4 as uuidv4 } from 'uuid';

export const createAutomationsRouter = (db: Database.Database) => {
  const router = Router();

  router.use(authenticateToken);

  router.get('/', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const rules = db.prepare(`
        SELECT * FROM automation_rules
        WHERE company_id = ?
        ORDER BY created_at DESC
      `).all(user.companyId);

      res.json({
        success: true,
        rules: rules.map((rule: any) => ({
          id: rule.id,
          name: rule.name,
          description: rule.description ?? '',
          triggerType: rule.trigger_type,
          triggerConfig: rule.trigger_config ? JSON.parse(rule.trigger_config) : {},
          actionType: rule.action_type,
          actionConfig: rule.action_config ? JSON.parse(rule.action_config) : {},
          isActive: rule.is_active === 1,
          lastTriggeredAt: rule.last_triggered_at ?? undefined,
          createdAt: rule.created_at,
          updatedAt: rule.updated_at
        }))
      });
    } catch (error: any) {
      console.error('[Automations] list error', error);
      res.status(500).json({ success: false, error: 'Failed to fetch automation rules' });
    }
  });

  router.post('/', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { name, description, triggerType, triggerConfig, actionType, actionConfig } = req.body;

      if (!name || !triggerType || !actionType) {
        return res.status(400).json({ success: false, error: 'Name, triggerType, and actionType are required' });
      }

      const id = `rule-${uuidv4()}`;
      db.prepare(`
        INSERT INTO automation_rules (
          id, company_id, name, description, trigger_type, trigger_config,
          action_type, action_config, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        user.companyId,
        name,
        description ?? '',
        triggerType,
        JSON.stringify(triggerConfig ?? {}),
        actionType,
        JSON.stringify(actionConfig ?? {}),
        1,
        user.id
      );

      const rule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(id);
      res.json({
        success: true,
        rule: {
          ...rule,
          trigger_config: JSON.parse(rule.trigger_config),
          action_config: JSON.parse(rule.action_config),
          is_active: rule.is_active === 1
        }
      });
    } catch (error: any) {
      console.error('[Automations] create error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to create automation rule' });
    }
  });

  router.patch('/:id', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const existing = db.prepare('SELECT * FROM automation_rules WHERE id = ? AND company_id = ?')
        .get(id, user.companyId);

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Automation rule not found' });
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (req.body.name !== undefined) {
        updates.push('name = ?');
        values.push(req.body.name);
      }
      if (req.body.description !== undefined) {
        updates.push('description = ?');
        values.push(req.body.description);
      }
      if (req.body.triggerType !== undefined) {
        updates.push('trigger_type = ?');
        values.push(req.body.triggerType);
      }
      if (req.body.triggerConfig !== undefined) {
        updates.push('trigger_config = ?');
        values.push(JSON.stringify(req.body.triggerConfig ?? {}));
      }
      if (req.body.actionType !== undefined) {
        updates.push('action_type = ?');
        values.push(req.body.actionType);
      }
      if (req.body.actionConfig !== undefined) {
        updates.push('action_config = ?');
        values.push(JSON.stringify(req.body.actionConfig ?? {}));
      }
      if (req.body.isActive !== undefined) {
        updates.push('is_active = ?');
        values.push(req.body.isActive ? 1 : 0);
      }

      if (updates.length === 0) {
        const rule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(id);
        return res.json({ success: true, rule });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id, user.companyId);

      db.prepare(`
        UPDATE automation_rules
        SET ${updates.join(', ')}
        WHERE id = ? AND company_id = ?
      `).run(...values);

      const rule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(id);
      res.json({
        success: true,
        rule: {
          ...rule,
          trigger_config: JSON.parse(rule.trigger_config),
          action_config: JSON.parse(rule.action_config),
          is_active: rule.is_active === 1
        }
      });
    } catch (error: any) {
      console.error('[Automations] update error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to update rule' });
    }
  });

  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      db.prepare('DELETE FROM automation_rules WHERE id = ? AND company_id = ?').run(id, user.companyId);
      db.prepare('DELETE FROM automation_events WHERE rule_id = ?').run(id);

      res.json({ success: true });
    } catch (error: any) {
      console.error('[Automations] delete error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to delete rule' });
    }
  });

  router.post('/:id/test', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const rule = db.prepare('SELECT * FROM automation_rules WHERE id = ? AND company_id = ?')
        .get(id, user.companyId);

      if (!rule) {
        return res.status(404).json({ success: false, error: 'Rule not found' });
      }

      const eventId = `event-${uuidv4()}`;
      db.prepare(`
        INSERT INTO automation_events (id, rule_id, status, payload)
        VALUES (?, ?, ?, ?)
      `).run(
        eventId,
        id,
        'success',
        JSON.stringify({
          simulated: true,
          executedAt: new Date().toISOString(),
          input: req.body?.payload ?? {}
        })
      );

      db.prepare(`
        UPDATE automation_rules
        SET last_triggered_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id);

      res.json({
        success: true,
        result: {
          eventId,
          ruleId: id,
          status: 'success'
        }
      });
    } catch (error: any) {
      console.error('[Automations] test error', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to test automation' });
    }
  });

  router.get('/:id/events', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const events = db.prepare(`
        SELECT * FROM automation_events
        WHERE rule_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(id);

      const rule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(id);
      if (!rule || rule.company_id !== user.companyId) {
        return res.status(404).json({ success: false, error: 'Rule not found' });
      }

      res.json({
        success: true,
        events: events.map((event: any) => ({
          id: event.id,
          status: event.status,
          payload: event.payload ? JSON.parse(event.payload) : {},
          error: event.error_message ?? undefined,
          createdAt: event.created_at
        }))
      });
    } catch (error: any) {
      console.error('[Automations] events error', error);
      res.status(500).json({ success: false, error: 'Failed to load automation events' });
    }
  });

  return router;
};
