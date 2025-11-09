import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  status: z.enum(['planning', 'active', 'hold', 'closed']).default('planning'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().nonnegative().default(0)
});

export const updateProjectSchema = createProjectSchema.partial();
