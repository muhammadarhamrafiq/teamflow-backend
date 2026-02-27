import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RateLimitingModule } from '../commons/rate-limiting-module/rate-limit.module';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ConfigModule, PrismaModule, RateLimitingModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
