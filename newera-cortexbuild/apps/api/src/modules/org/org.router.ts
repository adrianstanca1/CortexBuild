import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../../middleware/auth';
import * as orgService from './org.service';
import { updateTenantSchema } from './org.schemas';

export const orgRouter = Router();

orgRouter.use(authenticate);

orgRouter.get('/tenant', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const tenant = await orgService.getTenant(req.user.tenantId);
  res.json({ tenant });
});

orgRouter.put('/tenant', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = updateTenantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const tenant = await orgService.updateTenant(req.user.tenantId, parsed.data);
  res.json({ tenant });
});
