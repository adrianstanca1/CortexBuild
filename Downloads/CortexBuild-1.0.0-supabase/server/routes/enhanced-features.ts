/**
 * Enhanced Features API Routes
 * Handles chat history, notifications, audit logs, and construction-specific features
 */

import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import { getCurrentUser } from '../auth';
import { v4 as uuidv4 } from 'uuid';

export function createEnhancedFeaturesRoutes(db: Database) {
  const router = Router();

  // ============================================
  // CHAT HISTORY API
  // ============================================

  // Save chat message to history
  router.post('/chat/history', getCurrentUser, async (req, res) => {
    try {
      const { conversationId, role, content, metadata } = req.body;
      const user = (req as any).user;

      if (!conversationId || !role || !content) {
        return res.status(400).json({ error: 'conversationId, role, and content are required' });
      }

      const id = uuidv4();

      db.prepare(`
        INSERT INTO chat_history (id, user_id, company_id, conversation_id, role, content, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        id,
        user.userId,
        user.companyId,
        conversationId,
        role,
        content,
        metadata ? JSON.stringify(metadata) : null
      );

      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Save chat history error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get conversation history
  router.get('/chat/history/:conversationId', getCurrentUser, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const user = (req as any).user;

      const messages = db.prepare(`
        SELECT * FROM chat_history
        WHERE conversation_id = ? AND company_id = ?
        ORDER BY created_at ASC
      `).all(conversationId, user.companyId);

      res.json({ success: true, messages });
    } catch (error: any) {
      console.error('Get chat history error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all user conversations
  router.get('/chat/conversations', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;

      const conversations = db.prepare(`
        SELECT
          conversation_id,
          COUNT(*) as message_count,
          MAX(created_at) as last_message_at,
          MIN(created_at) as started_at
        FROM chat_history
        WHERE user_id = ?
        GROUP BY conversation_id
        ORDER BY last_message_at DESC
        LIMIT 50
      `).all(user.userId);

      res.json({ success: true, conversations });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete conversation
  router.delete('/chat/history/:conversationId', getCurrentUser, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const user = (req as any).user;

      db.prepare(`
        DELETE FROM chat_history
        WHERE conversation_id = ? AND user_id = ?
      `).run(conversationId, user.userId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // NOTIFICATIONS API
  // ============================================

  // Get user notifications
  router.get('/notifications', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { unreadOnly, limit = 50 } = req.query;

      let query = `
        SELECT * FROM notifications
        WHERE user_id = ?
      `;

      if (unreadOnly === 'true') {
        query += ' AND is_read = 0';
      }

      query += ' ORDER BY created_at DESC LIMIT ?';

      const notifications = db.prepare(query).all(user.userId, Number(limit));

      res.json({ success: true, notifications });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create notification
  router.post('/notifications', getCurrentUser, async (req, res) => {
    try {
      const { userId, type, title, message, link, priority, metadata } = req.body;
      const user = (req as any).user;

      const id = uuidv4();

      db.prepare(`
        INSERT INTO notifications (
          id, user_id, company_id, type, title, message, link, priority, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        id,
        userId || user.userId,
        user.companyId,
        type,
        title,
        message,
        link || null,
        priority || 'normal',
        metadata ? JSON.stringify(metadata) : null
      );

      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Create notification error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Mark notification as read
  router.put('/notifications/:id/read', getCurrentUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      db.prepare(`
        UPDATE notifications
        SET is_read = 1, read_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `).run(id, user.userId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Mark all notifications as read
  router.put('/notifications/mark-all-read', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;

      db.prepare(`
        UPDATE notifications
        SET is_read = 1, read_at = datetime('now')
        WHERE user_id = ? AND is_read = 0
      `).run(user.userId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete notification
  router.delete('/notifications/:id', getCurrentUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      db.prepare(`
        DELETE FROM notifications
        WHERE id = ? AND user_id = ?
      `).run(id, user.userId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // AUDIT LOGS API
  // ============================================

  // Create audit log entry
  function createAuditLog(params: {
    userId: string;
    companyId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const id = uuidv4();

    db.prepare(`
      INSERT INTO audit_logs (
        id, user_id, company_id, action, entity_type, entity_id, changes, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      id,
      params.userId,
      params.companyId,
      params.action,
      params.entityType,
      params.entityId,
      params.changes ? JSON.stringify(params.changes) : null,
      params.ipAddress || null,
      params.userAgent || null
    );

    return id;
  }

  // Get audit logs
  router.get('/audit-logs', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { entityType, entityId, action, limit = 100 } = req.query;

      let query = `SELECT * FROM audit_logs WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (entityType) {
        query += ' AND entity_type = ?';
        params.push(entityType);
      }

      if (entityId) {
        query += ' AND entity_id = ?';
        params.push(entityId);
      }

      if (action) {
        query += ' AND action = ?';
        params.push(action);
      }

      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(Number(limit));

      const logs = db.prepare(query).all(...params);

      res.json({ success: true, logs });
    } catch (error: any) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // CHANGE ORDERS API
  // ============================================

  // Get change orders
  router.get('/change-orders', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, status } = req.query;

      let query = `SELECT * FROM change_orders WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const changeOrders = db.prepare(query).all(...params);

      res.json({ success: true, changeOrders });
    } catch (error: any) {
      console.error('Get change orders error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create change order
  router.post('/change-orders', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        projectId,
        coNumber,
        title,
        description,
        reason,
        costImpact,
        scheduleImpactDays
      } = req.body;

      const result = db.prepare(`
        INSERT INTO change_orders (
          company_id, project_id, co_number, title, description, reason,
          cost_impact, schedule_impact_days, requested_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        user.companyId,
        projectId,
        coNumber,
        title,
        description,
        reason || null,
        costImpact || 0,
        scheduleImpactDays || 0,
        user.userId
      );

      // Create audit log
      createAuditLog({
        userId: user.userId,
        companyId: user.companyId,
        action: 'create',
        entityType: 'change_order',
        entityId: String(result.lastInsertRowid)
      });

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Create change order error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update change order
  router.put('/change-orders/:id', getCurrentUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { status, approvedBy } = req.body;

      const old = db.prepare('SELECT * FROM change_orders WHERE id = ?').get(id);

      db.prepare(`
        UPDATE change_orders
        SET status = ?, approved_by = ?, updated_at = datetime('now')
        WHERE id = ? AND company_id = ?
      `).run(status, approvedBy || null, id, user.companyId);

      // Create audit log
      createAuditLog({
        userId: user.userId,
        companyId: user.companyId,
        action: 'update',
        entityType: 'change_order',
        entityId: id,
        changes: { before: old, after: { status, approvedBy } }
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update change order error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // SAFETY INCIDENTS API
  // ============================================

  // Get safety incidents
  router.get('/safety-incidents', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, severity, status } = req.query;

      let query = `SELECT * FROM safety_incidents WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (severity) {
        query += ' AND severity = ?';
        params.push(severity);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY incident_date DESC';

      const incidents = db.prepare(query).all(...params);

      res.json({ success: true, incidents });
    } catch (error: any) {
      console.error('Get safety incidents error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create safety incident
  router.post('/safety-incidents', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        projectId,
        incidentNumber,
        incidentType,
        severity,
        description,
        location,
        incidentDate
      } = req.body;

      const result = db.prepare(`
        INSERT INTO safety_incidents (
          company_id, project_id, incident_number, incident_type, severity,
          description, location, incident_date, reported_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        user.companyId,
        projectId,
        incidentNumber,
        incidentType,
        severity,
        description,
        location,
        incidentDate,
        user.userId
      );

      // Create high-priority notification for safety team
      const notificationId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (
          id, user_id, company_id, type, title, message, priority, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        notificationId,
        user.userId, // TODO: Should notify safety officers
        user.companyId,
        'safety_incident',
        `New ${severity} Safety Incident`,
        `${incidentType} at ${location}`,
        'urgent'
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Create safety incident error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // EQUIPMENT TRACKING API
  // ============================================

  // Get equipment
  router.get('/equipment', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { status, projectId, category } = req.query;

      let query = `SELECT * FROM equipment WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (projectId) {
        query += ' AND current_project_id = ?';
        params.push(projectId);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY name ASC';

      const equipment = db.prepare(query).all(...params);

      res.json({ success: true, equipment });
    } catch (error: any) {
      console.error('Get equipment error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create equipment
  router.post('/equipment', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        equipmentNumber,
        name,
        category,
        manufacturer,
        model,
        serialNumber,
        purchaseDate,
        purchaseCost
      } = req.body;

      const result = db.prepare(`
        INSERT INTO equipment (
          company_id, equipment_number, name, category, manufacturer, model,
          serial_number, purchase_date, purchase_cost, current_value, qr_code,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        user.companyId,
        equipmentNumber,
        name,
        category,
        manufacturer || null,
        model || null,
        serialNumber || null,
        purchaseDate || null,
        purchaseCost || null,
        purchaseCost || null,
        `QR-${equipmentNumber}` // Generate QR code
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Create equipment error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Checkout equipment
  router.post('/equipment/:id/checkout', getCurrentUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { projectId, condition } = req.body;

      // Update equipment status
      db.prepare(`
        UPDATE equipment
        SET status = 'in-use', current_project_id = ?, updated_at = datetime('now')
        WHERE id = ? AND company_id = ?
      `).run(projectId, id, user.companyId);

      // Create usage log
      const result = db.prepare(`
        INSERT INTO equipment_usage (
          equipment_id, project_id, user_id, checkout_date, condition_at_checkout, created_at
        ) VALUES (?, ?, ?, datetime('now'), ?, datetime('now'))
      `).run(id, projectId, user.userId, condition || 'good');

      res.json({ success: true, usageId: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Checkout equipment error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Return equipment
  router.post('/equipment/:id/return', getCurrentUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { usageId, condition, hoursUsed, notes } = req.body;

      // Update equipment status
      db.prepare(`
        UPDATE equipment
        SET status = 'available', current_project_id = NULL, updated_at = datetime('now')
        WHERE id = ? AND company_id = ?
      `).run(id, user.companyId);

      // Complete usage log
      db.prepare(`
        UPDATE equipment_usage
        SET checkin_date = datetime('now'), condition_at_return = ?, hours_used = ?, notes = ?
        WHERE id = ?
      `).run(condition || 'good', hoursUsed || null, notes || null, usageId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Return equipment error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // MATERIAL INVENTORY API
  // ============================================

  // Get materials
  router.get('/materials', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, category, lowStock } = req.query;

      let query = `SELECT * FROM material_inventory WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (lowStock === 'true') {
        query += ' AND quantity_on_hand <= minimum_quantity';
      }

      query += ' ORDER BY name ASC';

      const materials = db.prepare(query).all(...params);

      res.json({ success: true, materials });
    } catch (error: any) {
      console.error('Get materials error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create material
  router.post('/materials', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        projectId,
        sku,
        name,
        description,
        category,
        unitOfMeasure,
        quantityOnHand,
        minimumQuantity,
        unitCost
      } = req.body;

      const totalValue = (quantityOnHand || 0) * (unitCost || 0);

      const result = db.prepare(`
        INSERT INTO material_inventory (
          company_id, project_id, sku, name, description, category, unit_of_measure,
          quantity_on_hand, minimum_quantity, unit_cost, total_value, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        user.companyId,
        projectId || null,
        sku,
        name,
        description || null,
        category,
        unitOfMeasure,
        quantityOnHand || 0,
        minimumQuantity || 0,
        unitCost || 0,
        totalValue
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Create material error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Material transaction (purchase, usage, transfer)
  router.post('/materials/transaction', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        materialId,
        transactionType,
        quantity,
        unitCost,
        fromLocation,
        toLocation,
        projectId,
        notes
      } = req.body;

      // Create transaction
      const result = db.prepare(`
        INSERT INTO material_transactions (
          material_id, transaction_type, quantity, unit_cost, from_location, to_location,
          project_id, user_id, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        materialId,
        transactionType,
        quantity,
        unitCost || null,
        fromLocation || null,
        toLocation || null,
        projectId || null,
        user.userId,
        notes || null
      );

      // Update inventory quantity
      const adjustment = transactionType === 'purchase' ? quantity :
                        transactionType === 'usage' ? -quantity :
                        0;

      db.prepare(`
        UPDATE material_inventory
        SET quantity_on_hand = quantity_on_hand + ?,
            total_value = (quantity_on_hand + ?) * unit_cost,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(adjustment, adjustment, materialId);

      res.json({ success: true, transactionId: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Material transaction error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // QUALITY INSPECTIONS API
  // ============================================

  // Get inspections
  router.get('/inspections', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { projectId, status, type } = req.query;

      let query = `SELECT * FROM quality_inspections WHERE company_id = ?`;
      const params: any[] = [user.companyId];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (type) {
        query += ' AND inspection_type = ?';
        params.push(type);
      }

      query += ' ORDER BY inspection_date DESC';

      const inspections = db.prepare(query).all(...params);

      res.json({ success: true, inspections });
    } catch (error: any) {
      console.error('Get inspections error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create inspection
  router.post('/inspections', getCurrentUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        projectId,
        inspectionNumber,
        inspectionType,
        areaLocation,
        inspectorName,
        inspectionDate
      } = req.body;

      const result = db.prepare(`
        INSERT INTO quality_inspections (
          company_id, project_id, inspection_number, inspection_type, area_location,
          inspector_name, inspection_date, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', datetime('now'), datetime('now'))
      `).run(
        user.companyId,
        projectId,
        inspectionNumber,
        inspectionType,
        areaLocation,
        inspectorName,
        inspectionDate
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error('Create inspection error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update inspection result
  router.put('/inspections/:id', getCurrentUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { status, result, deficiencies, notes } = req.body;

      db.prepare(`
        UPDATE quality_inspections
        SET status = ?, result = ?, deficiencies = ?, notes = ?, updated_at = datetime('now')
        WHERE id = ? AND company_id = ?
      `).run(
        status,
        result || null,
        deficiencies ? JSON.stringify(deficiencies) : null,
        notes || null,
        id,
        user.companyId
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update inspection error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
