import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';

const bullModule = BullModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    connection: {
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
      password: configService.get<string>('REDIS_PASSWORD') || undefined,
      tls:
        configService.get<string>('REDIS_TLS', 'false') === 'true'
          ? {}
          : undefined,

      offlineQueue: false,
      connectTimeout: 10000,
      maxRetriesPerRequest: null,

      retryStrategy: (times: number) => {
        if (times > 10) {
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    },
  }),
});

@Module({
  imports: [bullModule, BullModule.registerQueue({ name: 'default' })],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
