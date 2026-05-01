import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/commons/helpers/pagination-dto';
import { ProjectStatus } from 'src/generated/prisma/enums';

export class GetProjectDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({})
  @IsOptional()
  projectStatus?: ProjectStatus;
}
