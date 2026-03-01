import { Module } from '@nestjs/common';
import { JwtModule as NestJWTModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [ConfigModule, NestJWTModule.register({})],
  providers: [TokenService],
  exports: [TokenService],
})
export class JwtModule {}
