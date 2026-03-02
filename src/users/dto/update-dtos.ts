import { ApiProperty, PickType } from '@nestjs/swagger';
import { RegisterUserDto } from './register-dto';
import { IsEnum } from 'class-validator';

export class UpdateNameDto extends PickType(RegisterUserDto, ['name']) {}

export class UpdatePasswordDto extends PickType(RegisterUserDto, [
  'password',
]) {}

export const FinalizeInvitationStatus = {
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export type FinalizeInvitationStatus =
  (typeof FinalizeInvitationStatus)[keyof typeof FinalizeInvitationStatus];

export class updateInviteStatusDto {
  @ApiProperty({ name: 'status', enum: FinalizeInvitationStatus })
  @IsEnum(FinalizeInvitationStatus)
  status: FinalizeInvitationStatus;
}
