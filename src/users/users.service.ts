import { Injectable, NotFoundException } from '@nestjs/common';
import { PasswordService } from 'src/commons/security/password.service';
import { MembershipService } from 'src/membership/membership.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { UserCreateInput, UserUpdateInput } from 'src/generated/prisma/models';
import { FinalizeInvitationStatus } from './dto/update-dtos';
import { TasksService } from 'src/tasks/tasks.service';
import { CloudinaryService } from 'src/commons/cloudinary/cloudinary.service';
import { TokenService } from 'src/commons/jwt/token.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly membershipService: MembershipService,
    private readonly taskService: TasksService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly tokenService: TokenService,
  ) {}

  private async createSession(userId: string, email: string) {
    const sessionId = crypto.randomUUID();

    const { accessToken, refreshToken } =
      await this.tokenService.generateAuthTokens({
        sessionId,
        email,
        id: userId,
      });

    const hashedRefreshToken = await this.passwordService.hash(
      refreshToken.token,
    );

    const expiresAt = new Date(Date.now() + refreshToken.expiresIn);

    await this.prismaService.refreshToken.create({
      data: {
        id: sessionId,
        token: hashedRefreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async register(data: UserCreateInput) {
    const hashedPassword = await this.passwordService.hash(data.password);

    const user = await this.prismaService.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });

    const { accessToken, refreshToken } = await this.createSession(
      user.id,
      user.email,
    );

    return { accessToken, refreshToken, user };
  }

  async findUserById(id: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarPublicId: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  async findUserByEmail(email: string, forRespose: boolean = false) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        password: !forRespose,
        email: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  async update(id: string, payload: UserUpdateInput) {
    if (payload.password) {
      payload.password = await this.passwordService.hash(
        payload.password as string,
      );
    }
    const user = await this.prismaService.user.update({
      where: { id, deletedAt: null },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id, deletedAt: null },
        data: {
          deletedAt: new Date(),
        },
        omit: {
          password: true,
        },
      });

      await this.taskService.userLeft(tx, id);

      return user;
    });

    if (user.avatarPublicId)
      await this.cloudinaryService.removeFile(user.avatarPublicId);

    return user;
  }

  async updateAvatar(id: string, fileBuffer: Buffer) {
    const user = await this.findUserById(id);

    if (!user) throw new NotFoundException('User not found');

    const upload = await this.cloudinaryService.uploadFile(fileBuffer);
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        avatarUrl: upload.secure_url,
        avatarPublicId: upload.public_id,
      },
      omit: {
        password: true,
      },
    });

    if (user.avatarPublicId)
      await this.cloudinaryService.removeFile(user.avatarPublicId);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async removeAvatar(id: string) {
    const user = await this.findUserById(id);

    if (!user) throw new NotFoundException('User not found');
    if (user.avatarPublicId)
      await this.cloudinaryService.removeFile(user.avatarPublicId);

    return this.prismaService.user.update({
      where: { id },
      data: {
        avatarUrl: null,
        avatarPublicId: null,
      },
      omit: {
        password: true,
      },
    });
  }

  getInvites(id: string) {
    return this.membershipService.getUserInvites(id);
  }

  async updateInvite(id: string, status: FinalizeInvitationStatus) {
    return this.membershipService.updateInvite(id, status);
  }
}
