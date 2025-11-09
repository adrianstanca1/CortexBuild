import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../../middleware/auth';
import { z } from 'zod';
import { generateResponse } from './assistant.service';

const messageSchema = z.object({
  message: z.string().min(2),
  context: z.record(z.any()).optional()
});

export const assistantRouter = Router();
assistantRouter.use(authenticate);

assistantRouter.post('/message', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const response = await generateResponse({
    message: parsed.data.message,
    context: {
      ...parsed.data.context,
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      role: req.user.role
    }
  });

  res.json({ response });
});
