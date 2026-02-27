import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms, { StringValue } from 'ms';

import type { JwtPayload } from '../interfaces/jwt-payload';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateToken(
    payload: JwtPayload,
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
}
