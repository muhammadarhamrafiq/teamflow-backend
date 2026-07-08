import { ApiProperty } from '@nestjs/swagger';
import {
  ProjectBaseDto,
  ProjectDetailDto,
  ProjectStatusUpdateDto,
  ProjectWithUpdatedAtDto,
} from 'src/commons/dto/project-dto';
import { PaginationResponseDto } from 'src/commons/helpers/pagination-dto';

export class CreateProjectResponseDto {
  @ApiProperty({ example: 'Project Created Successfully' })
  message: string;

  @ApiProperty()
  project: ProjectBaseDto;
}

export class GetProjectsResponseDto {
  @ApiProperty({ example: 'Projects Fetched Successfully' })
  message: string;

  @ApiProperty({ isArray: true, type: ProjectBaseDto })
  projects: ProjectBaseDto[];

  @ApiProperty()
  pagination: PaginationResponseDto;
}

export class GetProjectResponseDto {
  @ApiProperty({ example: 'Project Fetched Successfully' })
  message: string;

  @ApiProperty()
  project: ProjectDetailDto;
}

export class ProjectUpdateResponseDto {
  @ApiProperty({ example: 'Project Updated Successfully' })
  message: string;

  @ApiProperty()
  project: ProjectWithUpdatedAtDto;
}

export class ProjectStatusUpdateResponseDto {
  @ApiProperty({ example: 'Project Status Updated Successfully' })
  message: string;

  @ApiProperty()
  project: ProjectStatusUpdateDto;
}

export class DeleteProjectResponseDto {
  @ApiProperty({ example: 'Project Status Deleted Successfully' })
  message: string;
}
