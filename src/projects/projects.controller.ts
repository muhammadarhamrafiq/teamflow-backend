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
import { Roles } from 'src/orgs/decorators/roles.decorator';
import { MemberShipGuard } from 'src/orgs/guards/member.guard';
import { RolesGuard } from 'src/orgs/guards/roles.guard';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';
import { ApiParam } from '@nestjs/swagger';

import type { Request } from 'express';
import { GetProjectDto } from './dto/get-project-dto';
import {
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from './dto/update-project-dto';

@ApiAuth()
@ApiParam({ name: 'orgId' })
@UseGuards(MemberShipGuard, RolesGuard)
@Controller({
  path: 'orgs/:orgId/projects',
  version: '1',
})
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: Request,
  ) {
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

  @Get()
  async getProjects(
    @Req() req: Request,
    @Query() getProjectDto: GetProjectDto,
  ) {
    const membership = req.orgMembership!;
    const data = await this.projectsService.getProjects(
      membership,
      {
        page: getProjectDto.page,
        limit: getProjectDto.limit,
      },
      getProjectDto.archieved,
    );
    return {
      message: 'Projects fetched',
      ...data,
    };
  }

  @Get(':pslug')
  async getProject(@Param('pslug') slug: string, @Req() req: Request) {
    const membership = req.orgMembership!;
    const project = await this.projectsService.getProject(slug, membership);
    return {
      message: 'Project fetched',
      project,
    };
  }

  @Patch(':projectId')
  @Roles('OWNER', 'ADMIN')
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Param('orgId') organizationId: string,
  ) {
    const project = await this.projectsService.updateProject(
      projectId,
      updateProjectDto,
      organizationId,
    );
    return {
      message: 'Project updated successfully',
      project,
    };
  }

  @Patch(':projectId/status')
  @Roles('OWNER', 'ADMIN')
  async updateStatus(
    @Param('projectId') projectId: string,
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
    @Param('orgId') organizationId: string,
  ) {
    const project = await this.projectsService.updateProjectStatus(
      projectId,
      organizationId,
      updateProjectStatusDto.status,
    );
    return {
      message: 'Project status updated successfully',
      project,
    };
  }

  @Delete(':projectId')
  @Roles('OWNER', 'ADMIN')
  async deleteProject(
    @Param('projectId') projectId: string,
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
    @Param('orgId') organizationId: string,
  ) {
    const project = await this.projectsService.deleteProject(
      projectId,
      organizationId,
    );
    return {
      message: 'Project deleted',
      project,
    };
  }
}
