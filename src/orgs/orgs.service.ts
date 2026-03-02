import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import slugify from 'slugify';

import type { CreateOrgDto } from './dto/create-org-dto';
import type { UpdateOrgDto } from './dto/update-org-dto';
import type {
  OrganizationUpdateInput,
  ProjectWhereInput,
} from 'src/generated/prisma/models';

@Injectable()
export class OrgsService {
  constructor(private readonly prismaService: PrismaService) {}

  private async generateSlug(name: string) {
    const baseSlug = slugify(name, {
      trim: true,
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (
      await this.prismaService.organization.findUnique({ where: { slug } })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async create(organization: CreateOrgDto, userId: string) {
    /**
     * Generate the slug
     * Create the organization
     */
    const slug = await this.generateSlug(organization.name);

    return await this.prismaService.organization.create({
      data: {
        name: organization.name,
        slug: slug,
        description: organization.description,
        organizationUsers: {
          create: {
            userId: userId,
            role: 'OWNER',
          },
        },
      },
    });
  }

  async getOrgs(userId: string) {
    const orgs = await this.prismaService.userOrganization.findMany({
      where: { userId },

      select: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    return orgs.map((org) => ({
      ...org.organization,
      myRole: org.role,
    }));
  }

  async getOrg(id: string) {
    const org = await this.prismaService.organization.findUnique({
      where: { id },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async getMembers(id: string) {
    const members = await this.prismaService.userOrganization.findMany({
      where: {
        organizationId: id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return members.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedSince: m.createdAt,
      roleSince: m.updatedAt,
    }));
  }

  async getProjects(organizationId: string, userId: string, role: string) {
    /**
     * if the role is ADMIN or OWNER return all project
     * else return the project where the user has assigned task
     */
    let where: ProjectWhereInput;
    if (role === 'OWNER' || role === 'ADMIN') {
      where = {
        organizationId,
      };
    } else {
      where = {
        organizationId,
        tasks: {
          some: { assigneeId: userId },
        },
      };
    }

    return this.prismaService.project.findMany({
      where,
      omit: {
        organizationId: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async updateData(id: string, updateDto: UpdateOrgDto) {
    /**
     * if name is updated regenerate the slug
     */
    const org = await this.prismaService.organization.findUnique({
      where: { id },
    });

    if (!org) throw new NotFoundException('Organization not found');

    const data: OrganizationUpdateInput = updateDto;
    if (updateDto.name && org.name !== updateDto.name) {
      data.slug = await this.generateSlug(updateDto.name);
    }
    return this.prismaService.organization.update({
      where: { id },
      data: data,
    });
  }

  async deleteOrg(id: string) {
    return this.prismaService.organization.delete({
      where: { id },
    });
  }
}
