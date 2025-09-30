import { Router } from 'express';
import { authenticateUser, requireRole } from '../middleware/authenticate.js';
// import { auth0Middleware } from '../middleware/auth0.js';
import { userProfileService } from '../services/userProfileService.js';
import { pool } from '../services/db.js';
import bcrypt from 'bcrypt';
const router = Router();
// Get all users for a tenant
router.get('/', authenticateUser, async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT id, tenant_id, email, first_name, last_name, role, phone, avatar_url,
              is_active, last_login_at, created_at, updated_at
       FROM users
       WHERE tenant_id = ?
       ORDER BY first_name, last_name`, [req.user?.tenant_id]);
        const users = rows.map(row => ({
            id: row.id,
            tenantId: row.tenant_id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            phone: row.phone,
            avatarUrl: row.avatar_url,
            isActive: row.is_active,
            lastLogin: row.last_login_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
        return res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Failed to fetch users' });
    }
});
// Get a specific user
router.get('/:id', authenticateUser, async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const [rows] = await pool.query(`SELECT id, tenant_id, email, first_name, last_name, role, phone, avatar_url,
              is_active, last_login_at, created_at, updated_at
       FROM users
       WHERE id = ? AND tenant_id = ?`, [userId, req.user?.tenant_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const row = rows[0];
        const user = {
            id: row.id,
            tenantId: row.tenant_id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            phone: row.phone,
            avatarUrl: row.avatar_url,
            isActive: row.is_active,
            lastLogin: row.last_login_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        return res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Failed to fetch user' });
    }
});
// Create a new user
router.post('/', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
    const { email, password, firstName, lastName, role = 'worker', phone, avatarUrl } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
            message: 'Email, password, firstName, and lastName are required'
        });
    }
    try {
        // Check if email already exists
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ? AND tenant_id = ?', [email, req.user?.tenant_id]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await pool.execute(`INSERT INTO users (
        tenant_id, email, password_hash, first_name, last_name, role, phone, avatar_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            req.user?.tenant_id,
            email,
            passwordHash,
            firstName,
            lastName,
            role,
            phone || null,
            avatarUrl || null
        ]);
        return res.status(201).json({
            id: result.insertId,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Failed to create user' });
    }
});
// Update a user
router.put('/:id', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
    const userId = parseInt(req.params.id);
    const { email, firstName, lastName, role, phone, avatarUrl, isActive } = req.body;
    try {
        // Check if user exists and belongs to tenant
        const [existingRows] = await pool.query('SELECT id FROM users WHERE id = ? AND tenant_id = ?', [userId, req.user?.tenant_id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if email is taken by another user
        if (email) {
            const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ? AND tenant_id = ? AND id != ?', [email, req.user?.tenant_id, userId]);
            if (emailCheck.length > 0) {
                return res.status(409).json({ message: 'Email already exists' });
            }
        }
        await pool.execute(`UPDATE users SET 
        email = COALESCE(?, email),
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        role = COALESCE(?, role),
        phone = ?,
        avatar_url = ?,
        is_active = COALESCE(?, is_active),
        updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`, [
            email,
            firstName,
            lastName,
            role,
            phone,
            avatarUrl,
            isActive,
            userId,
            req.user?.tenant_id
        ]);
        return res.json({ message: 'User updated successfully' });
    }
    catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Failed to update user' });
    }
});
// Update user password
router.patch('/:id/password', authenticateUser, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;
    // Users can only change their own password unless they're admin/owner
    const isOwnPassword = userId === req.user?.sub;
    const isAdmin = req.user?.role === 'owner' || req.user?.role === 'admin';
    if (!isOwnPassword && !isAdmin) {
        return res.status(403).json({ message: 'Insufficient permissions' });
    }
    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }
    // If changing own password, current password is required
    if (isOwnPassword && !currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
    }
    try {
        // Get current password hash
        const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ? AND tenant_id = ?', [userId, req.user?.tenant_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify current password if required
        if (isOwnPassword) {
            const isValidPassword = await bcrypt.compare(currentPassword, rows[0].password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
        }
        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        await pool.execute('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ? AND tenant_id = ?', [newPasswordHash, userId, req.user?.tenant_id]);
        return res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Failed to update password' });
    }
});
// Deactivate a user (soft delete)
router.delete('/:id', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
    const userId = parseInt(req.params.id);
    // Prevent self-deletion
    if (userId === req.user?.sub) {
        return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }
    try {
        const [result] = await pool.execute('UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ? AND tenant_id = ?', [userId, req.user?.tenant_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ message: 'User deactivated successfully' });
    }
    catch (error) {
        console.error('Error deactivating user:', error);
        return res.status(500).json({ message: 'Failed to deactivate user' });
    }
});
// Reactivate a user
router.patch('/:id/activate', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const [result] = await pool.execute('UPDATE users SET is_active = TRUE, updated_at = NOW() WHERE id = ? AND tenant_id = ?', [userId, req.user?.tenant_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ message: 'User activated successfully' });
    }
    catch (error) {
        console.error('Error activating user:', error);
        return res.status(500).json({ message: 'Failed to activate user' });
    }
});
// Create user profile (for Auth0 registration)
router.post('/profile', async (req, res) => {
    try {
        const { auth0_id, email, first_name, last_name, company, phone, role, tenant_id, preferences } = req.body;
        if (!auth0_id || !email || !first_name || !last_name) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'auth0_id, email, first_name, and last_name are required'
            });
        }
        const result = await userProfileService.createUserProfile({
            auth0_id,
            email,
            first_name,
            last_name,
            company,
            phone,
            role: role || 'user',
            tenant_id,
            preferences
        });
        if (result.success) {
            res.status(201).json({
                success: true,
                profile: result.profile,
                message: 'User profile created successfully'
            });
        }
        else {
            res.status(400).json({
                error: 'Profile creation failed',
                message: result.error
            });
        }
    }
    catch (error) {
        console.error('Profile creation failed:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create user profile'
        });
    }
});
// Get user profile by Auth0 ID
router.get('/profile/auth0/:auth0Id', async (req, res) => {
    try {
        const { auth0Id } = req.params;
        const profile = await userProfileService.getUserProfileByAuth0Id(auth0Id);
        if (!profile) {
            return res.status(404).json({
                error: 'Profile not found',
                message: 'No user profile found for this Auth0 ID'
            });
        }
        res.json({
            success: true,
            profile
        });
    }
    catch (error) {
        console.error('Get profile failed:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get user profile'
        });
    }
});
// Update user profile
router.put('/profile/:id', async (req, res) => {
    try {
        const profileId = parseInt(req.params.id);
        const updates = req.body;
        if (isNaN(profileId)) {
            return res.status(400).json({
                error: 'Invalid profile ID',
                message: 'Profile ID must be a number'
            });
        }
        const result = await userProfileService.updateUserProfile(profileId, updates);
        if (result.success) {
            res.json({
                success: true,
                message: 'User profile updated successfully'
            });
        }
        else {
            res.status(400).json({
                error: 'Profile update failed',
                message: result.error
            });
        }
    }
    catch (error) {
        console.error('Profile update failed:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update user profile'
        });
    }
});
// Search user profiles
router.get('/profile/search', async (req, res) => {
    try {
        const { q: query, tenant_id, limit } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                error: 'Query required',
                message: 'Search query is required'
            });
        }
        const tenantId = tenant_id ? parseInt(tenant_id) : undefined;
        const searchLimit = limit ? parseInt(limit) : 10;
        const profiles = await userProfileService.searchUserProfiles(query, tenantId, searchLimit);
        res.json({
            success: true,
            profiles,
            query,
            count: profiles.length
        });
    }
    catch (error) {
        console.error('Profile search failed:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to search user profiles'
        });
    }
});
export default router;
