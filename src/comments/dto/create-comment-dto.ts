import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { Trim } from 'src/commons/helpers/validationHelpers';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a comment' })
  @IsString({ message: 'comment content cannot be empty' })
  @Trim()
  @MaxLength(1000, { message: 'Comment must contain at most 1000 characters' })
  message: string;
}
