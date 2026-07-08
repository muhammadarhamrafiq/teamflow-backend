import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment-dto';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';
import { RolesGuard } from 'src/commons/guards/roles.guard';
import { PaginationDto } from 'src/commons/helpers/pagination-dto';
import { ResourceIntegrityGuard } from 'src/commons/guards/resource-integrity.guard';
import { Resources } from 'src/commons/helpers/resource.decorator';
import { ApiParam, ApiResponse } from '@nestjs/swagger';

import type { Request } from 'express';
import {
  CreateCommentResponseDto,
  DeleteCommentResponseDto,
  GetCommentsResponseDto,
} from './dto/response-dtos';

@ApiAuth()
@ApiParam({ name: 'taskId' })
@UseGuards(RolesGuard)
@Controller({
  path: 'tasks/:taskId/comments',
  version: '1',
})
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiResponse({
    status: 201,
    type: CreateCommentResponseDto,
  })
  @Post()
  async create(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ): Promise<CreateCommentResponseDto> {
    const { userId, role } = req.orgMembership!;
    const comment = await this.commentsService.create(
      createCommentDto.message,
      taskId,
      { id: userId, role },
    );

    return {
      message: 'Comment Added',
      comment,
    };
  }

  @ApiResponse({
    status: 200,
    type: GetCommentsResponseDto,
  })
  @Get()
  async getComments(
    @Param('taskId') taskId: string,
    @Req() req: Request,
    @Query() paginationQuery: PaginationDto,
  ): Promise<GetCommentsResponseDto> {
    const { userId, role } = req.orgMembership!;
    const { comments, pagination } = await this.commentsService.getComments(
      taskId,
      {
        id: userId,
        role,
      },
      paginationQuery,
    );
    return {
      message: 'comments fetched',
      comments,
      pagination,
    };
  }

  @ApiResponse({
    status: 200,
    type: DeleteCommentResponseDto,
  })
  @Delete(':commentId')
  @UseGuards(ResourceIntegrityGuard)
  @Resources({
    parent: 'task',
    parentKey: 'taskId',
    resource: 'comment',
    resourceKey: 'commentId',
  })
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ): Promise<DeleteCommentResponseDto> {
    const { userId, role } = req.orgMembership!;
    await this.commentsService.deleteComment(commentId, {
      id: userId,
      role,
    });

    return {
      message: 'comment deleted',
    };
  }
}
