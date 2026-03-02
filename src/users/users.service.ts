import { Injectable } from '@nestjs/common';
import { PasswordService } from 'src/commons/security/password.service';
import { UserCreateInput, UserUpdateInput } from 'src/generated/prisma/models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(data: UserCreateInput) {
    const hashedPassword = await this.passwordService.hash(data.password);
    return this.prismaService.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      omit: {
        password: true,
      },
    });
  }

  async findUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
        deletedAt: null,
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
      where: { id },
      data: payload,
      omit: {
        password: true,
      },
    });
    return user;
  }

  async deleteUser(id: string) {
    await this.prismaService.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
