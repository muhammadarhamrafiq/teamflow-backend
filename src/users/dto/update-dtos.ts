import { PickType } from '@nestjs/swagger';
import { RegisterUserDto } from './register-dto';

export class UpdateNameDto extends PickType(RegisterUserDto, ['name']) {}

export class UpdatePasswordDto extends PickType(RegisterUserDto, [
  'password',
]) {}
