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
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { RefreshGuard } from './guards/refresh.guard';
import { AuthService } from './auth.service';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';

import type { Request, Response } from 'express';
import type { JwtPayload } from './interfaces/jwt-payload';
import { SignInDto } from './dto/sign-in-dto';
import { EmailDto } from './dto/email-dto';
import {
  GetMeResponseDto,
  GetSessionsResponseDto,
  RefreshResponseDto,
  RegisterEmailResponseDto,
  RequestEmailUpdateDto,
  ResetPasswordDto,
  SignInResponseDto,
} from './dto/responses-dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getRefreshToken(req: Request) {
    const cookies: unknown = req.cookies;
    const body: unknown = req.body;

    if (cookies) {
      const token: unknown = cookies['refresh_token'];
      return typeof token == 'string' ? token : undefined;
    }

    if (body) {
      const token: unknown = body['refresh_token'];
      return typeof token == 'string' ? token : undefined;
    }

    return undefined;
  }

  @Post('register')
  @Public()
  @ApiResponse({
    status: 201,
    description: 'Emailed the user to complete registeration process',
    type: RegisterEmailResponseDto,
  })
  async register(
    @Body() registerDto: EmailDto,
  ): Promise<RegisterEmailResponseDto> {
    await this.authService.register(registerDto);
    return {
      message: 'Check you email to confirm registeration',
    };
  }

  @Post('sign-in')
  @Public()
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Signed in the user',
    type: SignInResponseDto,
  })
  async signIn(
    @Body() signInDto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResponseDto> {
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
      sameSite: 'none',
      maxAge: payload.accessToken.expiresIn,
    });

    res.cookie('refresh_token', payload.refreshToken.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
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
  @ApiResponse({
    status: 200,
    type: RefreshResponseDto,
  })
  @Public()
  @UseGuards(RefreshGuard)
  @HttpCode(200)
  async refershToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    const { accessToken, refreshToken } = await this.authService.refresh(
      req.user as JwtPayload & { token: string },
    );

    res.cookie('access_token', accessToken.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: accessToken.expiresIn,
    });

    res.cookie('refresh_token', refreshToken.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: refreshToken.expiresIn,
    });

    return {
      message: 'Tokens Refereshed Successfully',
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }

  @Post('logout')
  @Public()
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = this.getRefreshToken(req);

    res.clearCookie('access_token', { httpOnly: true, secure: true });
    res.clearCookie('refresh_token', { httpOnly: true, secure: true });

    await this.authService.logout(refreshToken);
  }

  @ApiAuth()
  @Post('logout/all')
  @HttpCode(204)
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { id } = req.user!;

    res.clearCookie('access_token', { httpOnly: true, secure: true });
    res.clearCookie('refresh_token', { httpOnly: true, secure: true });

    await this.authService.logoutAll(id);
  }

  @ApiAuth()
  @ApiResponse({
    status: 200,
    type: GetSessionsResponseDto,
  })
  @Get('sessions')
  async getSessions(@Req() req: Request): Promise<GetSessionsResponseDto> {
    const { id } = req.user!;
    const sessions = await this.authService.getSessions(id);
    return {
      message: 'Sessions Fetched Successfully',
      sessions,
    };
  }

  @ApiAuth()
  @ApiResponse({
    status: 200,
    type: GetMeResponseDto,
  })
  @Get('me')
  async getMe(@Req() req: Request): Promise<GetMeResponseDto> {
    const { id } = req.user!;
    const user = await this.authService.getMe(id);
    return {
      message: 'Fetched Me',
      user,
    };
  }

  @ApiAuth()
  @ApiResponse({ status: 200, type: RequestEmailUpdateDto })
  @Post('/update-email')
  async updateEmail(
    @Req() req: Request,
    @Body() updateEmailDto: EmailDto,
  ): Promise<RequestEmailUpdateDto> {
    const { id } = req.user!;
    await this.authService.updateEmail(id, updateEmailDto.email);
    return {
      message: 'Check you inbox to verify email',
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Request for reseting the password',
    type: ResetPasswordDto,
  })
  @Public()
  @Post('/reset-password')
  @HttpCode(200)
  async resetPassword(
    @Body() updatePasswordDto: EmailDto,
  ): Promise<ResetPasswordDto> {
    await this.authService.resetPassword(updatePasswordDto.email);
    return {
      message: 'Check you inbox to reset the password',
    };
  }
}
