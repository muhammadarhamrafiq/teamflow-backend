import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Role } from 'src/generated/prisma/enums';

export class Organization {
  @ApiProperty({ example: 'a62ad1b2-3abe-43b7-8511-82e7d15e1811' })
  id: string;

  @ApiProperty({ example: 'Acme Inc' })
  name: string;

  @ApiProperty({ example: 'acme-inc' })
  slug: string;

  @ApiProperty({ example: 'https://domain.com/res' })
  logoUrl: string | null;

  @ApiProperty({ example: 'Organization description' })
  description: string | null;
}

export class OrganizationWithMyRole extends Organization {
  @ApiProperty({ example: 'ADMIN' })
  myRole: Role;
}

export class OrganizationWithUpdatedAt extends Organization {
  @ApiProperty({ example: '2026-03-29T17:27:36.061Z' })
  updatedAt: Date;
}

export class OrgsListElem extends OmitType(OrganizationWithMyRole, [
  'description',
]) {}
export class OrganizationDelete extends PickType(Organization, [
  'id',
  'name',
]) {}

export class ProjectsSummary {
  @ApiProperty({ example: 19 })
  totalProjects: number;

  @ApiProperty({ example: 2 })
  overDueProjects: number;

  @ApiProperty({ example: 12 })
  inProgressProjects: number;

  @ApiProperty({ example: 7 })
  completedProjects: number;
}

export class DetailedOrganization extends OrganizationWithMyRole {
  @ApiProperty()
  projectsSummary: ProjectsSummary;
}
