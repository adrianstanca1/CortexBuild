import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.router';
import { orgRouter } from '../modules/org/org.router';
import { projectRouter } from '../modules/projects/project.router';
import { rfiRouter } from '../modules/rfis/rfi.router';
import { insightsRouter } from '../modules/insights/insights.router';
import { financeRouter } from '../modules/finance/finance.router';
import { assistantRouter } from '../modules/ai/assistant.router';

export function createApiRouter() {
  const router = Router();

  router.use('/auth', authRouter);
  router.use('/org', orgRouter);
  router.use('/projects', projectRouter);
  router.use('/rfis', rfiRouter);
  router.use('/insights', insightsRouter);
  router.use('/finance', financeRouter);
  router.use('/assistant', assistantRouter);

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return router;
}
