import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;
  constructor(private readonly configService: ConfigService) {
    this.saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
  }

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
