import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

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
}
