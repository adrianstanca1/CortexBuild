import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../../middleware/auth';
import * as insightsService from './insights.service';

export const insightsRouter = Router();
insightsRouter.use(authenticate);

insightsRouter.get('/portfolio', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const snapshot = await insightsService.getPortfolioSnapshot(req.user.tenantId);
  res.json({ snapshot });
});
