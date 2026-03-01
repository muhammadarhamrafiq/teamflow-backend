import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { Trim } from 'src/commons/helpers/validationHelpers';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Trim()
  @Length(3, 50, { message: 'Name must contain 3-50 characters' })
  name: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Trim()
  @MinLength(6, { message: 'Password must contain atleast 6 characters' })
  password: string;
}
