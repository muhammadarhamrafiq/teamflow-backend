import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MemberShipGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const orgId = request.params.orgId as string;

    if (!user) throw new UnauthorizedException();

    const membership = await this.prismaService.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: orgId,
      },
      select: {
        userId: true,
        organizationId: true,
        role: true,
      },
    });

    if (!membership) throw new UnauthorizedException();

    request.orgMembership = membership;
    return true;
  }
}
