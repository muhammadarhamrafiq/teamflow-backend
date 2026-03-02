import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import helmet from 'helmet';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();
  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('TeamFlow Backend API')
    .setVersion('1.0')
    .setDescription('API documentation for the TeamFlow backend')
    .addBearerAuth()
    .addCookieAuth('refresh_token', { type: 'apiKey' }, 'Refresh token')
    .addCookieAuth('access_token', { type: 'apiKey' }, 'Access token)')
    .build();

  const documentation = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentation);

  app.useGlobalFilters(new PrismaExceptionFilter());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch(() => {
  Logger.error('Failed to start the app');
});
