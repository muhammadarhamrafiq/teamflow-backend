import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project-dto';
import slugify from 'slugify';
import { ProjectStatus, Role, TaskStatus } from 'src/generated/prisma/enums';
import { ProjectWhereInput } from 'src/generated/prisma/models';
import { Task } from 'src/generated/prisma/client';
import { UpdateProjectDto } from './dto/update-project-dto';
import { TransactionClient } from 'src/generated/prisma/internal/prismaNamespace';
import {
  ProjectBaseDto,
  ProjectDetailDto,
  ProjectStatusUpdateDto,
  ProjectWithUpdatedAtDto,
} from 'src/commons/dto/project-dto';
import { PaginationResponseDto } from 'src/commons/helpers/pagination-dto';

@Injectable()
export class ProjectsService {
  private readonly transactions: Record<ProjectStatus, ProjectStatus[]> =
    Object.freeze({
      PLANNING: ['ACTIVE', 'ARCHIVED'],
      ACTIVE: ['ON_HOLD', 'ARCHIVED'],
      ON_HOLD: ['ACTIVE', 'ARCHIVED'],
      COMPLETED: ['ARCHIVED'],
      ARCHIVED: [],
    });

  constructor(private readonly prismaService: PrismaService) {}

  private async generateSlug(name: string, organizationId: string) {
    const baseSlug = slugify(name, {
      trim: true,
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (
      await this.prismaService.project.findUnique({
        where: {
          organizationId_slug: { organizationId, slug },
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private getTasksCount(tasks: Task[]) {
    const taskData: Record<TaskStatus | 'total', number> = {
      total: tasks.length,
      BACKLOG: 0,
      BLOCKED: 0,
      CANCELLED: 0,
      DONE: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      TODO: 0,
    };

    tasks.forEach((task) => {
      if (task.taskStatus in taskData) taskData[task.taskStatus]++;
    });

    return taskData;
  }

  /**
   * Create Project
   */
  async create(
    data: { organizationId: string } & CreateProjectDto,
  ): Promise<ProjectBaseDto> {
    const slug = await this.generateSlug(data.name, data.organizationId);
    const project = await this.prismaService.project.create({
      data: {
        ...data,
        slug,
      },

      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        dueDate: true,
        createdAt: true,
        projectStatus: true,
      },
    });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      slug: project.slug,
      dueDate: project.dueDate,
      startOn: project.createdAt,
      status: project.projectStatus,
    };
  }

  /**
   * Get Projects
   */
  async getProjects(
    membership: { organizationId: string; userId: string; role: Role },
    pagination?: { page?: number; limit?: number; search?: string },
    projectStatus?: ProjectStatus,
  ): Promise<{
    projects: ProjectBaseDto[];
    pagination: PaginationResponseDto;
  }> {
    const { organizationId, userId, role } = membership;
    const { page = 1, limit = 10, search = '' } = pagination || {};

    const where: ProjectWhereInput = {
      organizationId,
      name: {
        contains: search,
        mode: 'insensitive',
      },
    };

    if (role === 'MEMBER') {
      where.tasks = {
        some: {
          assigneeId: userId,
        },
      };
    }

    if (!projectStatus) {
      where.NOT = { projectStatus: 'ARCHIVED' };
    } else {
      where.projectStatus = projectStatus;
    }

    const projects = await this.prismaService.project.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    const projectsCount = await this.prismaService.project.count({ where });

    return {
      projects: projects.map((proj) => ({
        id: proj.id,
        name: proj.name,
        slug: proj.slug,
        description: proj.description,
        dueDate: proj.dueDate,
        startOn: proj.createdAt,
        status: proj.projectStatus,
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(projectsCount / limit),
        totalItems: projectsCount,
      },
    };
  }

  async getProject(
    slug: string,
    membership: { organizationId: string; userId: string; role: Role },
  ): Promise<ProjectDetailDto> {
    const { organizationId, userId, role } = membership;

    const where: ProjectWhereInput = {
      organizationId,
      slug,
    };

    if (role === 'MEMBER') {
      where.tasks = {
        some: {
          assigneeId: userId,
        },
      };
    }

    const project = await this.prismaService.project.findFirst({
      where,
      include: {
        tasks: true,
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    const availableActions = this.transactions[project.projectStatus];

    const tasksCounts = this.getTasksCount(project.tasks);

    return {
      id: project.id,
      name: project.name,
      status: project.projectStatus,
      slug: project.slug,
      startOn: project.createdAt,
      dueDate: project.dueDate,
      description: project.description,
      tasksCounts,
      availableActions,
    };
  }

  /**
   * Update Project
   */
  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectWithUpdatedAtDto> {
    const proj = await this.prismaService.project.findFirst({
      where: { id, NOT: { projectStatus: 'ARCHIVED' } },
    });

    if (!proj) throw new NotFoundException('Project not found');

    const data: UpdateProjectDto & { slug?: string } = updateProjectDto;

    if (data.name && data.name != proj.name) {
      data.slug = await this.generateSlug(data.name, proj.organizationId);
    }

    return this.prismaService.project.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        updatedAt: true,
      },
    });
  }

  /*
   * Project Status Update
   */
  async updateProjectStatus(
    id: string,
    status: ProjectStatus,
  ): Promise<ProjectStatusUpdateDto> {
    const proj = await this.prismaService.project.findFirst({
      where: { id },
    });

    if (!proj) throw new NotFoundException('Project not found');

    const updatedProject = await this.updateProjectStatusInternal(
      id,
      this.prismaService,
      true,
      status,
    );

    return {
      id: updatedProject.id,
      lastUpdatedAt: updatedProject.updatedAt,
      status: updatedProject.projectStatus,
    };
  }

  async updateProjectStatusInternal(
    id: string,
    tx: TransactionClient,
    manual = false,
    status?: ProjectStatus,
  ) {
    const proj = await this.prismaService.project.findUnique({
      where: { id },
      include: {
        tasks: {
          select: { taskStatus: true },
        },
      },
    });

    if (!proj) throw new NotFoundException('Project not found');
    if (proj.projectStatus === 'ARCHIVED')
      throw new ForbiddenException(
        'No changes allowed in the archieved project',
      );

    const hasTask = proj.tasks.length > 0;
    const allCompleted =
      hasTask &&
      proj.tasks.every(
        (t) => t.taskStatus === 'DONE' || t.taskStatus == 'CANCELLED',
      );

    let newStatus: ProjectStatus;
    if (manual) {
      if (!status || !this.transactions[proj.projectStatus].includes(status)) {
        throw new ForbiddenException('Invalid status update');
      }
      newStatus = status;
    } else {
      if (allCompleted && proj.projectStatus !== 'COMPLETED')
        newStatus = 'COMPLETED';
      else if (!allCompleted && proj.projectStatus === 'COMPLETED')
        newStatus = 'ACTIVE';
      else if (!hasTask && proj.projectStatus !== 'PLANNING')
        newStatus = 'ON_HOLD';
      else return proj;
    }
    if (newStatus === proj.projectStatus) return proj;

    return tx.project.update({
      where: { id },
      data: {
        projectStatus: newStatus,
      },
    });
  }

  async deleteProject(id: string) {
    return this.prismaService.project.delete({
      where: {
        id,
      },
    });
  }
}
