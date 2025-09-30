import { Router } from 'express';
import { getDatabase } from '../database/connection';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler, errors } from '../middleware/errorHandler';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Time entry routes
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { user_id, role, company_id } = req.user;
  const { project_id, date_from, date_to } = req.query;
  
  let query = `
    SELECT te.*, 
           u.first_name || ' ' || u.last_name as user_name,
           p.name as project_name,
           t.title as task_title
    FROM time_entries te
    LEFT JOIN users u ON te.user_id = u.id
    LEFT JOIN projects p ON te.project_id = p.id
    LEFT JOIN tasks t ON te.task_id = t.id
    WHERE te.company_id = ?
  `;
  const params = [company_id];
  
  // Regular users can only see their own time entries
  if (role !== 'admin' && role !== 'project_manager') {
    query += ' AND te.user_id = ?';
    params.push(user_id);
  }
  
  if (project_id) {
    query += ' AND te.project_id = ?';
    params.push(project_id);
  }
  
  if (date_from) {
    query += ' AND DATE(te.start_time) >= ?';
    params.push(date_from);
  }
  
  if (date_to) {
    query += ' AND DATE(te.start_time) <= ?';
    params.push(date_to);
  }
  
  query += ' ORDER BY te.start_time DESC';
  
  const timeEntries = await db.all(query, params);
  
  res.json({
    success: true,
    data: timeEntries
  });
}));

router.post('/', authenticate, validate(Joi.object({
  project_id: Joi.string().required(),
  task_id: Joi.string().optional(),
  start_time: Joi.date().required(),
  end_time: Joi.date().optional(),
  hours: Joi.number().optional(),
  description: Joi.string().optional(),
  hourly_rate: Joi.number().optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id, id: user_id } = req.user;
  
  const entryData = {
    id: uuidv4(),
    ...req.body,
    company_id,
    user_id
  };
  
  // Calculate hours if not provided
  if (!entryData.hours && entryData.start_time && entryData.end_time) {
    const startTime = new Date(entryData.start_time);
    const endTime = new Date(entryData.end_time);
    entryData.hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  }
  
  await db.run(`
    INSERT INTO time_entries (
      id, company_id, user_id, project_id, task_id, 
      start_time, end_time, hours, description, hourly_rate
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    entryData.id,
    entryData.company_id,
    entryData.user_id,
    entryData.project_id,
    entryData.task_id,
    entryData.start_time,
    entryData.end_time,
    entryData.hours,
    entryData.description,
    entryData.hourly_rate
  ]);
  
  const timeEntry = await db.get('SELECT * FROM time_entries WHERE id = ?', [entryData.id]);
  
  res.status(201).json({
    success: true,
    data: timeEntry
  });
}));

// Start timer
router.post('/start', authenticate, validate(Joi.object({
  project_id: Joi.string().required(),
  task_id: Joi.string().optional(),
  description: Joi.string().optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id, id: user_id } = req.user;
  
  // Check if user already has a running timer
  const runningTimer = await db.get(`
    SELECT * FROM time_entries 
    WHERE user_id = ? AND end_time IS NULL 
    ORDER BY start_time DESC LIMIT 1
  `, [user_id]);
  
  if (runningTimer) {
    throw errors.badRequest('Timer already running. Stop current timer before starting a new one.');
  }
  
  const entryData = {
    id: uuidv4(),
    company_id,
    user_id,
    ...req.body,
    start_time: new Date().toISOString()
  };
  
  await db.run(`
    INSERT INTO time_entries (
      id, company_id, user_id, project_id, task_id, 
      start_time, description
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    entryData.id,
    entryData.company_id,
    entryData.user_id,
    entryData.project_id,
    entryData.task_id,
    entryData.start_time,
    entryData.description
  ]);
  
  const timeEntry = await db.get('SELECT * FROM time_entries WHERE id = ?', [entryData.id]);
  
  res.status(201).json({
    success: true,
    data: timeEntry
  });
}));

