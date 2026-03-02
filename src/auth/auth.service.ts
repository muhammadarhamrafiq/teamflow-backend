import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordService } from 'src/commons/security/password.service';
import { TokenService } from '../commons/jwt/token.service';
import { SessionService } from './services/sessions.service';
import { UsersService } from 'src/users/users.service';

import type { EmailDto } from './dto/email-dto';
import type { SignInDto } from './dto/sign-in-dto';
import type { JwtPayload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  private async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
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

  async register(registerDto: EmailDto) {
    /**
     * Get the email
     * Verify its uniqueness
     * Create token and send the email
     */
    const user = await this.userService.findUserByEmail(registerDto.email);
    if (user) throw new ConflictException('User with this email already exits');
    const token = this.tokenService.generateActionToken(
      {
        email: registerDto.email,
        purpose: 'verify_email',
      },
      '30m',
    );
    // TODO: Remove this return after the emailing is setuped
    return token;
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
    return this.prismaService.refreshToken.findMany({
      where: {
        userId: id,
      },
    });
  }

  async getMe(id: string) {
    return this.userService.findUserById(id);
  }

  async updateEmail(id: string, newEmail: string) {
    // TODO: Later send email to new Email instead of sending the token as response
    const token = await this.tokenService.generateActionToken(
      {
        purpose: 'update_email',
        email: newEmail,
        userId: id,
      },
      '30m',
    );

    return token;
  }

  async resetPassword(email: string) {
    const user = await this.userService.findUserByEmail(email);

    // TODO: Later send the email instead to send token as response
    if (user) {
      const token = await this.tokenService.generateActionToken(
        {
          purpose: 'reset_password',
          userId: user.id,
        },
        '15m',
      );
      return token;
    }

    return null;
  }
}
