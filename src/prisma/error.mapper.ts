import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

const returnInternalServerExpection = (err: PrismaClientKnownRequestError) => {
  Logger.error(err.message, err.stack);
  return new InternalServerErrorException('Database Exception Occured');
};

const handlePrismaKnownError = (
  err: PrismaClientKnownRequestError,
): HttpException => {
  const errorMap: Record<string, () => HttpException> = {
    P2002: () => {
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      return new ConflictException(`Duplicate record found for ${field}`);
    },
    P2003: () => {
      const field =
        (err.meta?.field_name as string) ||
        (err.meta?.target as string) ||
        'unknown field';
      return new BadRequestException(`Invalid refrence to ${field}`);
    },
    P2025: () => new NotFoundException('Record not found'),
  };

  const code = err.code;
  return errorMap[code]?.() || returnInternalServerExpection(err);
};

export { handlePrismaKnownError };
