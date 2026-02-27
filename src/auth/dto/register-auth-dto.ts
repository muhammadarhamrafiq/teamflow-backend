import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Trim } from 'src/commons/helpers/validationHelpers';

export class RegisterAuthDto {
  // User Email
  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsString({
    message: 'Email must be a string',
  })
  @IsEmail(
    {},
    {
      message: 'Email must be a valid email address',
    },
  )
  @Trim()
  @ApiProperty({
    example: 'someone@somewher.com',
  })
  email: string;

  // User Name
  @IsNotEmpty({
    message: 'Name is required',
  })
  @IsString({
    message: 'Name must be a string',
  })
  @Length(3, 50, {
    message: 'Name must be between 3 and 50 characters',
  })
  @Trim()
  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  // User Password
  @IsNotEmpty({
    message: 'Password is required',
  })
  @IsString({
    message: 'Password must be a string',
  })
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @ApiProperty({
    example: 'P@ssw0rd',
  })
  password: string;
}
