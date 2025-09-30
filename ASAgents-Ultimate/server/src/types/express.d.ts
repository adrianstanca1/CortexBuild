import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface AuthenticatedUserPayload extends JwtPayload {
      tenant_id: number;
      role: string;
      sub: number;
    }

    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export type ExpressAuthenticatedUser = Express.AuthenticatedUserPayload;

export {};
