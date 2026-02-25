import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RateLimitingModule } from 'src/commons/rate-limit.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule, PrismaModule, RateLimitingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
