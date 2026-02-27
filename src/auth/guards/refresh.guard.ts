import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { Request } from 'express';
import type { JwtPayload } from '../interfaces/jwt-payload';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token =
      this.extractTokenFromCookies(request) ||
      this.extractTokenFromBody(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      request['user'] = { ...payload, token };
    } catch {
      throw new UnauthorizedException();
    }

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
