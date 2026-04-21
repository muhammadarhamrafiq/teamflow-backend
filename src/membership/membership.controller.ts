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
import {
  CreateInviteResponseDto,
  GetCandidatesResponseDto,
  GetInvitesResponseDto,
  GetMembersResponseDto,
  MembershipUpdateResponseDto,
} from './dto/responses-dto';
import { GetMembersDto } from './dto/get-mems-dto';
import { GetCandidatesDto } from './dto/get-candidates-dto';

@ApiAuth()
@ApiTags('Membership')
@ApiParam({ name: 'orgId' })
@UseGuards(RolesGuard)
@Controller({
  path: 'orgs/:orgId',
  version: '1',
})
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  /**
   * Create Invitation
   */
  @ApiResponse({ type: CreateInviteResponseDto, status: 201 })
  @Post('invites')
  @Roles('OWNER')
  async inviterUser(
    @Body() createInviteDto: CreateInviteDto,
    @Req() req: Request,
  ): Promise<CreateInviteResponseDto> {
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

  /**
   * Cancel Invitation
   */
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          example: 'Cancelled request successfully',
          type: 'string',
        },
      },
    },
    status: 200,
  })
  @Delete('invites/:inviteId')
  @Roles('OWNER')
  async cancelInvite(
    @Param('inviteId') id: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const { organizationId } = req.orgMembership!;
    await this.membershipService.cancelInvitation(id, organizationId);
    return {
      message: 'Invited cancelled successfully',
    };
  }

  /**
   * Get Invites
   */
  @ApiResponse({ type: GetInvitesResponseDto, status: 200 })
  @Get('invites')
  @Roles('OWNER')
  async getInvites(
    @Req() req: Request,
    @Query() query: GetMembersDto,
  ): Promise<GetInvitesResponseDto> {
    const { organizationId } = req.orgMembership!;
    const { invites, pagination } = await this.membershipService.getInvites(
      organizationId,
      query,
    );
    return {
      message: 'Invites fetched successfully',
      invites,
      pagination,
    };
  }

  /**
   * Get Candidates
   */
  @ApiResponse({ type: GetCandidatesResponseDto, status: 200 })
  @Get('invites/candidates')
  @Roles('OWNER')
  async getCandidates(
    @Req() req: Request,
    @Query() query: GetCandidatesDto,
  ): Promise<GetCandidatesResponseDto> {
    const { organizationId } = req.orgMembership!;
    const { users, pagination } = await this.membershipService.getCandidates(
      organizationId,
      query,
    );

    return {
      message: 'Status fetch',
      users,
      pagination,
    };
  }

  /**
   * Get Members
   */
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

  /**
   *  Update Membership
   */
  @ApiResponse({ type: MembershipUpdateResponseDto, status: 200 })
  @Patch('mems/:userId')
  @Roles('OWNER')
  async updateRole(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query() updateRoleDto: UpdateRoleDto,
  ): Promise<MembershipUpdateResponseDto> {
    const { organizationId } = req.orgMembership!;
    const membership = await this.membershipService.updateRole(
      userId,
      organizationId,
      updateRoleDto.role,
    );

    return {
      message: 'Role Updated',
      membership,
    };
  }

  /**
   * Leave Organization
   */
  @ApiResponse({ type: MembershipUpdateResponseDto, status: 200 })
  @Delete('mems/me')
  async leftOrg(@Req() req: Request): Promise<MembershipUpdateResponseDto> {
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

  /**
   * Remove Member
   */
  @ApiResponse({ type: MembershipUpdateResponseDto, status: 200 })
  @Delete('mems/:userId')
  @Roles('OWNER')
  async removeMember(
    @Req() req: Request,
    @Param('userId') userId: string,
  ): Promise<MembershipUpdateResponseDto> {
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
