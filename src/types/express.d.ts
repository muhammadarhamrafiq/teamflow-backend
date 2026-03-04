import { JwtPayload } from 'src/auth/interfaces/jwt-payload';
import { Role } from 'src/generated/prisma/enums';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | (JwtPayload & { token: string });
      orgMembership?: { userId: string; role: Role; organizationId: string };
      action?: { userId?: string; purpose: string; email?: string };
    }
  }
}

export {};
