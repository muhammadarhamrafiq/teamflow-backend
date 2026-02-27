import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordService } from 'src/commons/security/password.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: PasswordService,
  ) {}
  async ensureSessionLimit(id: string) {
    const sessions = await this.prismaService.refreshToken.count({
      where: {
        userId: id,
      },
    });

    if (sessions > 5)
      throw new ForbiddenException('Maxmum number of session activated.');
  }

  async createSession(
    id: string,
    token: {
      token: string;
      expiresIn: number;
    },
    sessionId: string,
    data?: object,
  ) {
    const expiresAt = new Date(Date.now() + token.expiresIn);
    const hashedToken = await this.hashingService.hash(token.token);
    return await this.prismaService.refreshToken.create({
      data: {
        id: sessionId,
        userId: id,
        token: hashedToken,
        expiresAt,
        ...data,
      },
    });
  }

  async verfiy(sessionId: string, token: string) {
    const session = await this.prismaService.refreshToken.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session) throw new UnauthorizedException();

    const valid = await this.hashingService.compare(token, session.token);
    if (!valid) throw new UnauthorizedException();
  }

  async updateSession(
    sessionId: string,
    token: { token: string; expiresIn: number },
  ) {
    const expiresAt = new Date(Date.now() + token.expiresIn);
    const hashedToken = await this.hashingService.hash(token.token);

    await this.prismaService.refreshToken.update({
      where: { id: sessionId },
      data: {
        token: hashedToken,
        expiresAt,
      },
    });
  }
}
