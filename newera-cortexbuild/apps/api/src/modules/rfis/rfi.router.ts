import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../../middleware/auth';
import * as rfiService from './rfi.service';
import { createRfiSchema, updateRfiSchema } from './rfi.schemas';

export const rfiRouter = Router();
rfiRouter.use(authenticate);

rfiRouter.get('/', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const rfis = await rfiService.listRFIs(req.user.tenantId, req.query.projectId as string | undefined);
  res.json({ rfis });
});

rfiRouter.post('/', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = createRfiSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const rfi = await rfiService.createRFI({
    ...parsed.data,
    tenantId: req.user.tenantId,
    createdBy: req.user.userId
  });
  res.status(201).json({ rfi });
});

rfiRouter.put('/:rfiId', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = updateRfiSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const rfi = await rfiService.updateRFI(req.params.rfiId, req.user.tenantId, parsed.data);
    res.json({ rfi });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});
