import { ApiProperty } from '@nestjs/swagger';
import { MembershipInvitationDto } from 'src/commons/dto/membership-dto';
import { UserDto, UserDtoWithUpdatedAt } from 'src/commons/dto/user-dto';

export class RegisterResponseDto {
  @ApiProperty({
    example: 'User created Successfully',
  })
  message: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({})
  accessToken: string;

  @ApiProperty({})
  refreshToken: string;
}

export class UpdatedUserResponse {
  @ApiProperty({
    example: 'User updated Successfully',
  })
  message: string;

  @ApiProperty({ type: UserDtoWithUpdatedAt })
  user: UserDtoWithUpdatedAt;
}

export class GetUserInvitesDto {
  @ApiProperty({ example: 'Invitations Fetched Successfull' })
  message: string;

  @ApiProperty({ type: MembershipInvitationDto, isArray: true })
  invitations: MembershipInvitationDto[];
}

export class UpdateInvitationStatusDto {
  @ApiProperty({ example: 'Invitations Fetched Successfull' })
  message: string;
}
