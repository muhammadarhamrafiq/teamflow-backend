import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { TaskStatus } from 'src/generated/prisma/client';

class AssigneeDto {
  @ApiProperty({ example: '0ff8c9e2-1d2b-4a3b-9c1d-2e3f4a5b6c7d' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '' })
  email: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatarUrl: string | null;
}

class TaskProjectDto {
  @ApiProperty({ example: '0ff8c9e2-1d2b-4a3b-9c1d-2e3f4a5b6c7d' })
  id: string;

  @ApiProperty({ example: 'Project Alpha' })
  name: string;

  @ApiProperty({ example: 'project-alpha' })
  slug: string;
}

export class TaskBaseDto {
  @ApiProperty({ example: '0ff8c9e2-1d2b-4a3b-9c1d-2e3f4a5b6c7d' })
  id: string;

  @ApiProperty({ example: 'Design Homepage' })
  title: string;

  @ApiProperty({ example: 'Create a responsive design for the homepage' })
  description: string | null;

  @ApiProperty({ example: 'BACKLOG', enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ example: '0ff8c9e2-1d2b-4a3b-9c1d-2e3f4a5b6c7d' })
  assigneeId: string | null;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z' })
  dueDate: Date | null;

  @ApiProperty({ example: '2024-12-01T00:00:00.000Z' })
  startDate?: Date | null;

  @ApiProperty({ example: '0ff8c9e2-1d2b-4a3b-9c1d-2e3f4a5b6c7d' })
  projectId: string;
}

export class TaskWithAssigneeDto extends PickType(TaskBaseDto, [
  'id',
  'description',
  'status',
  'startDate',
  'dueDate',
]) {
  @ApiProperty({ type: AssigneeDto, nullable: true })
  assignee: AssigneeDto | null;
}

export class TaskWithFullDetailsDto extends OmitType(TaskBaseDto, [
  'assigneeId',
  'projectId',
]) {
  @ApiProperty()
  commentsCount: number;

  @ApiProperty({ enum: TaskStatus, isArray: true })
  allowedActions: TaskStatus[];

  @ApiProperty({ type: AssigneeDto, nullable: true })
  assignee: AssigneeDto | null;

  @ApiProperty()
  project: TaskProjectDto;
}

export class TaskWithUpdatedAt extends PickType(TaskBaseDto, ['id', 'title']) {
  @ApiProperty({ example: '2024-12-01T00:00:00.000Z' })
  updatedAt: Date | null;
}
