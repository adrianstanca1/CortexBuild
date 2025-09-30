import { Router, Request, Response } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';

const router = Router();

// Mock user data for testing
const mockUsers = [
  {
    id: 'user-001',
    email: 'john.smith@company.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'Project Manager',
    department: 'Operations',
    status: 'active',
    lastLogin: '2025-09-28T14:30:00Z',
    createdAt: '2025-01-15T10:00:00Z',
    permissions: ['read_projects', 'write_projects', 'manage_tasks']
  },
  {
    id: 'user-002',
    email: 'sarah.johnson@company.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'Safety Manager',
    department: 'Safety',
    status: 'active',
    lastLogin: '2025-09-28T09:15:00Z',
    createdAt: '2025-02-20T08:30:00Z',
    permissions: ['read_safety', 'write_safety', 'manage_incidents']
  }
];

// Get all users (requires authentication)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: mockUsers,
      meta: {
        total: mockUsers.length,
        page: 1,
        limit: 50
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Get user by ID (requires authentication)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = mockUsers.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// Create user (requires authentication)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const newUser = {
      id: `user-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    mockUsers.push(newUser);

    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// Update user (requires authentication)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userIndex = mockUsers.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...req.body,
      id: req.params.id // Prevent ID change
    };

    res.json({
      success: true,
      data: mockUsers[userIndex]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Delete user (requires authentication)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userIndex = mockUsers.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const deletedUser = mockUsers.splice(userIndex, 1)[0];

    res.json({
      success: true,
      data: deletedUser,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

export default router;