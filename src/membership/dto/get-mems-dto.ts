import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/commons/helpers/pagination-dto';

export class GetMembersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;
}
