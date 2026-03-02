import { PickType } from '@nestjs/swagger';
import { SignInDto } from './sign-in-dto';

export class EmailDto extends PickType(SignInDto, ['email']) {}
