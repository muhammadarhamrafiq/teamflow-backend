import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

export class CreateInviteDto {
  @ApiProperty({ example: '12389fda1daf-fda1d-a31sd' })
  @IsNotEmpty({ message: 'User Id is required' })
  userId: string;

  @ApiProperty({ example: 'MEMBER' })
  @IsEnum(Role, { message: 'Provide a valid Role' })
  role?: Role;
}
