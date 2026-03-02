import { SetMetadata } from '@nestjs/common';

export const Purpose = (purpose: string) => SetMetadata('purpose', purpose);
