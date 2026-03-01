import { Injectable } from '@nestjs/common';
import { UserUpdateInput } from 'src/generated/prisma/models';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  // async register(token: string, data:RegisterUserDto){
  //   const { email } =
  // }

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
    const user = await this.prismaService.user.update({
      where: { id },
      data: payload,
    });
    return user;
  }

  async deleteUser(id: string) {
    await this.prismaService.user.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }
}
