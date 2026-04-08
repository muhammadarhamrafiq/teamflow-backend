import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatusDto } from './membership-dto';

export class UserDto {
  @ApiProperty({
    example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811',
  })
  id: string;

  @ApiProperty({ example: 'Someone' })
  name: string;

  @ApiProperty({ example: 'someone@somewhere.com' })
  email: string;

  @ApiProperty({ example: 'https://domain.com/resource' })
  avatarUrl: string | null;
}

export class UserDtoWithUpdatedAt extends UserDto {
  @ApiProperty({})
  updatedAt: Date;
}

export class UserDToWithInvitationStatus extends UserDto {
  invitationStatus: InvitationStatusDto;
}
