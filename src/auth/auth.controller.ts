import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth-dto';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in-dto';

import type { Request, Response } from 'express';
import { RefreshGuard } from './guards/refresh.guard';
import { JwtPayload } from './interfaces/jwt-payload';
import { Public } from 'src/commons/helpers/public.decorator';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @Public()
  async register(@Body() registerDto: RegisterAuthDto) {
    const user = await this.authService.register(registerDto);
    return {
      message: 'User created successfully',
      user,
    };
  }

  @Post('sign-in')
  @Public()
  @HttpCode(200)
  async signIn(
    @Body() signInDto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    /**
     * Extract Request Data
     * Pass to the service
     * Set the cookie
     * Return response
     */
    const ipAddress =
      req.ip || req.headers['x-forwarded-for']?.toString() || 'unkown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceId = req.headers['x-device-id']?.toString() || 'unknown';

    const payload = await this.authService.signIn(signInDto, {
      ipAddress,
      userAgent,
      deviceId,
    });

    res.cookie('access_token', payload.accessToken.token, {
      httpOnly: true,
      secure: true,
      maxAge: payload.accessToken.expiresIn,
    });

    res.cookie('refresh_token', payload.refreshToken.token, {
      httpOnly: true,
      secure: true,
      maxAge: payload.refreshToken.expiresIn,
    });

    return {
      message: 'Login Successfull',
      accessToken: payload.accessToken.token,
      refreshToken: payload.refreshToken.token,
      user: payload.user,
    };
  }

  @ApiCookieAuth('Refresh token')
  @Post('refresh')
  @Public()
  @UseGuards(RefreshGuard)
  @HttpCode(200)
  async refershToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refresh(
      req.user as JwtPayload & { token: string },
    );

    res.cookie('access_token', accessToken.token, {
      httpOnly: true,
      secure: true,
      maxAge: accessToken.expiresIn,
    });

    res.cookie('refresh_token', refreshToken.token, {
      httpOnly: true,
      secure: true,
      maxAge: refreshToken.expiresIn,
    });

    return {
      message: 'Tokens Refereshed Successfully',
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { sessionId } = req.user!;
    res.clearCookie('access_token', { httpOnly: true, secure: true });
    res.clearCookie('refresh_token', { httpOnly: true, secure: true });

    await this.authService.logout(sessionId);
    return;
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @Post('logout/all')
  @HttpCode(204)
  async logoutAll(@Req() req: Request) {
    const { id } = req.user!;
    await this.authService.logoutAll(id);
    return;
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @Get('sessions')
  async getSessions(@Req() req: Request) {
    const { id } = req.user!;
    const sessions = await this.authService.getSessions(id);
    return {
      message: 'Sessions Fetched Successfully',
      sessions,
    };
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @Get('me')
  async getMe(@Req() req: Request) {
    const { id } = req.user!;
    const user = await this.authService.getMe(id);
    return {
      message: 'Fetched Me',
      user,
    };
  }
}
