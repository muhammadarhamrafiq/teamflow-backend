import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';
import { RolesGuard } from 'src/commons/guards/roles.guard';
import { Roles } from 'src/commons/helpers/roles.decorator';
import { CreateTaskDto } from './dto/create-task-dto';

import type { Request } from 'express';
import { UpdateTaskDto, UpdateTaskStatusDto } from './dto/update-task-dto';
import { ResourceIntegrityGuard } from 'src/commons/guards/resource-integrity.guard';
import { Resources } from 'src/commons/helpers/resource.decorator';
import { ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  CreateTaskResponseDto,
  GetTaskResponseDto,
  GetTasksResponseDto,
  UpdateTaskResponseDto,
} from './dto/response-dto';
import { GetTaskDto } from './dto/get-task-dto';

@ApiAuth()
@ApiParam({ name: 'projectId' })
@UseGuards(RolesGuard)
@Controller({
  path: 'projects/:projectId/tasks',
  version: '1',
})
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create Task
   */
  @ApiResponse({
    status: 201,
    type: CreateTaskResponseDto,
  })
  @Post()
  @Roles('OWNER', 'ADMIN')
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: Request,
    @Param('projectId') projectId: string,
  ): Promise<CreateTaskResponseDto> {
    const { organizationId } = req.orgMembership!;
    const task = await this.tasksService.createTask(
      createTaskDto,
      organizationId,
      projectId,
    );

    return {
      message: 'Task created successfully',
      task,
    };
  }

  /**
   * Get Tasks of the project
   */
  @ApiResponse({
    status: 200,
    type: GetTasksResponseDto,
  })
  @Get()
  async getTasks(
    @Param('projectId') projectId: string,
    @Req() req: Request,
    @Query() query: GetTaskDto,
  ): Promise<GetTasksResponseDto> {
    const { userId, role } = req.orgMembership!;
    const { tasks, pagination } = await this.tasksService.getTasks(
      projectId,
      userId,
      role,
      query,
    );
    return {
      message: 'Tasks fetched',
      tasks,
      pagination,
    };
  }

  /**
   * Get Single Task
   */
  @ApiResponse({
    status: 200,
    type: GetTaskResponseDto,
  })
  @Get(':taskId')
  @UseGuards(ResourceIntegrityGuard)
  @Resources({
    parent: 'project',
    parentKey: 'projectId',
    resource: 'task',
    resourceKey: 'taskId',
  })
  async getTask(
    @Param('taskId') taskId: string,
    @Req() req: Request,
  ): Promise<GetTaskResponseDto> {
    const { userId, role } = req.orgMembership!;
    const task = await this.tasksService.getTask(taskId, userId, role);
    return {
      message: 'Task fetched',
      task,
    };
  }

  /**
   * Update Task
   */
  @ApiResponse({
    status: 200,
    type: UpdateTaskResponseDto,
  })
  @Patch(':taskId')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(ResourceIntegrityGuard)
  @Resources({
    parent: 'project',
    parentKey: 'projectId',
    resource: 'task',
    resourceKey: 'taskId',
  })
  async updateTask(
    @Body() updateTaskDto: UpdateTaskDto,
    @Param('taskId') taskId: string,
  ): Promise<UpdateTaskResponseDto> {
    const task = await this.tasksService.updateTask(taskId, updateTaskDto);
    return {
      message: 'Task updated',
      task,
    };
  }

  /**
   * Update Task Status
   */
  @ApiResponse({
    status: 200,
    type: UpdateTaskResponseDto,
  })
  @Patch(':taskId/status')
  @UseGuards(ResourceIntegrityGuard)
  @Resources({
    parent: 'project',
    parentKey: 'projectId',
    resource: 'task',
    resourceKey: 'taskId',
  })
  async updateStatus(
    @Param('taskId') taskId: string,
    @Body() updateStatusDto: UpdateTaskStatusDto,
    @Req() req: Request,
  ): Promise<UpdateTaskResponseDto> {
    const { userId, role } = req.orgMembership!;
    const task = await this.tasksService.updateTaskStatus(
      taskId,
      updateStatusDto.status,
      {
        id: userId,
        role: role,
      },
    );

    return {
      message: 'task updated',
      task,
    };
  }

  /**
   * Delete Task
   */
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
    type: UpdateTaskResponseDto,
  })
  @Delete(':taskId')
  @UseGuards(ResourceIntegrityGuard)
  @Resources({
    parent: 'project',
    parentKey: 'projectId',
    resource: 'task',
    resourceKey: 'taskId',
  })
  async deleteTask(
    @Param('taskId') taskId: string,
  ): Promise<UpdateTaskResponseDto> {
    const task = await this.tasksService.deleteTask(taskId);
    return {
      message: 'task deleted',
      task,
    };
  }
}
