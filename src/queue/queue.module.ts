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
    },
  }),
});

@Module({
  imports: [bullModule, BullModule.registerQueue({ name: 'default' })],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
