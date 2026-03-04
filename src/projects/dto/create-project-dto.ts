import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length } from 'class-validator';
import { IsFutureDate, Trim } from 'src/commons/helpers/validationHelpers';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project 1' })
  @IsString({ message: 'Project Name is required string' })
  @Trim()
  @Length(3, 25, { message: 'Project name must contain 3-25 characters' })
  name: string;

  @ApiProperty({ example: 'Project Description' })
  @IsString()
  @IsOptional()
  @Length(10, 500, {
    message: 'Project description must contain 10-500 characters.',
  })
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'due date must be a valid date' })
  @IsFutureDate({ message: 'due date must be a valid future date' })
  dueDate?: Date;
}