// Stop timer
router.post('/stop', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id: user_id } = req.user;
  
  const runningTimer = await db.get(`
    SELECT * FROM time_entries 
    WHERE user_id = ? AND end_time IS NULL 
    ORDER BY start_time DESC LIMIT 1
  `, [user_id]);
  
  if (!runningTimer) {
    throw errors.notFound('No running timer found');
  }
  
  const endTime = new Date();
  const startTime = new Date(runningTimer.start_time);
  const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  await db.run(`
    UPDATE time_entries 
    SET end_time = ?, hours = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [endTime.toISOString(), hours, runningTimer.id]);
  
  const updatedEntry = await db.get('SELECT * FROM time_entries WHERE id = ?', [runningTimer.id]);
  
  res.json({
    success: true,
    data: updatedEntry
  });
}));

router.put('/:id', authenticate, validate(Joi.object({
  project_id: Joi.string().optional(),
  task_id: Joi.string().optional(),
  start_time: Joi.date().optional(),
  end_time: Joi.date().optional(),
  hours: Joi.number().optional(),
  description: Joi.string().optional(),
  hourly_rate: Joi.number().optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { id: user_id, role, company_id } = req.user;
  
  // Verify time entry exists and user has permission
  let timeEntry;
  if (role === 'admin' || role === 'project_manager') {
    timeEntry = await db.get('SELECT * FROM time_entries WHERE id = ? AND company_id = ?', [id, company_id]);
  } else {
    timeEntry = await db.get('SELECT * FROM time_entries WHERE id = ? AND user_id = ?', [id, user_id]);
  }
  
  if (!timeEntry) {
    throw errors.notFound('Time entry not found');
  }
  
  const updates = req.body;
  
  // Recalculate hours if start_time or end_time changed
  if (updates.start_time || updates.end_time) {
    const startTime = new Date(updates.start_time || timeEntry.start_time);
    const endTime = new Date(updates.end_time || timeEntry.end_time);
    if (endTime > startTime) {
      updates.hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    }
  }
  
  const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const updateValues = Object.values(updates);
  
  await db.run(`
    UPDATE time_entries 
    SET ${updateFields}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [...updateValues, id]);
  
  const updatedEntry = await db.get('SELECT * FROM time_entries WHERE id = ?', [id]);
  
  res.json({
    success: true,
    data: updatedEntry
  });
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { id: user_id, role, company_id } = req.user;
  
  // Verify time entry exists and user has permission
  let timeEntry;
  if (role === 'admin' || role === 'project_manager') {
    timeEntry = await db.get('SELECT * FROM time_entries WHERE id = ? AND company_id = ?', [id, company_id]);
  } else {
    timeEntry = await db.get('SELECT * FROM time_entries WHERE id = ? AND user_id = ?', [id, user_id]);
  }
  
  if (!timeEntry) {
    throw errors.notFound('Time entry not found');
  }
  
  await db.run('DELETE FROM time_entries WHERE id = ?', [id]);
  
  res.json({
    success: true,
    message: 'Time entry deleted successfully'
  });
}));

// Get time tracking statistics
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id: user_id, role, company_id } = req.user;
  const { project_id, date_from, date_to } = req.query;
  
  let query = `
    SELECT 
      COUNT(*) as total_entries,
      SUM(hours) as total_hours,
      AVG(hours) as avg_hours_per_entry,
      MIN(start_time) as earliest_entry,
      MAX(start_time) as latest_entry
    FROM time_entries 
    WHERE company_id = ?
  `;
  const params = [company_id];
  
  // Regular users can only see their own stats
  if (role !== 'admin' && role !== 'project_manager') {
    query += ' AND user_id = ?';
    params.push(user_id);
  }
  
  if (project_id) {
    query += ' AND project_id = ?';
    params.push(project_id);
  }
  
  if (date_from) {
    query += ' AND DATE(start_time) >= ?';
    params.push(date_from);
  }
  
  if (date_to) {
    query += ' AND DATE(start_time) <= ?';
    params.push(date_to);
  }
  
  const stats = await db.get(query, params);
  
  res.json({
    success: true,
    data: stats
  });
}));

export default router;