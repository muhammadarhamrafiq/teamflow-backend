import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { IsFutureDate } from 'src/commons/helpers/validationHelpers';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task 1' })
  @IsString({ message: 'Task name is required string' })
  @Length(3, 50, { message: 'Name must contain 3-50 characters' })
  name: string;

  @ApiProperty({ example: 'Description' })
  @IsString()
  @IsOptional()
  @Length(10, 500, { message: 'Description must contain 10 - 500 characters' })
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'due date must be a valid date' })
  @IsFutureDate({ message: 'due date must be a valid future date' })
  startDate?: Date;

  @ApiProperty({ example: '2026-12-31T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'due date must be valid date' })
  @IsFutureDate({ message: 'due date must be valid future date' })
  dueDate?: Date;

  @ApiProperty({ example: crypto.randomUUID() })
  @IsOptional()
  @IsUUID('all', { message: 'userId must be a valid uuid' })
  assigneeId?: string;
}
