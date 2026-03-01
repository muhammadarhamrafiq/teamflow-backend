import { PickType } from '@nestjs/mapped-types';
import { SignInDto } from './sign-in-dto';

export class EmailDto extends PickType(SignInDto, ['email']) {}
