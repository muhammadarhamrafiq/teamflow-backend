import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/commons/dto/user-dto';

export class RegisterResponseDto {
  @ApiProperty({
    example: 'Check your email to complete registeration',
  })
  message: string;
}

export class SignInResponseDto {
  @ApiProperty({
    example: 'Check your email to complete registeration',
  })
  message: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({ example: '' })
  accessToken: string;

  @ApiProperty({ example: '' })
  refreshToken: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'Check your inbox to proceed further',
  })
  message: string;
}
