import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from 'src/generated/prisma/enums';

export class Project {
  @ApiProperty({ example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811' })
  id: string;

  @ApiProperty({ example: 'Project Name' })
  name: string;

  @ApiProperty({ example: 'Project Description' })
  description: string;

  @ApiProperty({ example: 'project-slug' })
  slug: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: ProjectStatus;

  @ApiProperty({ example: '' })
  startOn: Date;

  @ApiProperty({ example: '' })
  dueDate: Date;

  @ApiProperty({ example: '' })
  lastUpdatedAt: Date;
}
