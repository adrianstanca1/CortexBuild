import { Router } from 'express';
import { getDatabase } from '../database/connection';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler, errors } from '../middleware/errorHandler';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Safety incident routes
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id } = req.user;
  
  const incidents = await db.all(`
    SELECT si.*, 
           p.name as project_name,
           ur.first_name || ' ' || ur.last_name as reported_by_name
    FROM safety_incidents si
    LEFT JOIN projects p ON si.project_id = p.id
    LEFT JOIN users ur ON si.reported_by = ur.id
    WHERE si.company_id = ?
    ORDER BY si.incident_date DESC
  `, [company_id]);
  
  res.json({
    success: true,
    data: incidents
  });
}));

router.post('/', authenticate, validate(Joi.object({
  project_id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  incident_date: Joi.date().required(),
  location: Joi.string().required(),
  injured_person: Joi.string().optional(),
  witness_names: Joi.string().optional(),
  immediate_action: Joi.string().optional(),
  root_cause: Joi.string().optional(),
  corrective_actions: Joi.string().optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id, id: user_id } = req.user;
  
  const incidentData = {
    id: uuidv4(),
    ...req.body,
    company_id,
    reported_by: user_id,
    status: 'open'
  };
  
  await db.run(`
    INSERT INTO safety_incidents (
      id, company_id, project_id, title, description, severity, 
      incident_date, location, injured_person, witness_names, 
      immediate_action, root_cause, corrective_actions, 
      reported_by, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    incidentData.id,
    incidentData.company_id,
    incidentData.project_id,
    incidentData.title,
    incidentData.description,
    incidentData.severity,
    incidentData.incident_date,
    incidentData.location,
    incidentData.injured_person,
    incidentData.witness_names,
    incidentData.immediate_action,
    incidentData.root_cause,
    incidentData.corrective_actions,
    incidentData.reported_by,
    incidentData.status
  ]);
  
  const incident = await db.get('SELECT * FROM safety_incidents WHERE id = ?', [incidentData.id]);
  
  res.status(201).json({
    success: true,
    data: incident
  });
}));

router.put('/:id', authenticate, validate(Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  incident_date: Joi.date().optional(),
  location: Joi.string().optional(),
  injured_person: Joi.string().optional(),
  witness_names: Joi.string().optional(),
  immediate_action: Joi.string().optional(),
  root_cause: Joi.string().optional(),
  corrective_actions: Joi.string().optional(),
  status: Joi.string().valid('open', 'investigating', 'resolved', 'closed').optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { company_id } = req.user;
  
  // Verify incident belongs to company
  const incident = await db.get('SELECT * FROM safety_incidents WHERE id = ? AND company_id = ?', [id, company_id]);
  if (!incident) {
    throw errors.notFound('Safety incident not found');
  }
  
  const updates = req.body;
  const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const updateValues = Object.values(updates);
  
  await db.run(`
    UPDATE safety_incidents 
    SET ${updateFields}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [...updateValues, id]);
  
  const updatedIncident = await db.get('SELECT * FROM safety_incidents WHERE id = ?', [id]);
  
  res.json({
    success: true,
    data: updatedIncident
  });
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { company_id } = req.user;
  
  // Verify incident belongs to company
  const incident = await db.get('SELECT * FROM safety_incidents WHERE id = ? AND company_id = ?', [id, company_id]);
  if (!incident) {
    throw errors.notFound('Safety incident not found');
  }
  
  await db.run('DELETE FROM safety_incidents WHERE id = ?', [id]);
  
  res.json({
    success: true,
    message: 'Safety incident deleted successfully'
  });
}));

// Get incident statistics
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id } = req.user;
  
  const stats = await db.all(`
    SELECT 
      COUNT(*) as total_incidents,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_incidents,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_incidents,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_incidents,
      SUM(CASE WHEN incident_date >= DATE('now', '-30 days') THEN 1 ELSE 0 END) as recent_incidents
    FROM safety_incidents 
    WHERE company_id = ?
  `, [company_id]);
  
  res.json({
    success: true,
    data: stats[0]
  });
}));

export default router;