import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project-dto';
import { ProjectStatus } from 'src/generated/prisma/enums';
import { IsEnum } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class UpdateProjectStatusDto {
  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus, { message: 'Required a valid project status' })
  status: ProjectStatus;
}
