import { z } from 'zod';

export const updateTenantSchema = z.object({
  name: z.string().min(2),
  plan: z.enum(['starter', 'growth', 'enterprise'])
});
