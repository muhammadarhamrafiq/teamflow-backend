import { JwtPayload } from 'src/auth/interfaces/jwt-payload';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | (JwtPayload & { token: string });
      orgMembership?: { userId: string; role: string; organizationId: string };
      action?: { userId?: string; purpose: string; email?: string };
    }
  }
}

export {};
