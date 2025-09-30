"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const joi_1 = __importDefault(require("joi"));
const connection_1 = require("../database/connection");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.post('/login', (0, validation_1.validate)(validation_1.schemas.login), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const db = (0, connection_1.getDatabase)();
    const user = await db.get(`
      SELECT * FROM users 
      WHERE email = ? AND is_active = 1
    `, [email]);
    if (!user) {
        throw errorHandler_1.errors.unauthorized('Invalid email or password');
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw errorHandler_1.errors.unauthorized('Invalid email or password');
    }
    let company;
    if (user.company_id) {
        company = await db.get(`
        SELECT * FROM companies 
        WHERE id = ? AND is_active = 1
      `, [user.company_id]);
    }
    const { password_hash, ...userWithoutPassword } = user;
    const token = (0, auth_1.generateToken)(userWithoutPassword);
    const response = {
        success: true,
        data: {
            user: userWithoutPassword,
            company,
            token,
            expires_in: 24 * 60 * 60
        }
    };
    res.json(response);
}));
router.get('/me', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const user = await db.get(`
      SELECT id, email, first_name, last_name, role, company_id, avatar_url, phone, is_active, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [req.user.id]);
    if (!user) {
        throw errorHandler_1.errors.notFound('User');
    }
    let company;
    if (user.company_id) {
        company = await db.get(`
        SELECT * FROM companies 
        WHERE id = ? AND is_active = 1
      `, [user.company_id]);
    }
    const response = {
        success: true,
        data: {
            user,
            company
        }
    };
    res.json(response);
}));
router.put('/me', auth_1.authenticate, (0, validation_1.validate)(validation_1.schemas.updateUser), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const userId = req.user.id;
    const updates = req.body;
    const updateFields = Object.keys(updates);
    if (updateFields.length === 0) {
        throw errorHandler_1.errors.badRequest('No fields to update');
    }
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);
    values.push(userId);
    await db.run(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);
    const updatedUser = await db.get(`
      SELECT id, email, first_name, last_name, role, company_id, avatar_url, phone, is_active, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [userId]);
    const response = {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
    };
    res.json(response);
}));
router.put('/change-password', auth_1.authenticate, (0, validation_1.validate)(joi_1.default.object({
    current_password: joi_1.default.string().required(),
    new_password: joi_1.default.string().min(6).required()
})), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { current_password, new_password } = req.body;
    const db = (0, connection_1.getDatabase)();
    const userId = req.user.id;
    const user = await db.get(`
      SELECT password_hash FROM users WHERE id = ?
    `, [userId]);
    if (!user) {
        throw errorHandler_1.errors.notFound('User');
    }
    const isValidPassword = await bcryptjs_1.default.compare(current_password, user.password_hash);
    if (!isValidPassword) {
        throw errorHandler_1.errors.unauthorized('Current password is incorrect');
    }
    const newPasswordHash = await bcryptjs_1.default.hash(new_password, 10);
    await db.run(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newPasswordHash, userId]);
    const response = {
        success: true,
        message: 'Password changed successfully'
    };
    res.json(response);
}));
router.post('/logout', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const response = {
        success: true,
        message: 'Logged out successfully'
    };
    res.json(response);
}));
router.get('/validate', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const response = {
        success: true,
        data: {
            valid: true,
            user: req.user
        }
    };
    res.json(response);
}));
exports.default = router;
//# sourceMappingURL=auth.js.map