import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

export class UpdateRoleDto {
  @ApiProperty({ name: 'role', enum: Role })
  @IsEnum(Role)
  role: Role;
}
