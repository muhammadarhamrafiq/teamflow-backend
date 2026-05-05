import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/commons/helpers/pagination-dto';
import { TaskStatus } from 'src/generated/prisma/enums';

export class GetTaskDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'OPEN', enum: TaskStatus })
  @IsOptional()
  status?: TaskStatus;
}
