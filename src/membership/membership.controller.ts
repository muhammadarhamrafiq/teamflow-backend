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
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/commons/guards/roles.guard';
import { Roles } from 'src/commons/helpers/roles.decorator';

import type { Request } from 'express';
import { CreateInviteDto } from './dto/create-invited-dto';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';
import { UpdateRoleDto } from './dto/update-role-dto';
import { GetMembersResponseDto } from './dto/responses-dto';
import { GetMembersDto } from './dto/get-mems-dto';

@ApiAuth()
@ApiTags('Membership')
@ApiParam({ name: 'orgId' })
@UseGuards(RolesGuard)
@Controller({
  path: 'orgs/:orgId',
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

  @ApiAuth()
  @ApiResponse({ status: 200, type: GetMembersResponseDto })
  @Get('/mems')
  async getMembers(
    @Param('orgId') organizationId: string,
    @Query() query: GetMembersDto,
  ): Promise<GetMembersResponseDto> {
    const { members, pagination } = await this.membershipService.getMembers(
      organizationId,
      query,
    );
    return {
      message: 'Members Fetched Successfully',
      members,
      pagination,
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
