import { z } from 'zod';

export const createInvoiceSchema = z.object({
  projectId: z.string().uuid(),
  vendor: z.string().min(2),
  amount: z.number().positive(),
  dueDate: z.string().optional()
});

export const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'submitted', 'approved', 'paid', 'void']).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().optional()
});
