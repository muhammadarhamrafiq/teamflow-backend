import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
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
import type { CreateOrgDto } from './dto/create-org-dto';
import type { UpdateOrgDto } from './dto/update-org-dto';

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

  @ApiParam({ name: 'slug' })
  @ApiAuth()
  @Get(':slug')
  @UseGuards(MemberShipGuard)
  async getOrg(@Req() req: Request) {
    const { organizationId, role } = req.orgMembership!;
    const org = await this.orgsService.getOrg(organizationId);
    return {
      message: 'Organization fetched',
      org: { ...org, myRole: role },
    };
  }

  @ApiParam({ name: 'slug' })
  @ApiAuth()
  @Get(':slug/members')
  @UseGuards(MemberShipGuard)
  async getMembers(@Req() req: Request) {
    const { organizationId } = req.orgMembership!;
    const members = await this.orgsService.getMembers(organizationId);
    return {
      message: 'Members Fetched Successfully',
      members,
    };
  }

  @ApiParam({ name: 'slug' })
  @ApiAuth()
  @Get(':slug/projects')
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

  @ApiParam({ name: 'slug' })
  @ApiAuth()
  @Patch(':slug')
  @Roles('OWNER')
  @UseGuards(RolesGuard)
  async updateData(@Req() req: Request, @Body() updateOrgDto: UpdateOrgDto) {
    const { organizationId } = req.orgMembership!;
    const updatedOrg = await this.orgsService.updateData(
      organizationId,
      updateOrgDto,
    );
    return {
      message: 'Organization updated successfully',
      updatedOrg,
    };
  }

  @ApiParam({ name: 'slug' })
  @ApiAuth()
  @Patch(':slug/logo')
  @Roles('OWNER')
  @UseGuards(RolesGuard)
  updateLogo() {
    // TODO: Add the update Logo later after the setup of image uploading is done
    throw new NotImplementedException();
  }

  @ApiParam({ name: 'slug' })
  @ApiAuth()
  @UseGuards(RolesGuard)
  @Delete(':slug')
  @Roles('OWNER')
  async deleteOrg(@Req() req: Request) {
    const { organizationId } = req.orgMembership!;
    await this.orgsService.deleteOrg(organizationId);
  }
}
