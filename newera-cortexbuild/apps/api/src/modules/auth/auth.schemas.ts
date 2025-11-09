import { z } from 'zod';

export const registerSchema = z.object({
  tenantName: z.string().min(2),
  tenantSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  plan: z.enum(['starter', 'growth', 'enterprise']).default('starter')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
