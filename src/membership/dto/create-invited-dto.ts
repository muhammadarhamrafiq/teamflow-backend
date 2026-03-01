import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ example: '12389fda1daf-fda1d-a31sd' })
  @IsNotEmpty({ message: 'User Id is required' })
  userId: string;
}
