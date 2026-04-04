import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/generated/prisma/enums';

export class OrganizationMember {
  @ApiProperty({
    example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811',
  })
  userId: string;

  @ApiProperty({ example: 'Someone' })
  name: string;

  @ApiProperty({ example: 'someone@somewhere.com' })
  email: string;

  @ApiProperty({ example: 'https://domain.com/resource' })
  avatarUrl: string | null;

  @ApiProperty({ example: 'MEMBER' })
  role: Role;

  @ApiProperty({})
  joinedSince: Date;
}
