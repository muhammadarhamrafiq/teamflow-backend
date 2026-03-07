import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  Min,
  Max,
  validateSync,
  IsNotEmpty,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsNotEmpty({
    message: 'DATABASE_URL is required and cannot be empty.',
  })
  DATABASE_URL: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  BCRYPT_SALT_ROUNDS: number;

  @IsNotEmpty({ message: 'JWT_ACTION_SECRET is required' })
  JWT_ACTION_SECRET: string;
  @IsNotEmpty({ message: 'JWT_ACCESS_SECRET is required' })
  JWT_ACCESS_SECRET: string;
  @IsNotEmpty({ message: 'JWT_REFRESH_SECRET is required' })
  JWT_REFRESH_SECRET: string;

  @IsNotEmpty({ message: 'RESEND_API_KEY is required to send emails' })
  RESEND_API_KEY: string;
  @IsNotEmpty({ message: 'EMAIL_DOMAIN is required' })
  EMAIL_DOMAIN: string;
  @IsNotEmpty({ message: 'FRONTEND_URL is required' })
  FRONTEND_URL: string;

  @IsNotEmpty({ message: 'REDIS_HOST is required' })
  REDIS_HOST: string;
  @IsNotEmpty({ message: 'REDIS_PORT is required' })
  REDIS_PORT: string;

  @IsNotEmpty({ message: 'CLOUDINARY_CLOUD_NAME is required' })
  CLOUDINARY_CLOUD_NAME: string;

  @IsNotEmpty({ message: 'CLOUDINARY_API_KEY is required' })
  CLOUDINARY_API_KEY: string;

  @IsNotEmpty({ message: 'CLOUDINARY_API_SECRET is required' })
  CLOUDINARY_API_SECRET: string;

  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  REDIS_PASSWORD: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
