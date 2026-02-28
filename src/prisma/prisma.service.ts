import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    const url = configService.get<string>('DATABASE_URL');

    if (!url) {
      throw new Error('Database url not provided');
    }

    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }

  errorHandler(err: Error, customMessages: Record<string, string>) {
    if (err instanceof PrismaClientKnownRequestError) {
      this.handleClientKnownRequestError(err, customMessages);
    }

    throw new InternalServerErrorException(
      customMessages['default'] || 'An unexpected error occurred',
    );
  }

  handleClientKnownRequestError(
    err: PrismaClientKnownRequestError,
    customMessages: Record<string, string>,
  ) {
    const code = err.code;
    const message = customMessages[code] || 'An unexpected error occurred';
    switch (code) {
      case 'P2002':
        throw new ConflictException(message);
      case 'P2025':
        throw new NotFoundException(message);
      default:
        throw new InternalServerErrorException('Database Error');
    }
  }
}
