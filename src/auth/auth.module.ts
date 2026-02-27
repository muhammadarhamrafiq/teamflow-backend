import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SecurityModule } from '../commons/security/security.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './services/token.service';
import { SessionService } from './services/sessions.service';

@Module({
  imports: [SecurityModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, TokenService, SessionService],
})
export class AuthModule {}
