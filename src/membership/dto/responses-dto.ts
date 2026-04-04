import { ApiProperty } from '@nestjs/swagger';
import { OrganizationMember } from 'src/commons/dto/membership-dto';
import { PaginationResponseDto } from 'src/commons/helpers/pagination-dto';

export class GetMembersResponseDto {
  @ApiProperty({ example: 'Deleted Organization' })
  message: string;

  @ApiProperty({ isArray: true, type: OrganizationMember })
  members: OrganizationMember[];

  @ApiProperty()
  pagination: PaginationResponseDto;
}
