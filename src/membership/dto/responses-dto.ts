import { ApiProperty } from '@nestjs/swagger';
import {
  InviteDto,
  MembershipDto,
  OrganizationMember,
} from 'src/commons/dto/membership-dto';
import { UserDToWithInvitationStatus } from 'src/commons/dto/user-dto';
import { PaginationResponseDto } from 'src/commons/helpers/pagination-dto';

export class GetMembersResponseDto {
  @ApiProperty({ example: 'Deleted Organization' })
  message: string;

  @ApiProperty({ isArray: true, type: OrganizationMember })
  members: OrganizationMember[];

  @ApiProperty()
  pagination: PaginationResponseDto;
}

export class GetCandidatesResponseDto {
  @ApiProperty({ example: 'Found Candidates' })
  message: string;

  @ApiProperty({ type: UserDToWithInvitationStatus, isArray: true })
  users: UserDToWithInvitationStatus[];

  @ApiProperty()
  pagination: PaginationResponseDto;
}

export class GetInvitesResponseDto {
  @ApiProperty({ example: 'Invites fetched successfully' })
  message: string;

  @ApiProperty({ type: InviteDto, isArray: true })
  invites: InviteDto[];

  @ApiProperty()
  pagination: PaginationResponseDto;
}

export class CreateInviteResponseDto {
  @ApiProperty({ example: 'Invitation created successfully' })
  message: string;

  @ApiProperty()
  invitation: InviteDto;
}

export class MembershipUpdateResponseDto {
  @ApiProperty({ example: 'Membership updated' })
  message: string;

  @ApiProperty()
  membership: MembershipDto;
}
