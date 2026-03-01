import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { Reflector } from '@nestjs/core';
import { TokenService } from 'src/commons/jwt/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) return true;

    const token =
      this.extractTokenFromCookie(request) ||
      this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this.tokenService.verifyAccessToken(token);
    if (!payload.email || !payload.id || !payload.sessionId)
      throw new UnauthorizedException();
    request['user'] = payload;
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const cookies: object = request.cookies;
    if (!cookies) return undefined;

    const token: unknown = cookies['access_token'];
    return typeof token == 'string' ? token : undefined;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
