import { Body, Controller, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiQuery } from '@nestjs/swagger';
import { UpdateNameDto } from './dto/update-dtos';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiQuery({ name: 'token' })
  @Post('')
  register(@Query('token') token: string) {
    return {
      token,
    };
  }

  @Patch(':uid/name')
  updateName(@Body() data: UpdateNameDto, @Param('uid') id: string) {
    const user = this.usersService.update(id, data);
    return {
      message: 'Name updated succefully',
      user,
    };
  }
}
