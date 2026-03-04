import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/generated/prisma/enums';

const roleKey = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(roleKey, roles);
