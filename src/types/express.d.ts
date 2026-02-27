import { JwtPayload } from 'src/auth/interfaces/jwt-payload';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | (JwtPayload & { token: string });
    }
  }
}

export {};
