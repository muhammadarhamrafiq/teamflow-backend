import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import slugify from 'slugify';

import type { CreateOrgDto } from './dto/create-org-dto';
import type { UpdateOrgDto } from './dto/update-org-dto';
import type { OrganizationUpdateInput } from 'src/generated/prisma/models';
import { CloudinaryService } from 'src/commons/cloudinary/cloudinary.service';
import { Project } from 'src/generated/prisma/client';

@Injectable()
export class OrgsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  private getProjectsSummary(projects: Project[]) {
    const projectSummary = {
      totalProjects: projects.length,
      completedProjects: 0,
      overDueProjects: 0,
      inProgressProjects: 0,
    };
    const currDate = new Date();

    for (const project of projects) {
      if (project.projectStatus === 'COMPLETED')
        projectSummary.completedProjects++;
      else {
        projectSummary.inProgressProjects++;
        if (project.dueDate && project.dueDate > currDate) {
          projectSummary.overDueProjects++;
        }
      }
    }

    return projectSummary;
  }

  /**
   * Create Organization
   */
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
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        slug: true,
      },
    });
  }

  /**
   * Get All Organizations
   */
  async getOrgs(userId: string, search?: string) {
    const orgs = await this.prismaService.userOrganization.findMany({
      where: {
        userId,
        organization: {
          name: { contains: search || '', mode: 'insensitive' },
        },
      },

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

  /**
   * Get Organization By Slug
   */
  async getOrg(slug: string, userId: string) {
    const org = await this.prismaService.organization.findFirst({
      where: {
        slug,
        organizationUsers: {
          some: { userId },
        },
      },

      include: {
        organizationUsers: true,
        projects: {
          where: { projectStatus: { not: 'ARCHIVED' } },
        },
      },
    });

    if (!org) throw new NotFoundException('Organization not found');
    const projectsSummary = this.getProjectsSummary(org.projects);

    return {
      id: org.id,
      name: org.name,
      description: org.description,
      logoUrl: org.logoUrl,
      slug: org.slug,
      myRole: org.organizationUsers[0].role,
      projectsSummary,
    };
  }

  /**
   * Update Organization Data
   */
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
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        logoUrl: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update Logo Url
   */
  async updateLogo(id: string, file: Buffer) {
    const org = await this.prismaService.organization.findUnique({
      where: { id },
    });

    if (!org) throw new NotFoundException('Organization Not Found');

    const upload = await this.cloudinaryService.uploadFile(file);
    const updatedOrg = await this.prismaService.organization.update({
      where: { id },
      data: {
        logoUrl: upload.secure_url,
        logoPublicId: upload.public_id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        logoUrl: true,
        updatedAt: true,
      },
    });

    if (org.logoPublicId)
      await this.cloudinaryService.removeFile(org.logoPublicId);

    return updatedOrg;
  }

  async deleteOrg(id: string) {
    const org = await this.prismaService.organization.delete({
      where: { id },
    });

    if (org.logoPublicId)
      await this.cloudinaryService.removeFile(org.logoPublicId);

    return {
      id: org.id,
      name: org.name,
    };
  }
}
