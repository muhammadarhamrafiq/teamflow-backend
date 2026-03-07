import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';

import { OrgsService } from './orgs.service';
import { RolesGuard } from '../commons/guards/roles.guard';

import { FileInterceptor } from '@nestjs/platform-express';

import { Roles } from '../commons/helpers/roles.decorator';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';

import type { Request } from 'express';
import type { Express } from 'express';
import { CreateOrgDto } from './dto/create-org-dto';
import { UpdateOrgDto } from './dto/update-org-dto';

@ApiTags('Organization')
@Controller({
  path: 'orgs',
  version: '1',
})
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @ApiAuth()
  @Post()
  async create(@Body() createOrgDto: CreateOrgDto, @Req() req: Request) {
    const { id } = req.user!;
    const org = await this.orgsService.create(createOrgDto, id);
    return {
      message: 'Organization created successfully',
      organization: org,
    };
  }

  @ApiAuth()
  @Get()
  async getOrgs(@Req() req: Request) {
    const { id } = req.user!;
    const organizations = await this.orgsService.getOrgs(id);
    return {
      message: 'Feteched All organizations',
      organizations,
    };
  }

  @ApiAuth()
  @Get(':slug')
  async getOrg(@Req() req: Request, @Param('slug') slug: string) {
    const { id } = req.user!;
    const org = await this.orgsService.getOrg(slug, id);
    return {
      message: 'Organization fetched',
      org,
    };
  }

  @ApiAuth()
  @Get(':orgId/members')
  @UseGuards(RolesGuard)
  async getMembers(@Param('orgId') organizationId: string) {
    const members = await this.orgsService.getMembers(organizationId);
    return {
      message: 'Members Fetched Successfully',
      members,
    };
  }

  @ApiParam({ name: 'orgId' })
  @ApiAuth()
  @Get(':orgId/projects')
  @UseGuards(RolesGuard)
  async getProjects(@Req() req: Request) {
    const { organizationId, userId, role } = req.orgMembership!;
    const projects = await this.orgsService.getProjects(
      organizationId,
      userId,
      role,
    );
    return {
      message: 'Projects Fetched Successfully',
      projects,
    };
  }

  @ApiAuth()
  @Patch(':orgId')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  async updateData(
    @Param('orgId') organizationId: string,
    @Body() updateOrgDto: UpdateOrgDto,
  ) {
    const updatedOrg = await this.orgsService.updateData(
      organizationId,
      updateOrgDto,
    );
    return {
      message: 'Organization updated successfully',
      updatedOrg,
    };
  }

  @ApiAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Patch(':orgId/logo')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @UseInterceptors(FileInterceptor('file'))
  async updateLogo(
    @Param('orgId') organizationId: string,
    @UploadedFile('file') logo: Express.Multer.File,
  ) {
    const organization = await this.orgsService.updateLogo(
      organizationId,
      logo.buffer,
    );
    return {
      message: 'Logo updated successfully',
      organization,
    };
  }

  @ApiAuth()
  @UseGuards(RolesGuard)
  @Delete(':orgId')
  @Roles('OWNER')
  async deleteOrg(@Param('orgId') organizationId: string) {
    const organization = await this.orgsService.deleteOrg(organizationId);
    return {
      message: 'Organization deleted',
      organization,
    };
  }
}
