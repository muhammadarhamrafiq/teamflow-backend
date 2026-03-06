import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.id as string;

    let orgId = this.getOrgId(request);
    if (!orgId && request.params.projectId) {
      orgId = await this.getOrgIdByProjectId(request);
    }
    if (!orgId && request.params.taskId) {
      orgId = await this.getOrgIdByTaskId(request);
    }
    if (!orgId) throw new UnauthorizedException();

    const membership = await this.getMemberShip(userId, orgId);

    if (!membership) throw new UnauthorizedException();

    if (
      requiredRoles &&
      requiredRoles.length !== 0 &&
      !requiredRoles.includes(membership.role)
    )
      throw new ForbiddenException('Permission Denied');

    request.orgMembership = membership;

    return true;
  }

  async getMemberShip(userId: string, orgId: string) {
    return await this.prismaService.userOrganization.findFirst({
      where: {
        userId,
        organizationId: orgId,
      },
      select: {
        userId: true,
        organizationId: true,
        role: true,
      },
    });
  }

  private getOrgId(request: Request): string | undefined {
    return typeof request.params.orgId === 'string'
      ? request.params.orgId
      : undefined;
  }

  private async getOrgIdByProjectId(
    request: Request,
  ): Promise<string | undefined> {
    const projectId = request.params.projectId;
    if (typeof projectId !== 'string') return undefined;

    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new UnauthorizedException();
    return project.organizationId;
  }

  private async getOrgIdByTaskId(
    request: Request,
  ): Promise<string | undefined> {
    const tasksId = request.params.taskId;
    if (typeof tasksId !== 'string') return undefined;

    const task = await this.prismaService.task.findUnique({
      where: { id: tasksId },
      select: {
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!task) throw new UnauthorizedException();
    return task.project.organizationId;
  }
}
