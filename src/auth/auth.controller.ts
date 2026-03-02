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
import { Public } from 'src/commons/helpers/public.decorator';
import { ApiCookieAuth } from '@nestjs/swagger';
import { RefreshGuard } from './guards/refresh.guard';
import { AuthService } from './auth.service';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';

import type { Request, Response } from 'express';
import type { JwtPayload } from './interfaces/jwt-payload';
import { SignInDto } from './dto/sign-in-dto';
import { EmailDto } from './dto/email-dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() registerDto: EmailDto) {
    // TODO: Donot send the tokens in response once email service is seted
    const token = await this.authService.register(registerDto);
    return {
      message: 'Check you email to confirm registeration',
      token,
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

  @ApiAuth()
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { sessionId } = req.user!;
    res.clearCookie('access_token', { httpOnly: true, secure: true });
    res.clearCookie('refresh_token', { httpOnly: true, secure: true });

    await this.authService.logout(sessionId);
    return;
  }

  @ApiAuth()
  @Post('logout/all')
  @HttpCode(204)
  async logoutAll(@Req() req: Request) {
    const { id } = req.user!;
    await this.authService.logoutAll(id);
    return;
  }

  @ApiAuth()
  @Get('sessions')
  async getSessions(@Req() req: Request) {
    const { id } = req.user!;
    const sessions = await this.authService.getSessions(id);
    return {
      message: 'Sessions Fetched Successfully',
      sessions,
    };
  }

  @ApiAuth()
  @Get('me')
  async getMe(@Req() req: Request) {
    const { id } = req.user!;
    const user = await this.authService.getMe(id);
    return {
      message: 'Fetched Me',
      user,
    };
  }

  @ApiAuth()
  @Post('/update-email')
  async updateEmail(@Req() req: Request, @Body() updateEmailDto: EmailDto) {
    // TODO: Donot return the token after the emailing service is setuped
    const { id } = req.user!;
    const token = await this.authService.updateEmail(id, updateEmailDto.email);
    return {
      message: 'Check you inbox to verify email',
      token,
    };
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() updatePasswordDto: EmailDto) {
    // TODO: Donot return the token after emailing service is setuped
    const token = await this.authService.resetPassword(updatePasswordDto.email);
    return {
      message: 'Check you inbox to reset the password',
      token,
    };
  }
}
