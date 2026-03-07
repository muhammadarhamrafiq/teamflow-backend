import { Module } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { OrgsController } from './orgs.controller';
import { CloudinaryService } from 'src/commons/cloudinary/cloudinary.service';

@Module({
  controllers: [OrgsController],
  providers: [OrgsService, CloudinaryService],
})
export class OrgsModule {}
