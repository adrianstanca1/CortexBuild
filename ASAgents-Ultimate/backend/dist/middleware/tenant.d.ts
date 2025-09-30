import { Request, Response, NextFunction } from 'express';
export declare function tenantContext(req: Request, res: Response, next: NextFunction): void;
export declare function requireTenant(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=tenant.d.ts.map