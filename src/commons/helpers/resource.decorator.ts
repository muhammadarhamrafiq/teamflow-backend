import { SetMetadata } from '@nestjs/common';

export interface ResourceIntegrityOptions {
  resource: 'project' | 'task' | 'comment';
  parent: 'organization' | 'project' | 'task';
  parentKey: string;
  resourceKey: string;
}

export const Resources = (options: ResourceIntegrityOptions) =>
  SetMetadata('resourceIntegrityOptions', options);
