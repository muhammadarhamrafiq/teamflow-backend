import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.id as string;
    const orgSlug = request.params.slug as string;

    const membership =
      request.orgMembership || (await this.getMemberShip(userId, orgSlug));

    if (!membership) throw new UnauthorizedException();
    if (!requiredRoles.includes(membership.role))
      throw new ForbiddenException('Permission Denied');

    request.orgMembership = membership;

    return true;
  }

  async getMemberShip(userId: string, slug: string) {
    return await this.prismaService.userOrganization.findFirst({
      where: {
        userId,
        organization: { slug },
      },
      select: {
        userId: true,
        organizationId: true,
        role: true,
      },
    });
  }
}
