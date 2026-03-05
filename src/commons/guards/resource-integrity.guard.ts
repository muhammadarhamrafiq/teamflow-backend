import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResourceIntegrityOptions } from '../helpers/resource.decorator';
import { Project, Task, Comment } from 'src/generated/prisma/client';

@Injectable()
export class ResourceIntegrityGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const params = request.params;

    const integrity = this.reflector.get<ResourceIntegrityOptions>(
      'resourceIntegrityOptions',
      context.getHandler(),
    );

    if (!integrity) return true;

    const resourceId = params[integrity.resourceKey];

    if (typeof resourceId !== 'string')
      throw new BadRequestException(`Invalid ${integrity.resourceKey}`);

    let resource: Project | Task | Comment | null = null;

    switch (integrity.resource) {
      case 'project':
        resource = await this.prismaService.project.findUnique({
          where: { id: resourceId },
        });
        break;
      case 'task':
        resource = await this.prismaService.task.findUnique({
          where: { id: resourceId },
        });
        break;
      case 'comment':
        resource = await this.prismaService.comment.findUnique({
          where: { id: resourceId },
        });
        break;
    }

    if (!resource)
      throw new NotFoundException(`${integrity.resource} not found`);

    const parentId = params[integrity.parentKey];

    if (typeof parentId !== 'string')
      throw new BadRequestException(`Invalid ${integrity.parentKey}`);

    const parentFieldMap = {
      organization: 'organizationId',
      project: 'projectId',
      task: 'taskId',
    } as const;

    const field = parentFieldMap[integrity.parent];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const resourceParentId = resource[field];

    if (resourceParentId !== parentId)
      throw new NotFoundException(`${integrity.resource} not found`);

    request[integrity.resource] = resource;

    return true;
  }
}
