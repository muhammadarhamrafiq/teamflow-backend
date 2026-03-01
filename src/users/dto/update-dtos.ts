import { PickType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './register-dto';

export class UpdateNameDto extends PickType(RegisterUserDto, ['name']) {}
