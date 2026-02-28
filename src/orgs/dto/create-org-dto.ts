import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Trim } from 'src/commons/helpers/validationHelpers';

export class CreateOrgDto {
  @ApiProperty({ example: 'Acme Inc' })
  @IsNotEmpty({ message: 'Organization Name is Required' })
  @IsString()
  @Trim()
  @Length(3, 50, {
    message: 'Organization name must contain at least 3 to 50 characters',
  })
  name: string;

  @ApiProperty({ example: 'Organization Description' })
  @IsOptional()
  @IsString()
  @Trim()
  @Length(10, 500, {
    message: 'Description must contain at least 10 to 500 characters',
  })
  description: string = 'No description available for this orgination';
}
