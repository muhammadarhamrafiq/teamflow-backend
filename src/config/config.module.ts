import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestJSConfiModule } from '@nestjs/config';
import { validate } from './env.validation';

@Global()
@Module({
  imports: [
    NestJSConfiModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
  ],
  exports: [NestJSConfiModule],
})
export class ConfigModule {}
