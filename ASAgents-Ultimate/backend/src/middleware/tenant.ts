import { Request, Response, NextFunction } from 'express';

// Extract tenant (company) context from headers or authenticated user
export function tenantContext(req: Request, res: Response, next: NextFunction) {
  // Prefer explicit header (useful for service-to-service calls)
  const headerTenant = req.header('X-Tenant-ID');
  const userCompany = (req as any).user?.company_id;
  (req as any).tenant_id = headerTenant || userCompany || null;
  next();
}

// Enforce that a tenant context is present (for multi-tenant secured routes)
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).tenant_id) {
    return res.status(400).json({ success: false, message: 'Tenant context required' });
  }
  next();
}
