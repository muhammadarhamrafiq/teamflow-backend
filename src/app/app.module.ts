import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RateLimitingModule } from '../commons/rate-limiting-module/rate-limit.module';
import { AuthModule } from 'src/auth/auth.module';
import { OrgsModule } from 'src/orgs/orgs.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [
    PrismaModule,
    RateLimitingModule,
    AuthModule,
    OrgsModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
