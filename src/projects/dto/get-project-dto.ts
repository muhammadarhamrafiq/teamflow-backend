import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/commons/helpers/pagination-dto';

export class GetProjectDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number, starting from 1',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  archieved?: boolean = false;
}
