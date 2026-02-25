import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';

@Module({
  imports: [PasswordService],
  exports: [PasswordService],
})
export class SecurityModule {}
