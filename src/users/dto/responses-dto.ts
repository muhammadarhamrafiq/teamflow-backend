import { ApiProperty } from '@nestjs/swagger';
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
