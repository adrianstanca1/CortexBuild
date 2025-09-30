import { Request, Response, NextFunction } from 'express';
import { User } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: Omit<User, 'password_hash'>;
        }
    }
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    companyId?: string;
    tenantId?: string;
}
export declare function generateToken(user: Omit<User, 'password_hash'>): string;
export declare function verifyToken(token: string): JWTPayload;
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function authorize(roles: string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function requireCompanyAccess(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map