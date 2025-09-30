import { Router } from 'express';
import { getDatabase } from '../database/connection';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler, errors } from '../middleware/errorHandler';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Equipment routes
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id } = req.user as any;
  
  const equipment = await db.all(`
    SELECT e.*, 
           CASE WHEN ea.id IS NOT NULL THEN 'assigned' ELSE e.status END as current_status,
           p.name as assigned_project_name,
           u.first_name || ' ' || u.last_name as assigned_to_name
    FROM equipment e
    LEFT JOIN equipment_assignments ea ON e.id = ea.equipment_id AND ea.return_date IS NULL
    LEFT JOIN projects p ON ea.project_id = p.id
    LEFT JOIN users u ON ea.assigned_to = u.id
    WHERE e.company_id = ?
    ORDER BY e.name
  `, [company_id]);
  
  res.json({
    success: true,
    data: equipment
  });
}));

router.post('/', authenticate, validate(Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  model: Joi.string().optional(),
  serial_number: Joi.string().optional(),
  purchase_date: Joi.date().optional(),
  purchase_cost: Joi.number().optional(),
  location: Joi.string().optional(),
  notes: Joi.string().optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id, id: user_id } = req.user as any;
  
  const equipmentData = {
    id: uuidv4(),
    ...req.body,
    company_id,
    status: 'available'
  };
  
  await db.run(`
    INSERT INTO equipment (id, company_id, name, type, model, serial_number, 
                          purchase_date, purchase_cost, status, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    equipmentData.id,
    equipmentData.company_id,
    equipmentData.name,
    equipmentData.type,
    equipmentData.model,
    equipmentData.serial_number,
    equipmentData.purchase_date,
    equipmentData.purchase_cost,
    equipmentData.status,
    equipmentData.location,
    equipmentData.notes
  ]);
  
  const equipment = await db.get('SELECT * FROM equipment WHERE id = ?', [equipmentData.id]);
  
  res.status(201).json({
    success: true,
    data: equipment
  });
}));

// Assign equipment to project
router.post('/:id/assign', authenticate, validate(Joi.object({
  project_id: Joi.string().required(),
  assigned_to: Joi.string().optional(),
  notes: Joi.string().optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id: equipment_id } = req.params;
  const { project_id, assigned_to, notes } = req.body;
  const { company_id } = req.user as any;
  
  // Verify equipment belongs to company
  const equipment = await db.get('SELECT * FROM equipment WHERE id = ? AND company_id = ?', [equipment_id, company_id]);
  if (!equipment) {
    throw errors.notFound('Equipment not found');
  }
  
  // Check if already assigned
  const existingAssignment = await db.get(`
    SELECT * FROM equipment_assignments 
    WHERE equipment_id = ? AND return_date IS NULL
  `, [equipment_id]);
  
  if (existingAssignment) {
    throw errors.badRequest('Equipment is already assigned');
  }
  
  const assignmentId = uuidv4();
  await db.run(`
    INSERT INTO equipment_assignments (id, equipment_id, project_id, assigned_to, assigned_date, notes)
    VALUES (?, ?, ?, ?, DATE('now'), ?)
  `, [assignmentId, equipment_id, project_id, assigned_to, notes]);
  
  // Update equipment status
  await db.run('UPDATE equipment SET status = ? WHERE id = ?', ['in_use', equipment_id]);
  
  res.json({
    success: true,
    message: 'Equipment assigned successfully'
  });
}));

// Return equipment
router.post('/:id/return', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id: equipment_id } = req.params;
  const { company_id } = req.user as any;
  
  // Verify equipment belongs to company
  const equipment = await db.get('SELECT * FROM equipment WHERE id = ? AND company_id = ?', [equipment_id, company_id]);
  if (!equipment) {
    throw errors.notFound('Equipment not found');
  }
  
  // Update assignment record
  await db.run(`
    UPDATE equipment_assignments 
    SET return_date = DATE('now') 
    WHERE equipment_id = ? AND return_date IS NULL
  `, [equipment_id]);
  
  // Update equipment status
  await db.run('UPDATE equipment SET status = ? WHERE id = ?', ['available', equipment_id]);
  
  res.json({
    success: true,
    message: 'Equipment returned successfully'
  });
}));

router.put('/:id', authenticate, validate(Joi.object({
  name: Joi.string().optional(),
  type: Joi.string().optional(),
  model: Joi.string().optional(),
  serial_number: Joi.string().optional(),
  purchase_date: Joi.date().optional(),
  purchase_cost: Joi.number().optional(),
  status: Joi.string().valid('available', 'in_use', 'maintenance', 'retired').optional(),
  location: Joi.string().optional(),
  notes: Joi.string().optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { company_id } = req.user as any;
  
  // Verify equipment belongs to company
  const equipment = await db.get('SELECT * FROM equipment WHERE id = ? AND company_id = ?', [id, company_id]);
  if (!equipment) {
    throw errors.notFound('Equipment not found');
  }
  
  const updates = req.body;
  const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const updateValues = Object.values(updates);
  
  await db.run(`
    UPDATE equipment 
    SET ${updateFields}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [...updateValues, id]);
  
  const updatedEquipment = await db.get('SELECT * FROM equipment WHERE id = ?', [id]);
  
  res.json({
    success: true,
    data: updatedEquipment
  });
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { company_id } = req.user as any;
  
  // Verify equipment belongs to company
  const equipment = await db.get('SELECT * FROM equipment WHERE id = ? AND company_id = ?', [id, company_id]);
  if (!equipment) {
    throw errors.notFound('Equipment not found');
  }
  
  // Check if currently assigned
  const assignment = await db.get(`
    SELECT * FROM equipment_assignments 
    WHERE equipment_id = ? AND return_date IS NULL
  `, [id]);
  
  if (assignment) {
    throw errors.badRequest('Cannot delete equipment that is currently assigned');
  }
  
  await db.run('DELETE FROM equipment WHERE id = ?', [id]);
  
  res.json({
    success: true,
    message: 'Equipment deleted successfully'
  });
}));

export default router;