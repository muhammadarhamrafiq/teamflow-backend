import { ApiProperty } from '@nestjs/swagger';

class Author {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'johndoe@domain.com' })
  email: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatarUrl: string | null;

  @ApiProperty({ example: true })
  byMe: boolean;
}

export class CommentWithAuthor {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'This is a comment.' })
  message: string;

  @ApiProperty({ type: Author })
  author: Author;
}

export class CommentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'This is a comment.' })
  message: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  authorId: string;
}
