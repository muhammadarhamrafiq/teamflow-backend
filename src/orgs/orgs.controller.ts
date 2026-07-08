import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { OrgsService } from './orgs.service';
import { RolesGuard } from '../commons/guards/roles.guard';

import { FileInterceptor } from '@nestjs/platform-express';

import { Roles } from '../commons/helpers/roles.decorator';
import { ApiAuth } from 'src/commons/helpers/api-auth.decorator';

import type { Request } from 'express';
import { CreateOrgDto } from './dto/create-org-dto';
import { UpdateOrgDto } from './dto/update-org-dto';
import {
  CreateOrganizationResponseDto,
  DeleteOrganizationResonseDto,
  GetOrganizationBySlug,
  GetOrganizationsResponseDto,
  UpdateOrganizationResponseDto,
} from './dto/responses-dto';

@ApiTags('Organization')
@ApiAuth()
@Controller({
  path: 'orgs',
  version: '1',
})
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}
  /**
   * Create Organization
   */
  @Post()
  @ApiResponse({ type: CreateOrganizationResponseDto })
  async create(
    @Body() createOrgDto: CreateOrgDto,
    @Req() req: Request,
  ): Promise<CreateOrganizationResponseDto> {
    const { id } = req.user!;
    const org = await this.orgsService.create(createOrgDto, id);
    return {
      message: 'Organization created successfully',
      organization: org,
    };
  }

  /**
   * Get All Organizations
   */
  @Get()
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiResponse({ type: GetOrganizationsResponseDto })
  async getOrgs(
    @Req() req: Request,
    @Query('search') search?: string,
  ): Promise<GetOrganizationsResponseDto> {
    const { id } = req.user!;
    const organizations = await this.orgsService.getOrgs(id, search);
    return {
      message: 'Feteched All organizations',
      organizations,
    };
  }

  /**
   * Get Organization By Slug
   */
  @Get(':slug')
  @ApiResponse({ type: GetOrganizationBySlug })
  async getOrg(
    @Req() req: Request,
    @Param('slug') slug: string,
  ): Promise<GetOrganizationBySlug> {
    const { id } = req.user!;
    const org = await this.orgsService.getOrg(slug, id);
    return {
      message: 'Organization fetched',
      organization: org,
    };
  }

  /**
   * Update Organization
   */
  @ApiResponse({ type: UpdateOrganizationResponseDto })
  @Patch(':orgId')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  async updateData(
    @Param('orgId') organizationId: string,
    @Body() updateOrgDto: UpdateOrgDto,
  ): Promise<UpdateOrganizationResponseDto> {
    const updatedOrg = await this.orgsService.updateData(
      organizationId,
      updateOrgDto,
    );
    return {
      message: 'Organization updated successfully',
      organization: updatedOrg,
    };
  }

  /**
   * Update Organization Logo
   */
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ type: UpdateOrganizationResponseDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Patch(':orgId/logo')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @UseInterceptors(FileInterceptor('logo'))
  async updateLogo(
    @Param('orgId') organizationId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
            errorMessage: 'Max upload size is 2MB',
          }),
          new FileTypeValidator({
            fileType: /(jpeg|jpg|png|webp)$/,
            errorMessage: 'Invalid file type',
          }),
        ],
      }),
    )
    logo: Express.Multer.File,
  ): Promise<UpdateOrganizationResponseDto> {
    const organization = await this.orgsService.updateLogo(
      organizationId,
      logo.buffer,
    );
    return {
      message: 'Logo updated successfully',
      organization,
    };
  }

  /**
   * Delete Organization
   */
  @ApiAuth()
  @ApiResponse({
    status: 200,
    type: DeleteOrganizationResonseDto,
  })
  @UseGuards(RolesGuard)
  @Delete(':orgId')
  @Roles('OWNER')
  async deleteOrg(
    @Param('orgId') organizationId: string,
  ): Promise<DeleteOrganizationResonseDto> {
    const organization = await this.orgsService.deleteOrg(organizationId);
    return {
      message: 'Organization deleted',
      organization,
    };
  }
}
