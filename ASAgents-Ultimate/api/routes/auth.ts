// API Routes for Authentication
import { Router, Request, Response } from 'express';
import authService from '../../services/authenticationService';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, remember } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authService.login({ email, password, remember });
    const accessToken = await authService.getAccessToken();

    res.json({ user, accessToken, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Invalid credentials',
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, company } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authService.register({ email, password, name, company });
    const accessToken = await authService.getAccessToken();

    res.status(201).json({ user, accessToken, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      error: 'Registration failed',
      message: error instanceof Error ? error.message : 'Could not create account',
    });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    await authService.logout();
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = authService.getUser();
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
