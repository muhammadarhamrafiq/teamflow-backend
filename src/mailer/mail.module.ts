import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from 'src/config/config.module';
import { QueueModule } from 'src/queue/queue.module';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [ConfigModule, QueueModule],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
