import { Module } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { OrgsController } from './orgs.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [OrgsController],
  providers: [OrgsService],
})
export class OrgsModule {}
