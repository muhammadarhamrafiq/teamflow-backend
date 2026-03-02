import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { ActionTokenGuard } from './guards/action-token.guard';

import { Purpose } from './decorators/purpose.decorator';
import { Public } from '../commons/helpers/public.decorator';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';

import type { Request } from 'express';
import { UpdateNameDto, UpdatePasswordDto } from './dto/update-dtos';
import { RegisterUserDto } from './dto/register-dto';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiQuery({ name: 'token' })
  @Public()
  @Post()
  @Purpose('verify_email')
  @UseGuards(ActionTokenGuard)
  async register(
    @Req() req: Request,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    const email = req.action?.email;
    const user = await this.usersService.register({
      email: email!,
      ...registerUserDto,
    });

    return {
      message: 'User created Successfully',
      user,
    };
  }

  @ApiAuth()
  @Delete()
  async deleteUser(@Req() req: Request) {
    const { id } = req.user!;
    await this.usersService.deleteUser(id);
  }

  @ApiQuery({ name: 'token' })
  @Public()
  @Patch('email')
  @Purpose('update_email')
  @UseGuards(ActionTokenGuard)
  async updateEmail(@Req() req: Request) {
    const { userId, email } = req.action!;
    const user = await this.usersService.update(userId!, { email });
    return {
      message: 'Email updated successfully',
      user,
    };
  }

  @ApiQuery({ name: 'token' })
  @Public()
  @Patch('password')
  @Purpose('reset_password')
  @UseGuards(ActionTokenGuard)
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: Request,
  ) {
    const userId = req.action?.userId;
    const user = await this.usersService.update(userId!, updatePasswordDto);
    return {
      message: 'Password Updated successfully',
      user,
    };
  }

  @ApiAuth()
  @Patch('name')
  async updateName(@Body() data: UpdateNameDto, @Req() req: Request) {
    const { id } = req.user!;
    const user = await this.usersService.update(id, data);
    return {
      message: 'Name updated succefully',
      user,
    };
  }

  @ApiAuth()
  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.findUserByEmail(email);
    return {
      messgae: user ? 'User fetched successfully' : 'User Not Found',
      user,
    };
  }
}
