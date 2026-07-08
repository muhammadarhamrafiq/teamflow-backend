import { ApiProperty } from '@nestjs/swagger';
import {
  DetailedOrganization,
  Organization,
  OrganizationDelete,
  OrganizationWithUpdatedAt,
  OrgsListElem,
} from 'src/commons/dto/org-dto';

export class GetOrganizationsResponseDto {
  @ApiProperty({ example: 'Organization fetched Successfully' })
  message: string;

  @ApiProperty({ type: OrgsListElem, isArray: true })
  organizations: OrgsListElem[];
}

export class CreateOrganizationResponseDto {
  @ApiProperty({ example: 'Organization created Successfully' })
  message: string;

  @ApiProperty()
  organization: Organization;
}

export class GetOrganizationBySlug {
  @ApiProperty({ example: 'Organization fetched Successfully' })
  message: string;

  @ApiProperty()
  organization: DetailedOrganization;
}

export class UpdateOrganizationResponseDto {
  @ApiProperty({ example: 'Organization updated Successfully' })
  message: string;

  @ApiProperty()
  organization: OrganizationWithUpdatedAt;
}

export class DeleteOrganizationResonseDto {
  @ApiProperty({ example: 'Deleted Organization' })
  message: string;

  @ApiProperty()
  organization: OrganizationDelete;
}
