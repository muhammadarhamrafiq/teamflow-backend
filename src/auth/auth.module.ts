import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SecurityModule } from '../commons/security/security.module';
import { SessionService } from './services/sessions.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from 'src/commons/jwt/jwt.module';

@Module({
  imports: [SecurityModule, UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AuthModule {}
