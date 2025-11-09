import { z } from 'zod';

export const createBudgetLineSchema = z.object({
  projectId: z.string().uuid(),
  category: z.string().min(2),
  description: z.string().min(3),
  amount: z.number().nonnegative(),
  committed: z.number().nonnegative().optional(),
  forecast: z.number().nonnegative().optional()
});

export const updateBudgetLineSchema = createBudgetLineSchema.partial();
