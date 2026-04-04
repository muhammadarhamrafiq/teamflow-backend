import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/commons/dto/user-dto';

export class RegisterEmailResponseDto {
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

export class RefreshResponseDto {
  @ApiProperty({
    example: 'Token refreshed Successfully',
  })
  message: string;

  @ApiProperty({})
  accessToken: string;

  @ApiProperty({})
  refreshToken: string;
}

class SessionDTO {
  @ApiProperty({ example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811' })
  id: string;

  @ApiProperty({ example: '2d312ab2-291c-a34d-a151-12e7d15e123' })
  userId: string;

  @ApiProperty({ example: 'unkown' })
  deviceId: string | null;

  @ApiProperty({ example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' })
  userAgent: string | null;

  @ApiProperty({ example: '000.00.0.0' })
  ipAddress: string | null;
}

export class GetSessionsResponseDto {
  @ApiProperty({ example: 'Sessions fetched successfully' })
  message: string;

  @ApiProperty({ type: SessionDTO, isArray: true })
  sessions: SessionDTO[];
}

export class GetMeResponseDto {
  @ApiProperty({ example: 'Fetched Me' })
  message: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}

export class RequestEmailUpdateDto {
  @ApiProperty({ example: 'Check Inbox to verify email' })
  message: string;
}
