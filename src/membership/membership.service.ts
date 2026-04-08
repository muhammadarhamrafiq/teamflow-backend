import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import type { InvitationStatus, Role } from 'src/generated/prisma/enums';
import type { CreateInviteDto } from './dto/create-invited-dto';
import { TasksService } from 'src/tasks/tasks.service';
import { GetCandidatesDto } from './dto/get-candidates-dto';
import {
  PaginationDto,
  PaginationResponseDto,
} from 'src/commons/helpers/pagination-dto';
import { InviteDto } from 'src/commons/dto/membership-dto';

@Injectable()
export class MembershipService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly taskService: TasksService,
  ) {}

  private async isLastOwner(userId: string, organizationId: string) {
    const remainingOwners = await this.prismaService.userOrganization.count({
      where: { organizationId, role: 'OWNER', NOT: { userId: userId } },
    });
    return remainingOwners === 0;
  }

  private async getStatus(organizationId: string, userId: string) {
    const membership = await this.prismaService.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          organizationId,
          userId,
        },
      },
    });

    const invitation = await this.prismaService.membershipInvite.findFirst({
      where: {
        userId,
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      isMember: membership ? true : false,
      invitationStatus: invitation?.status,
    };
  }

  private async createMemberShip(invitationId: string) {
    return this.prismaService.$transaction(async (tx) => {
      const invite = await tx.membershipInvite.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' },
      });

      const membership = await tx.userOrganization.create({
        data: {
          userId: invite.userId,
          organizationId: invite.organizationId,
          role: invite.role,
        },
      });

      return { invite, membership };
    });
  }

  /**
   * Get Candidates for the membership invites
   */
  async getCandidates(organizationId: string, query: GetCandidatesDto) {
    const { email, limit = 20, page = 1 } = query;
    const users = await this.prismaService.user.findMany({
      where: {
        email: { contains: email, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        userOrganizations: {
          where: { organizationId },
        },
        membershipInvites: {
          where: { organizationId },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalUser = await this.prismaService.user.count({
      where: {
        email: { contains: email, mode: 'insensitive' },
      },
    });

    const formatedUser = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      invitationStatus: {
        isMember: user.userOrganizations[0] ? true : false,
        invited: user.membershipInvites[0] ? true : false,
        invitationStatus: user.membershipInvites[0]?.status,
      },
    }));

    return {
      users: formatedUser,
      pagination: {
        totalPages: Math.ceil(totalUser / limit),
        totalItems: totalUser,
        page,
        limit,
      },
    };
  }

  /**
   * Create Invitation
   */
  async invite(
    organizationId: string,
    createInviteDto: CreateInviteDto,
  ): Promise<InviteDto> {
    /**
     * Validate the membership does not exits already
     * Create and return the invite
     */
    const { userId, role } = createInviteDto;
    const membership = await this.prismaService.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (membership)
      throw new ConflictException(
        'User is already member of this organization',
      );

    const existingPending = await this.prismaService.membershipInvite.findFirst(
      {
        where: { userId, organizationId, status: 'PENDING' },
      },
    );
    if (existingPending) throw new ConflictException('User is already invited');

    const createdInvitation = await this.prismaService.membershipInvite.create({
      data: {
        userId,
        organizationId,
        role,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      id: createdInvitation.id,
      email: createdInvitation.user.email,
      name: createdInvitation.user.name,
      avatarUrl: createdInvitation.user.avatarUrl,
      role: createdInvitation.role,
      invitedSince: createdInvitation.createdAt,
    };
  }

  async updateInvite(id: string, status: InvitationStatus) {
    /**
     * Find the invitation latest invitation only
     * Verify it not finalized
     * If accepted add the membership
     */

    const invitation = await this.prismaService.membershipInvite.findUnique({
      where: { id },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');

    if (status === 'PENDING') return invitation;
    if (invitation.status == 'ACCEPTED' || invitation.status == 'REJECTED')
      throw new ForbiddenException('Invite is already Finalized');

    if (status === 'ACCEPTED') {
      return this.createMemberShip(id);
    } else {
      const invite = await this.prismaService.membershipInvite.update({
        where: { id },
        data: { status },
      });
      return { invite };
    }
  }

  async cancelInvitation(id: string, organizationId: string) {
    const deleted = await this.prismaService.membershipInvite.deleteMany({
      where: {
        id,
        organizationId,
        status: 'PENDING',
      },
    });

    if (deleted.count === 0)
      throw new ForbiddenException('Invitation not found or already finalized');
  }

  /**
   * Get organization Members
   */
  async getMembers(
    id: string,
    query?: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 10, search = '' } = query || {};

    const members = await this.prismaService.userOrganization.findMany({
      where: {
        organizationId: id,
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { id: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalMembers = await this.prismaService.userOrganization.count({
      where: {
        organizationId: id,
      },
    });

    return {
      members: members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        joinedSince: m.createdAt,
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalMembers / limit),
        totalItems: totalMembers,
      },
    };
  }

  /**
   * Get Invites
   */
  async getInvites(
    organizationId: string,
    pagination: PaginationDto,
  ): Promise<{ invites: InviteDto[]; pagination: PaginationResponseDto }> {
    const { limit = 20, page = 1 }: PaginationDto = pagination;

    const invites = await this.prismaService.membershipInvite.findMany({
      where: { organizationId, status: 'PENDING' },
      include: {
        user: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalInvites = await this.prismaService.membershipInvite.count({
      where: { organizationId, status: 'PENDING' },
    });

    const formatedInvites = invites.map((inv) => ({
      id: inv.id,
      name: inv.user.name,
      email: inv.user.email,
      role: inv.role,
      invitedSince: inv.createdAt,
      avatarUrl: inv.user.avatarUrl,
    }));

    return {
      invites: formatedInvites,
      pagination: {
        limit,
        page,
        totalPages: Math.ceil(totalInvites / limit),
        totalItems: totalInvites,
      },
    };
  }

  async updateRole(userId: string, organizationId: string, role: Role) {
    const membership = await this.prismaService.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) throw new NotFoundException('Membership not found');

    const isOwner = membership.role === 'OWNER';
    const isLastOwner =
      isOwner &&
      (await this.isLastOwner(membership.userId, membership.organizationId));

    if (isLastOwner)
      throw new ForbiddenException(
        'Last Owner cannot demote without assigning a user owner',
      );

    return this.prismaService.userOrganization.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: {
        role,
      },
    });
  }

  async removeMembership(userId: string, organizationId: string) {
    const membership = await this.prismaService.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) throw new NotFoundException('Membership not found');

    const isOwner = membership.role === 'OWNER';
    const isLastOwner =
      isOwner &&
      (await this.isLastOwner(membership.userId, membership.organizationId));

    if (isLastOwner)
      throw new ForbiddenException(
        'Last owner cannot leave organization either tranfer ownership or delete organization',
      );

    return this.prismaService.$transaction(async (tx) => {
      const membership = await tx.userOrganization.delete({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
      });

      await this.taskService.userLeft(tx, userId, organizationId);

      return membership;
    });
  }

  async getUserInvites(userId: string) {
    const invites = await this.prismaService.membershipInvite.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      include: {
        organization: true,
      },
    });
    return invites.map((inv) => ({
      id: inv.id,
      organizationName: inv.organization.name,
      organizationSlug: inv.organization.slug,
      organizationLogo: inv.organization.logoUrl,
      invitedOn: inv.createdAt,
      role: inv.role,
    }));
  }
}
