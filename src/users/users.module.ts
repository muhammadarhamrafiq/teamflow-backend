import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from 'src/commons/jwt/jwt.module';
import { SecurityModule } from 'src/commons/security/security.module';
import { MembershipModule } from 'src/membership/membership.module';

@Module({
  imports: [JwtModule, SecurityModule, MembershipModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
