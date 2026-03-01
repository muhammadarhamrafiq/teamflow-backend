import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';

import type { JwtPayload } from '../../auth/interfaces/jwt-payload';
import type { StringValue } from 'ms';

type ActionTokenPayload = {
  email?: string;
  userId?: string;
  purpose: 'verify_email' | 'reset_password' | 'update_email';
};

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateToken(
    payload: any,
    type: string,
    defaultVal: StringValue,
  ) {
    const time = this.configService.get<StringValue>(
      `JWT_${type}_EXPIRES_IN`,
      defaultVal,
    );

    const token = await this.jwtService.signAsync(
      { ...payload, type },
      {
        secret: this.configService.get<string>(`JWT_${type}_SECRET`),
        expiresIn: time,
      },
    );

    const expiresIn = ms(time);
    return { token, expiresIn };
  }

  public generateAccessToken(payload: JwtPayload) {
    return this.generateToken({ ...payload }, 'ACCESS', '15m');
  }

  public generateRefreshToken(payload: JwtPayload) {
    return this.generateToken(payload, 'REFRESH', '7d');
  }

  public async generateAuthTokens(payload: JwtPayload) {
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  public async generateActionToken(
    payload: ActionTokenPayload,
    expiresIn: StringValue,
  ) {
    const token = await this.generateToken(payload, 'ACTION', expiresIn);
    return token;
  }

  private async verifyToken<T extends object>(
    token: string,
    type: string,
  ): Promise<T> {
    try {
      return this.jwtService.verifyAsync<T>(token, {
        secret: this.configService.get<string>(`JWT_${type}_SECRET`),
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  public async verifyRefreshToken(token: string) {
    const payload = await this.verifyToken<JwtPayload>(token, 'REFRESH');
    return payload;
  }

  public async verifyAccessToken(token: string) {
    const payload = await this.verifyToken<JwtPayload>(token, 'ACCESS');
    return payload;
  }

  public async verifyActionToken(token: string) {
    const payload = await this.verifyToken<ActionTokenPayload>(token, 'ACTION');
    return payload;
  }
}
