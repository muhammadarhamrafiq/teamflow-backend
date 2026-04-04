import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/commons/helpers/pagination-dto';

export class GetMembersDto extends PaginationDto {
  @ApiPropertyOptional()
  search?: string;
}
