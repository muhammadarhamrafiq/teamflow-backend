import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number, starting from 1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(30)
  limit?: number = 20;
}

export class PaginationResponseDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 44 })
  totalItems: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
