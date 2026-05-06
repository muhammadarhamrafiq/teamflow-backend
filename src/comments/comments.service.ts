import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentDto, CommentWithAuthor } from 'src/commons/dto/comment-dto';
import {
  PaginationDto,
  PaginationResponseDto,
} from 'src/commons/helpers/pagination-dto';
import { ProjectStatus, Role, TaskStatus } from 'src/generated/prisma/enums';
import { CommentWhereInput, TaskWhereInput } from 'src/generated/prisma/models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentsService {
  private readonly blockedTaskStatus: Set<TaskStatus>;
  private readonly blockedProjectStatus: Set<ProjectStatus>;

  constructor(private readonly prismaService: PrismaService) {
    this.blockedProjectStatus = new Set<ProjectStatus>([
      'ARCHIVED',
      'COMPLETED',
      'ON_HOLD',
    ]);
    this.blockedTaskStatus = new Set<TaskStatus>(['CANCELLED', 'DONE']);
  }

  /**
   * Create a comment
   */
  async create(
    message: string,
    taskId: string,
    user: { id: string; role: Role },
  ): Promise<CommentDto> {
    const where: TaskWhereInput = { id: taskId };

    if (user.role === 'MEMBER') where.assigneeId = user.id;

    const task = await this.prismaService.task.findFirst({
      where,
      include: { project: { select: { projectStatus: true } } },
    });

    if (!task) throw new NotFoundException('Task not found');
    if (this.blockedProjectStatus.has(task.project.projectStatus))
      throw new ForbiddenException('Cannot comment at this stage');
    if (this.blockedTaskStatus.has(task.taskStatus))
      throw new ForbiddenException('Cannot comment at this stage');

    return this.prismaService.comment.create({
      data: {
        message,
        taskId,
        authorId: user.id,
      },
      select: {
        id: true,
        message: true,
        authorId: true,
      },
    });
  }

  /**
   * Get comments for a task with pagination
   */
  async getComments(
    taskId: string,
    user: { id: string; role: Role },
    pagination?: PaginationDto,
  ): Promise<{
    comments: CommentWithAuthor[];
    pagination: PaginationResponseDto;
  }> {
    const where: CommentWhereInput = {
      taskId,
    };

    if (user.role === 'MEMBER') {
      where.task = {
        assigneeId: user.id,
      };
    }

    const { page = 1, limit = 10 } = pagination || {};

    const comments = await this.prismaService.comment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const counts = await this.prismaService.comment.count({ where });

    return {
      comments: comments.map((c) => ({
        id: c.id,
        message: c.message,
        author: {
          id: c.authorId,
          name: c.author.name,
          email: c.author.email,
          avatarUrl: c.author.avatarUrl,
          byMe: c.authorId === user.id,
        },
      })),
      pagination: {
        page,
        limit,
        totalItems: counts,
        totalPages: Math.ceil(counts / limit),
      },
    };
  }

  /**
   * Delete a comment
   */
  async deleteComment(
    commentId: string,
    user: { id: string; role: Role },
  ): Promise<void> {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          include: { project: true },
        },
      },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    if (this.blockedProjectStatus.has(comment?.task.project.projectStatus))
      throw new ForbiddenException('Cannot delete this task at this stage');

    if (this.blockedTaskStatus.has(comment?.task.taskStatus))
      throw new ForbiddenException('Cannot delete this task at this stage');

    if (user.role === 'MEMBER' && comment?.authorId !== user.id)
      throw new UnauthorizedException('Cannot delete this comment');

    await this.prismaService.comment.delete({
      where: { id: commentId },
    });
  }
}
