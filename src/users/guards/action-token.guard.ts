import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TokenService } from 'src/commons/jwt/token.service';

@Injectable()
export class ActionTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.query.token;

    if (typeof token !== 'string') throw new UnauthorizedException();

    const payload = await this.tokenService.verifyActionToken(token);

    const handler = context.getHandler();
    const requiredPurpose = this.reflector.get<string>('purpose', handler);

    if (!payload.purpose || payload.purpose !== requiredPurpose)
      throw new UnauthorizedException();

    request['action'] = payload;
    return true;
  }
}
