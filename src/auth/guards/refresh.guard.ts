import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { Request } from 'express';
import { TokenService } from 'src/commons/jwt/token.service';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token =
      this.extractTokenFromCookies(request) ||
      this.extractTokenFromBody(request);

    if (!token) throw new UnauthorizedException();

    const payload = await this.tokenService.verifyRefreshToken(token);
    if (!payload.email || !payload.id || payload.sessionId)
      throw new UnauthorizedException();
    request['user'] = { ...payload, token };

    return true;
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    const cookies: unknown = request.cookies;
    if (!cookies) return undefined;

    const token: unknown = cookies['refresh_token'];
    return typeof token == 'string' ? token : undefined;
  }

  private extractTokenFromBody(request: Request): string | undefined {
    const body: unknown = request.body;
    if (!body) return undefined;

    const token: unknown = body['refresh_token'];
    return typeof token == 'string' ? token : undefined;
  }
}
