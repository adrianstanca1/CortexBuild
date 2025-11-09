import { Router } from 'express';
import { registerSchema, loginSchema } from './auth.schemas';
import * as authService from './auth.service';
import { authenticate, type AuthenticatedRequest } from '../../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const result = await authService.registerAccount(parsed.data);
    res.status(201).json({
      token: result.token,
      tenant: result.tenant,
      user: authService.toSafeUser(result.user)
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const result = await authService.login(parsed.data);
    res.json({
      token: result.token,
      user: authService.toSafeUser(result.user)
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

authRouter.get('/session', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await authService.getUserProfile(req.user.userId);
    res.json({ user });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});
