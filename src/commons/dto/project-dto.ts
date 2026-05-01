import { ApiProperty, PickType } from '@nestjs/swagger';
import { ProjectStatus, TaskStatus } from 'src/generated/prisma/enums';

export class Project {
  @ApiProperty({ example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811' })
  id: string;

  @ApiProperty({ example: 'Project Name' })
  name: string;

  @ApiProperty({ example: 'Project Description' })
  description: string | null;

  @ApiProperty({ example: 'project-slug' })
  slug: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: ProjectStatus;

  @ApiProperty({ example: '' })
  startOn: Date;

  @ApiProperty({ example: '' })
  dueDate: Date | null;

  @ApiProperty({ example: '' })
  lastUpdatedAt: Date;
}

export class ProjectBaseDto extends PickType(Project, [
  'id',
  'name',
  'slug',
  'description',
  'dueDate',
  'startOn',
  'status',
]) {}

export class ProjectDetailDto extends ProjectBaseDto {
  @ApiProperty({ example: 'ACTIVE' })
  status: ProjectStatus;

  @ApiProperty()
  tasksCounts: Record<TaskStatus | 'total', number>;

  @ApiProperty()
  availableActions: ProjectStatus[];
}

export class ProjectWithUpdatedAtDto extends PickType(Project, [
  'id',
  'name',
  'slug',
  'description',
]) {
  @ApiProperty()
  updatedAt: Date | null;
}

export class ProjectStatusUpdateDto extends PickType(Project, [
  'id',
  'status',
  'lastUpdatedAt',
]) {}
