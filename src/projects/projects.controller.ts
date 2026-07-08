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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project-dto';
import { Roles } from 'src/commons/helpers/roles.decorator';
import { RolesGuard } from 'src/commons/guards/roles.guard';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';
import { ApiParam, ApiResponse } from '@nestjs/swagger';

import type { Request } from 'express';
import { GetProjectDto } from './dto/get-project-dto';
import {
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from './dto/update-project-dto';
import { ResourceIntegrityGuard } from 'src/commons/guards/resource-integrity.guard';
import { Resources } from 'src/commons/helpers/resource.decorator';
import {
  CreateProjectResponseDto,
  DeleteProjectResponseDto,
  GetProjectResponseDto,
  GetProjectsResponseDto,
  ProjectStatusUpdateResponseDto,
  ProjectUpdateResponseDto,
} from './dto/response-dto';

@ApiAuth()
@ApiParam({ name: 'orgId' })
@UseGuards(RolesGuard)
@Controller({
  path: 'orgs/:orgId/projects',
  version: '1',
})
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /*
   * Create Project
   */
  @ApiResponse({
    status: 201,
    type: CreateProjectResponseDto,
  })
  @Post()
  @Roles('OWNER', 'ADMIN')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: Request,
  ): Promise<CreateProjectResponseDto> {
    const { organizationId } = req.orgMembership!;
    const project = await this.projectsService.create({
      organizationId,
      ...createProjectDto,
    });
    return {
      message: 'Project created successfully',
      project,
    };
  }

  /**
   * Get Projects
   */
  @ApiResponse({
    status: 200,
    type: GetProjectsResponseDto,
  })
  @Get()
  async getProjects(
    @Req() req: Request,
    @Query() getProjectDto: GetProjectDto,
  ): Promise<GetProjectsResponseDto> {
    const membership = req.orgMembership!;
    const data = await this.projectsService.getProjects(
      membership,
      {
        page: getProjectDto.page,
        limit: getProjectDto.limit,
        search: getProjectDto.search,
      },
      getProjectDto.projectStatus,
    );
    return {
      message: 'Projects fetched',
      ...data,
    };
  }

  /**
   * Get Project By Slug
   */
  @ApiResponse({
    status: 200,
    type: GetProjectResponseDto,
  })
  @Get(':pslug')
  async getProject(
    @Param('pslug') slug: string,
    @Req() req: Request,
  ): Promise<GetProjectResponseDto> {
    const membership = req.orgMembership!;
    const project = await this.projectsService.getProject(slug, membership);
    return {
      message: 'Project fetched',
      project,
    };
  }

  /**
   * Updated Project
   */
  @ApiResponse({
    status: 200,
    type: ProjectUpdateResponseDto,
  })
  @Patch(':projectId')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(ResourceIntegrityGuard)
  @Resources({
    parent: 'organization',
    parentKey: 'orgId',
    resource: 'project',
    resourceKey: 'projectId',
  })
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectUpdateResponseDto> {
    const project = await this.projectsService.updateProject(
      projectId,
      updateProjectDto,
    );
    return {
      message: 'Project updated successfully',
      project,
    };
  }

  /**
   * Update Project Status
   */
  @ApiResponse({
    status: 200,
    type: UpdateProjectStatusDto,
  })
  @Patch(':projectId/status')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(ResourceIntegrityGuard)
  @Resources({
    parent: 'organization',
    parentKey: 'orgId',
    resource: 'project',
    resourceKey: 'projectId',
  })
  async updateStatus(
    @Param('projectId') projectId: string,
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
  ): Promise<ProjectStatusUpdateResponseDto> {
    const project = await this.projectsService.updateProjectStatus(
      projectId,
      updateProjectStatusDto.status,
    );
    return {
      message: 'Project status updated successfully',
      project,
    };
  }

  @ApiResponse({
    status: 200,
    type: DeleteProjectResponseDto,
  })
  @Delete(':projectId')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(ResourceIntegrityGuard)
  @Resources({
    parent: 'organization',
    parentKey: 'orgId',
    resource: 'project',
    resourceKey: 'projectId',
  })
  async deleteProject(
    @Param('projectId') projectId: string,
  ): Promise<DeleteProjectResponseDto> {
    await this.projectsService.deleteProject(projectId);
    return {
      message: 'Project deleted',
    };
  }
}
