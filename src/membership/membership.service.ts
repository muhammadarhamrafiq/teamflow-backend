import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import type { InvitationStatus, Role } from 'src/generated/prisma/enums';
import type { CreateInviteDto } from './dto/create-invited-dto';

@Injectable()
export class MembershipService {
  constructor(private readonly prismaService: PrismaService) {}

  async invite(organizationId: string, createInviteDto: CreateInviteDto) {
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

    return this.prismaService.membershipInvite.create({
      data: {
        userId,
        organizationId,
        role,
      },
    });
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

    return { message: 'Invitation cancelled successfully' };
  }

  async getStatus(organizationId: string, userId: string) {
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

  async getInvites(organizationId: string) {
    const invites = await this.prismaService.membershipInvite.findMany({
      where: { organizationId, status: 'PENDING' },
      include: {
        user: true,
      },
    });

    return invites.map((inv) => ({
      id: inv.id,
      invitedOn: inv.createdAt,
      username: inv.user.name,
      email: inv.user.email,
      userId: inv.userId,
      role: inv.role,
    }));
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

  private async isLastOwner(userId: string, organizationId: string) {
    const remainingOwners = await this.prismaService.userOrganization.count({
      where: { organizationId, role: 'OWNER', NOT: { userId: userId } },
    });
    return remainingOwners === 0;
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

    return this.prismaService.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
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
