import { ApiProperty } from '@nestjs/swagger';
import { CommentDto, CommentWithAuthor } from 'src/commons/dto/comment-dto';
import { PaginationResponseDto } from 'src/commons/helpers/pagination-dto';

export class GetCommentsResponseDto {
  @ApiProperty({ example: 'comments fetched' })
  message: string;

  @ApiProperty({ type: CommentWithAuthor, isArray: true })
  comments: CommentWithAuthor[];

  @ApiProperty({ type: PaginationResponseDto })
  pagination: PaginationResponseDto;
}

export class CreateCommentResponseDto {
  @ApiProperty({ example: 'Comment Added' })
  message: string;

  @ApiProperty({ type: CommentDto })
  comment: CommentDto;
}

export class DeleteCommentResponseDto {
  @ApiProperty({ example: 'Comment Deleted' })
  message: string;
}
