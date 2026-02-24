import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { log } from 'node:console';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch(() => {
  log('Failed to Start the Application');
});
