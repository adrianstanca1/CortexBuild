import { z } from 'zod';

export const createRfiSchema = z.object({
  projectId: z.string().uuid(),
  subject: z.string().min(3),
  question: z.string().min(10),
  dueDate: z.string().optional()
});

export const updateRfiSchema = z.object({
  response: z.string().min(3).optional(),
  status: z.enum(['draft', 'open', 'answered', 'closed']).optional(),
  dueDate: z.string().optional()
});
