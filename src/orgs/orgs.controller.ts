import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { OrgsService } from './orgs.service';
import { RolesGuard } from './guards/roles.guard';
import { MemberShipGuard } from './guards/member.guard';

import { Roles } from './decorators/roles.decorator';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';

import type { Request } from 'express';
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
  @UseGuards(MemberShipGuard)
  async getOrg(@Req() req: Request, @Param('slug') slug: string) {
    const { role } = req.orgMembership!;
    const org = await this.orgsService.getOrg(slug);
    return {
      message: 'Organization fetched',
      org: { ...org, myRole: role },
    };
  }

  @ApiAuth()
  @Get(':orgId/members')
  @UseGuards(MemberShipGuard)
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
  @UseGuards(MemberShipGuard)
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
  @Roles('OWNER')
  @UseGuards(RolesGuard)
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
  @Patch(':orgId/logo')
  @Roles('OWNER')
  @UseGuards(RolesGuard)
  updateLogo() {
    // TODO: Add the update Logo later after the setup of image uploading is done
    throw new NotImplementedException();
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
