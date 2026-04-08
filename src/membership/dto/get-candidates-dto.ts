import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { PaginationDto } from 'src/commons/helpers/pagination-dto';
import { Trim } from 'src/commons/helpers/validationHelpers';

export class GetCandidatesDto extends PaginationDto {
  @ApiProperty()
  @IsString()
  @Trim()
  @Length(1, undefined, { message: 'Email is required to search the user' })
  email: string;
}
