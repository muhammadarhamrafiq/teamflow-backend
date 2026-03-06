import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task-dto';
import { ProjectsService } from 'src/projects/projects.service';
import { UpdateTaskDto } from './dto/update-task-dto';
import { ProjectStatus, Role, TaskStatus } from 'src/generated/prisma/enums';
import { TaskWhereInput } from 'src/generated/prisma/models';
import { TASK_WORKFLOW } from './helpers/workflow';

import type { TASK_WORKFLOW_TYPE } from './helpers/workflow';
import { TransactionClient } from 'src/generated/prisma/internal/prismaNamespace';
import { PaginationDto } from 'src/commons/helpers/pagination-dto';
@Injectable()
export class TasksService {
  private readonly lockedProjectStates: Set<ProjectStatus>;
  private readonly lockedTaskStates: Set<TaskStatus>;
  private readonly workflowrules: TASK_WORKFLOW_TYPE;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly projectService: ProjectsService,
  ) {
    this.lockedProjectStates = new Set<ProjectStatus>([
      'COMPLETED',
      'ON_HOLD',
      'ARCHIVED',
    ]);
    this.lockedTaskStates = new Set<TaskStatus>(['DONE', 'CANCELLED']);
    this.workflowrules = TASK_WORKFLOW;
  }

  private validateDates(startDate: Date, dueDate: Date) {
    if (startDate > dueDate) {
      throw new BadRequestException('Start Date cannot be after due Date');
    }
  }

  private getNextAllowedStatus(
    taskStatus: TaskStatus,
    role: Role,
  ): TaskStatus[] {
    return Object.entries(this.workflowrules[taskStatus] ?? {})
      .filter(([, roles]) => roles.includes(role))
      .map(([state]) => state as TaskStatus);
  }

  private async validateUserMembership(organizationId: string, userId: string) {
    const membership = await this.prismaService.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership)
      throw new ForbiddenException('User is not member of organization');
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    organizationId: string,
    projectId: string,
  ) {
    /**
     * Validate the start data is less the end data
     * Validate the provided user is part of the organization
     * Add the task and pass the transaction client to the update project project status
     */
    if (createTaskDto.startDate && createTaskDto.dueDate)
      this.validateDates(createTaskDto.startDate, createTaskDto.dueDate);

    if (createTaskDto.assigneeId)
      await this.validateUserMembership(
        organizationId,
        createTaskDto.assigneeId,
      );

    const task = await this.prismaService.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          ...createTaskDto,
          projectId,
        },
      });

      await this.projectService.updateProjectStatusInternal(projectId, tx);

      return task;
    });

    return task;
  }

  async getTasks(
    projectId: string,
    userId: string,
    role: Role,
    pagination?: PaginationDto,
  ) {
    /**
     * If the user is access the tasks only return the task where he has the assigneeId
     * Apply the pagination
     * Return the tasks with the count of comments on it
     */

    const where: TaskWhereInput = {
      projectId,
    };

    if (role === 'MEMBER') where.assigneeId = userId;
    const { page = 1, limit = 20 } = pagination ?? {};

    const tasks = await this.prismaService.task.findMany({
      where,
      include: { assignee: { select: { id: true, name: true } } },
      orderBy: [{ updatedAt: 'desc' }, { startDate: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalCount = await this.prismaService.task.count({ where });

    return {
      tasks,
      pagination: {
        page,
        limit,
        totalCount: Math.ceil(totalCount / limit),
      },
    };
  }

  async getTask(taskId: string, userId: string, role: Role) {
    const where: TaskWhereInput = {
      id: taskId,
    };

    if (role === 'MEMBER') where.assigneeId = userId;

    const task = await this.prismaService.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        comments: {
          select: { id: true },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    return {
      ...task,
      comments: task.comments.length,
      nextStates: this.getNextAllowedStatus(task.taskStatus, role),
    };
  }

  async updateTask(taskId: string, updateTaskDto: UpdateTaskDto) {
    /**
     * if update project contains a date validate it
     * validate the project is not archieved or complete
     * if the update project contains userId validate the membership
     * validate the task status is not DONE
     */
    const task = await this.prismaService.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            projectStatus: true,
            organizationId: true,
          },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (this.lockedTaskStates.has(task.taskStatus))
      throw new BadRequestException({
        message: 'Cannot Update the task now',
      });

    if (this.lockedProjectStates.has(task.project.projectStatus))
      throw new ForbiddenException('Cannot Update the tasks at this stage');

    const startDate = updateTaskDto.startDate ?? task.startDate;
    const dueDate = updateTaskDto.dueDate ?? task.dueDate;
    if (startDate && dueDate) this.validateDates(startDate, dueDate);

    if (updateTaskDto.assigneeId)
      await this.validateUserMembership(
        updateTaskDto.assigneeId,
        task.project.organizationId,
      );

    return this.prismaService.task.update({
      where: { id: taskId },
      data: updateTaskDto,
    });
  }

  async deleteTask(taskId: string) {
    const task = await this.prismaService.task.findUnique({
      where: { id: taskId },
      select: {
        taskStatus: true,
        project: {
          select: { projectStatus: true },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.taskStatus === 'DONE')
      throw new ForbiddenException('Cannot delete the task');

    if (this.lockedProjectStates.has(task.project.projectStatus))
      throw new ForbiddenException('Cannot delete the task');

    return await this.prismaService.$transaction(async (tx) => {
      const task = await tx.task.delete({
        where: { id: taskId },
      });

      await this.projectService.updateProjectStatusInternal(task.projectId, tx);

      return task;
    });
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    user: { id: string; role: Role },
  ) {
    /**
     * Validate the project is ACTIVE
     * Validate its valid transaction by valid role
     * if its for TODO validate that the assigneeId is not null
     * do the taskstatus update and passtransaction client to the project;
     */
    const where: TaskWhereInput = { id: taskId };
    if (user.role === 'MEMBER') where.assigneeId = user.id;
    const task = await this.prismaService.task.findFirst({
      where,
      include: {
        project: { select: { projectStatus: true } },
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.project.projectStatus !== 'ACTIVE')
      throw new ForbiddenException('Cannot update the task status');

    const currentStatus = task.taskStatus;
    const allowedRoles = this.workflowrules[task.taskStatus]?.[status] ?? [];

    if (!allowedRoles.includes(user.role))
      throw new ForbiddenException('Invalid status update');

    if (status === 'TODO' && !task.assigneeId)
      throw new BadRequestException(
        'Invalid status Update assignee is required',
      );

    return this.prismaService.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id: taskId, taskStatus: currentStatus },
        data: { taskStatus: status },
      });

      await this.projectService.updateProjectStatusInternal(task.projectId, tx);

      return task;
    });
  }

  async userLeft(
    tx: TransactionClient,
    userId: string,
    organizationId?: string,
  ) {
    const baseWhere: TaskWhereInput = { assigneeId: userId };
    if (organizationId) baseWhere.project = { organizationId };

    await tx.task.updateMany({
      where: { ...baseWhere, taskStatus: 'BACKLOG' },
      data: { assigneeId: null },
    });

    await tx.task.updateMany({
      where: {
        ...baseWhere,
        taskStatus: { notIn: ['BACKLOG', 'DONE', 'CANCELLED'] },
      },
      data: {
        assigneeId: null,
        taskStatus: 'BLOCKED',
      },
    });
  }
}
