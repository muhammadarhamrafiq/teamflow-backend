import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

export function ApiAuth(options?: {
  bearer?: boolean;
  refresh?: boolean;
  access?: boolean;
}) {
  const decorators: ClassDecorator[] = [];
  if (options?.bearer ?? true) decorators.push(ApiBearerAuth());
  if (options?.refresh ?? true) decorators.push(ApiCookieAuth('refresh_token'));
  if (options?.access ?? true) decorators.push(ApiCookieAuth('access_token'));
  return applyDecorators(...decorators);
}
