import { Router } from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { getDatabase } from '../database/connection';
import { generateToken, authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler, errors } from '../middleware/errorHandler';
import { LoginRequest, LoginResponse, User, Company, ApiResponse } from '../types';

const router = Router();

// Login endpoint
router.post('/login', 
  validate(schemas.login),
  asyncHandler(async (req, res) => {
    const { email, password }: LoginRequest = req.body;
    const db = getDatabase();
    
    // Get user with password hash
    const user = await db.get<User>(`
      SELECT * FROM users 
      WHERE email = ? AND is_active = 1
    `, [email]);
    
    if (!user) {
      throw errors.unauthorized('Invalid email or password');
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw errors.unauthorized('Invalid email or password');
    }
    
    // Get user's company if they have one
    let company: Company | undefined;
    if (user.company_id) {
      company = await db.get<Company>(`
        SELECT * FROM companies 
        WHERE id = ? AND is_active = 1
      `, [user.company_id]);
    }
    
    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user;
    
    // Generate JWT token
    const token = generateToken(userWithoutPassword);
    
    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: userWithoutPassword,
        company,
        token,
        expires_in: 24 * 60 * 60 // 24 hours in seconds
      }
    };
    
    res.json(response);
  })
);

// Get current user profile
router.get('/me', 
  authenticate,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    
    // Get fresh user data
    const user = await db.get<User>(`
      SELECT id, email, first_name, last_name, role, company_id, avatar_url, phone, is_active, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [req.user!.id]);
    
    if (!user) {
      throw errors.notFound('User');
    }
    
    // Get user's company if they have one
    let company: Company | undefined;
    if (user.company_id) {
      company = await db.get<Company>(`
        SELECT * FROM companies 
        WHERE id = ? AND is_active = 1
      `, [user.company_id]);
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        user,
        company
      }
    };
    
    res.json(response);
  })
);

// Update user profile
router.put('/me', 
  authenticate,
  validate(schemas.updateUser),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const userId = req.user!.id;
    
    const updates = req.body;
    const updateFields = Object.keys(updates);
    
    if (updateFields.length === 0) {
      throw errors.badRequest('No fields to update');
    }
    
    // Build dynamic update query
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);
    values.push(userId);
    
    await db.run(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);
    
    // Get updated user
    const updatedUser = await db.get<User>(`
      SELECT id, email, first_name, last_name, role, company_id, avatar_url, phone, is_active, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [userId]);
    
    const response: ApiResponse = {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    };
    
    res.json(response);
  })
);

// Change password
router.put('/change-password',
  authenticate,
  validate(Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(6).required()
  })),
  asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body;
    const db = getDatabase();
    const userId = req.user!.id;
    
    // Get current password hash
    const user = await db.get<User>(`
      SELECT password_hash FROM users WHERE id = ?
    `, [userId]);
    
    if (!user) {
      throw errors.notFound('User');
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      throw errors.unauthorized('Current password is incorrect');
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 10);
    
    // Update password
    await db.run(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newPasswordHash, userId]);
    
    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };
    
    res.json(response);
  })
);

// Logout (client-side token removal, but we can log it)
router.post('/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we just acknowledge the logout
    
    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully'
    };
    
    res.json(response);
  })
);

// Token validation endpoint
router.get('/validate',
  authenticate,
  asyncHandler(async (req, res) => {
    const response: ApiResponse = {
      success: true,
      data: {
        valid: true,
        user: req.user
      }
    };
    
    res.json(response);
  })
);

export default router;
