import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { Trim } from 'src/commons/helpers/validationHelpers';

export class RegisterUserDto {
  @ApiProperty({ example: 'Someone' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Trim()
  @Length(3, 50, { message: 'Name must contain 3-50 characters' })
  name: string;

  @ApiProperty({ example: 'P@55word' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Trim()
  @MinLength(6, { message: 'Password must contain atleast 6 characters' })
  password: string;
}
