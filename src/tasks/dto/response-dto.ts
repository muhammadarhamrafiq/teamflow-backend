import { ApiProperty } from '@nestjs/swagger';
import {
  TaskBaseDto,
  TaskWithAssigneeDto,
  TaskWithFullDetailsDto,
  TaskWithUpdatedAt,
} from 'src/commons/dto/task-dto';
import { PaginationResponseDto } from 'src/commons/helpers/pagination-dto';

export class CreateTaskResponseDto {
  @ApiProperty({ example: 'Task created successfully' })
  message: string;

  @ApiProperty()
  task: TaskBaseDto;
}

export class GetTasksResponseDto {
  @ApiProperty({ example: 'Tasks retrieved successfully' })
  message: string;

  @ApiProperty({ type: TaskWithAssigneeDto, isArray: true })
  tasks: TaskWithAssigneeDto[];

  @ApiProperty()
  pagination: PaginationResponseDto;
}

export class GetTaskResponseDto {
  @ApiProperty({ example: 'Task retrieved successfully' })
  message: string;

  @ApiProperty()
  task: TaskWithFullDetailsDto;
}

export class UpdateTaskResponseDto {
  @ApiProperty({ example: 'Task updated successfully' })
  message: string;

  @ApiProperty()
  task: TaskWithUpdatedAt;
}
