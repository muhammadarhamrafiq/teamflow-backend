import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'src/commons/helpers/validationHelpers';

export class SignInDto {
  @IsNotEmpty({
    message: 'email is required',
  })
  @IsString()
  @IsEmail(
    {},
    {
      message: 'email should be a valid email',
    },
  )
  @Trim()
  @ApiProperty({
    example: 'someone@somewher.com',
  })
  email: string;

  @IsNotEmpty({
    message: 'Password is required',
  })
  @ApiProperty({
    example: 'P@ssw0rd',
  })
  password: string;
}
