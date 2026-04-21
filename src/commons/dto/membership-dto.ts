import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus, Role } from 'src/generated/prisma/enums';

export class MembershipDto {
  @ApiProperty({ example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811' })
  userId: string;

  @ApiProperty({ example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811' })
  organizationId: string;

  @ApiProperty({ example: 'ADMIN' })
  role: Role;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrganizationMember {
  @ApiProperty({
    example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811',
  })
  userId: string;

  @ApiProperty({ example: 'Someone' })
  name: string;

  @ApiProperty({ example: 'someone@somewhere.com' })
  email: string;

  @ApiProperty({ example: 'https://domain.com/resource' })
  avatarUrl: string | null;

  @ApiProperty({ example: 'MEMBER' })
  role: Role;

  @ApiProperty({})
  joinedSince: Date;
}

export class InviteDto {
  @ApiProperty({ example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811' })
  id: string;

  @ApiProperty({ example: 'user' })
  name: string;

  @ApiProperty({ example: 'user@somewhere.com' })
  email: string;

  @ApiProperty({ example: 'https://domain.com/resource' })
  avatarUrl: string | null;

  @ApiProperty()
  invitedSince: Date;

  @ApiProperty({ example: 'MEMBER' })
  role: Role;
}

export class InvitationStatusDto {
  @ApiProperty()
  isMember: boolean;

  @ApiProperty()
  invited: boolean;

  @ApiProperty({ example: 'PENDING' })
  inviteStatus?: InvitationStatus;
}

export class MembershipInvitationDto {
  @ApiProperty({ example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811' })
  id: string;

  @ApiProperty({ example: 'Aceme Inc' })
  organizationName: string;

  @ApiProperty({ example: 'https://domain.com/resource' })
  organizationLogo: string;

  @ApiProperty()
  invitedOn: Date;

  @ApiProperty({ example: 'MEMBER' })
  role: Role;
}
