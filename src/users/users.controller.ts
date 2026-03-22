import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { ActionTokenGuard } from './guards/action-token.guard';

import { Purpose } from './decorators/purpose.decorator';
import { Public } from '../commons/helpers/public.decorator';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';

import type { Request, Response } from 'express';
import {
  updateInviteStatusDto,
  UpdateNameDto,
  UpdatePasswordDto,
} from './dto/update-dtos';
import { RegisterUserDto } from './dto/register-dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { RegisterResponseDto, UpdatedUserResponse } from './dto/responses-dto';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiQuery({ name: 'token' })
  @ApiResponse({ status: 201, type: RegisterResponseDto })
  @Public()
  @Post()
  @Purpose('verify_email')
  @UseGuards(ActionTokenGuard)
  async register(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
    const email = req.action?.email;
    const { accessToken, refreshToken, user } =
      await this.usersService.register({
        email: email!,
        ...registerUserDto,
      });

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
      message: 'User created Successfully',
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
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

  @ApiResponse({
    status: 200,
    description: 'Successfully reset the password',
    type: UpdatedUserResponse,
  })
  @ApiQuery({ name: 'token' })
  @Public()
  @Patch('password')
  @Purpose('reset_password')
  @UseGuards(ActionTokenGuard)
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: Request,
  ): Promise<UpdatedUserResponse> {
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
  @ApiResponse({
    status: 200,
    type: UpdatedUserResponse,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
            errorMessage: 'Max upload size is 2MB',
          }),
          new FileTypeValidator({
            fileType: /(jpeg|jpg|png|webp)$/,
            errorMessage: 'Invalid file type',
          }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ): Promise<UpdatedUserResponse> {
    const { id } = req.user!;
    const user = await this.usersService.updateAvatar(id, avatar.buffer);
    return {
      message: 'Avatar updated successfully',
      user,
    };
  }

  @ApiAuth()
  @Delete('avatar')
  async removeAvatar(@Req() req: Request) {
    const { id } = req.user!;
    const user = await this.usersService.removeAvatar(id);
    return {
      message: 'Avatar updated successfully',
      user,
    };
  }

  @ApiAuth()
  @Get('invites')
  async getInvites(@Req() req: Request) {
    const userId = req.user!.id;
    const invitations = await this.usersService.getInvites(userId);
    return {
      message: 'Invites fetched successfully',
      invitations,
    };
  }

  @ApiAuth()
  @Patch('invites/:inviteId')
  async updateInvite(
    @Param('inviteId') inviteId: string,
    @Query() updateInviteStatus: updateInviteStatusDto,
  ) {
    const response = await this.usersService.updateInvite(
      inviteId,
      updateInviteStatus.status,
    );
    return {
      message: 'Status updated succesfully',
      ...response,
    };
  }

  @ApiAuth()
  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.findUserByEmail(email, true);
    return {
      messgae: user ? 'User fetched successfully' : 'User Not Found',
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      },
    };
  }
}
