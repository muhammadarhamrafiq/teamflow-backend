import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordService } from 'src/commons/security/password.service';
import { TokenService } from './services/token.service';
import { SessionService } from './services/sessions.service';

import type { RegisterAuthDto } from './dto/register-auth-dto';
import type { SignInDto } from './dto/sign-in-dto';
import type { JwtPayload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    /**
     * Get Payload
     * Hash Password
     * Return created user
     */
    const { name, email, password } = registerDto;
    const hashedPassword = await this.passwordService.hash(password);

    return await this.prismaService.user
      .create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        omit: {
          // password: true,
        },
      })
      .catch((err) => {
        this.prismaService.errorHandler(err as Error, {
          P2002: 'Email Already Exits',
          default: 'Something Went wrong while creating user',
        });
      });
  }

  private async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    const hashToCompare = user
      ? user.password
      : '$2b$10$2RDz1RwUYAwVQEnmh3Iipeq5TrvMFH4JV0dQv9rpz.oBDANYWVe4C';
    const validPassword = await this.passwordService.compare(
      password,
      hashToCompare,
    );

    if (!validPassword || !user)
      throw new UnauthorizedException('Invalid Credentials');

    return { id: user.id, email: user.email };
  }

  async signIn(
    signInDto: SignInDto,
    optionals?: {
      ipAddress?: string;
      userAgent?: string;
      deviceId?: string;
    },
  ) {
    /**
     * Get Payload and verify the user
     * Validate the number of active sessions
     * Generate the auth tokens
     * return the tokens and user payload
     */
    const user = await this.validateUser(signInDto.email, signInDto.password);

    await this.sessionService.ensureSessionLimit(user.id);

    const sessionId = crypto.randomUUID();

    const { accessToken, refreshToken } =
      await this.tokenService.generateAuthTokens({ ...user, sessionId });

    await this.sessionService.createSession(
      user.id,
      refreshToken,
      sessionId,
      optionals,
    );

    return { accessToken, refreshToken, user };
  }

  async refresh(payload: JwtPayload & { token: string }) {
    /**
     * Verify session exits
     * Create new tokens
     * Update the session
     * return the tokens
     */
    await this.sessionService.verfiy(payload.sessionId, payload.token);

    const { accessToken, refreshToken } =
      await this.tokenService.generateAuthTokens({
        email: payload.email,
        id: payload.id,
        sessionId: payload.sessionId,
      });

    await this.sessionService.updateSession(payload.sessionId, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(sessionId: string) {
    await this.prismaService.refreshToken.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }

  async logoutAll(id: string) {
    await this.prismaService.refreshToken.deleteMany({
      where: {
        userId: id,
      },
    });
  }

  async getSessions(id: string) {
    await this.prismaService.refreshToken.findMany({
      where: {
        userId: id,
      },
    });
  }

  async getMe(id: string) {
    await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }
}
