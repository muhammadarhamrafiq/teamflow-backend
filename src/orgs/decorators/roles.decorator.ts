import { SetMetadata } from '@nestjs/common';

const roleKey = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(roleKey, roles);
