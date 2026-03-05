import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task-dto';
import { TaskStatus } from 'src/generated/prisma/enums';
import { IsEnum } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus, { message: 'status must be a valid task status' })
  status: TaskStatus;
}
