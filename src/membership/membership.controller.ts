import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { MemberShipGuard } from 'src/orgs/guards/member.guard';
import { RolesGuard } from 'src/orgs/guards/roles.guard';
import { Roles } from 'src/orgs/decorators/roles.decorator';

import type { Request } from 'express';
import { CreateInviteDto } from './dto/create-invited-dto';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';
import { UpdateRoleDto } from './dto/update-role-dto';

@ApiAuth()
@ApiTags('Membership')
@ApiParam({ name: 'slug' })
@UseGuards(MemberShipGuard, RolesGuard)
@Controller({
  path: 'orgs/:slug',
})
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('invites')
  @Roles('OWNER')
  async inviterUser(
    @Body() createInviteDto: CreateInviteDto,
    @Req() req: Request,
  ) {
    const { organizationId } = req.orgMembership!;
    const invitation = await this.membershipService.invite(
      organizationId,
      createInviteDto,
    );

    return {
      message: 'Invite sent successfully',
      invitation,
    };
  }

  @Delete('invites/:inviteId')
  @Roles('OWNER')
  async cancelInvite(@Param('inviteId') id: string, @Req() req: Request) {
    const { organizationId } = req.orgMembership!;
    const invite = await this.membershipService.cancelInvitation(
      id,
      organizationId,
    );
    return {
      message: 'Invited cancelled successfully',
      invite,
    };
  }

  @Get('invites')
  @Roles('OWNER')
  async getInvites(@Req() req: Request) {
    const { organizationId } = req.orgMembership!;
    const invites = await this.membershipService.getInvites(organizationId);
    return {
      message: 'Invites fetched successfully',
      invites,
    };
  }

  @Get('invites/:userId')
  @Roles('OWNER')
  async getStatus(@Req() req: Request, @Param('userId') userId: string) {
    const { organizationId } = req.orgMembership!;
    const inviteInfo = await this.membershipService.getStatus(
      organizationId,
      userId,
    );

    return {
      message: 'Status fetch',
      inviteInfo,
    };
  }

  @Patch('mems/:userId')
  @Roles('OWNER')
  async updateRole(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query() updateRoleDto: UpdateRoleDto,
  ) {
    const { organizationId } = req.orgMembership!;
    const member = await this.membershipService.updateRole(
      userId,
      organizationId,
      updateRoleDto.role,
    );

    return {
      message: 'Role Updated',
      member,
    };
  }

  @Delete('mems/me')
  @Roles()
  async leftOrg(@Req() req: Request) {
    const { organizationId, userId } = req.orgMembership!;
    const membership = await this.membershipService.removeMembership(
      userId,
      organizationId,
    );
    return {
      message: 'Membership removed',
      membership,
    };
  }

  @Delete('mems/:userId')
  @Roles('OWNER')
  async removeMember(@Req() req: Request, @Param('userId') userId: string) {
    const { organizationId } = req.orgMembership!;
    const membership = await this.membershipService.removeMembership(
      userId,
      organizationId,
    );
    return {
      message: 'Membership removed',
      membership,
    };
  }
}
