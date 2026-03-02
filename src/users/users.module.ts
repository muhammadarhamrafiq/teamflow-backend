import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from 'src/commons/jwt/jwt.module';
import { SecurityModule } from 'src/commons/security/security.module';

@Module({
  imports: [JwtModule, SecurityModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
