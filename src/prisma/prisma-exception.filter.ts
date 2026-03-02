import {
  BadRequestException,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/client';

import { handlePrismaKnownError } from './error.mapper';

@Catch(
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown) {
    if (exception instanceof PrismaClientKnownRequestError) {
      throw handlePrismaKnownError(exception);
    }

    if (exception instanceof PrismaClientValidationError) {
      throw new BadRequestException(exception.message);
    }

    if (exception instanceof PrismaClientInitializationError) {
      throw new InternalServerErrorException('Database initialization failed');
    }

    if (exception instanceof PrismaClientRustPanicError) {
      throw new InternalServerErrorException('Database engine crashed');
    }

    if (exception instanceof PrismaClientUnknownRequestError) {
      throw new InternalServerErrorException('Unknown database error');
    }

    throw new InternalServerErrorException();
  }
}
